/* OpenWatermark - Onzichtbaar watermerk (DCT)
 * Versie 2.0.0 - MIT-licentie
 *
 * Verbetert t.o.v. 1.1.0:
 *  - Sleutelgebonden: de payload wordt ondertekend met HMAC-SHA-256 en een
 *    geheime sleutel van de gebruiker. Zonder die sleutel kan niemand het
 *    watermerk namaken of gericht overschrijven.
 *  - 128 bits payload-handtekening (was: afgeknotte 64-bit SHA-256-hash).
 *  - De blokvolgorde wordt afgeleid uit sleutel + payload (was: vaste,
 *    publieke seed 987654321 voor iedereen).
 *  - embed() werkt direct op een canvas en codeert maar één keer, met de
 *    door de aanroeper gekozen JPEG-kwaliteit (was: altijd een extra
 *    volledige JPEG-encode op 0,95 achteraf).
 *  - verifyLegacy() controleert foto's die nog met versie 1.x zijn gemaakt.
 *
 * Eerlijke grens: dit blijft een extra laag, geen slot. Wie de afbeelding
 * zwaar bewerkt, verkleint of bijsnijdt, kan de laag nog steeds breken.
 * Wat versie 2 wél wegneemt, is stille vervalsing: een watermerk met jouw
 * code erop kan alleen ontstaan met jouw geheime sleutel.
 */

(function () {
  'use strict';

  const BLOCK = 8;
  // Meerdere coëfficiënten in mid-frequency voor robuustheid
  const COEFFS = [20, 21, 22, 27, 28, 29, 34, 35, 36];
  const STRENGTH = 12.0;
  const REDUNDANCY = 3;

  // v2: 16 bytes HMAC-handtekening = 128 bits
  const SIGNATURE_BYTES = 16;
  // v1 (legacy): vaste seed en 8 bytes SHA-256 = 64 bits
  const LEGACY_SEED = 987654321;
  const LEGACY_BYTES = 8;

  // ---------- DCT (correcte orthogonale variant) ----------
  // Voor 1D DCT-II: X[k] = c(k)/2 * sum_n x[n] * cos((2n+1)k*pi/16)
  // Voor 1D IDCT:   x[n] = sum_k c(k)/2 * X[k] * cos((2n+1)k*pi/16)
  // Met c(0) = 1/sqrt(2), c(k>0) = 1.
  // De factor 1/2 in beide richtingen geeft 1D-orthonormaliteit.

  const C = new Float32Array(8);
  for (let k = 0; k < 8; k++) C[k] = k === 0 ? 1 / Math.SQRT2 : 1;

  const COS = new Float32Array(64);
  for (let n = 0; n < 8; n++)
    for (let k = 0; k < 8; k++)
      COS[n * 8 + k] = Math.cos(((2 * n + 1) * k * Math.PI) / 16);

  function dct1d(input, out) {
    for (let k = 0; k < 8; k++) {
      let sum = 0;
      for (let n = 0; n < 8; n++) sum += input[n] * COS[n * 8 + k];
      out[k] = 0.5 * C[k] * sum;
    }
  }

  function idct1d(input, out) {
    for (let n = 0; n < 8; n++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) sum += C[k] * input[k] * COS[n * 8 + k];
      out[n] = 0.5 * sum;
    }
  }

  const tmpIn = new Float32Array(8);
  const tmpOut = new Float32Array(8);
  const tmpCol = new Float32Array(64);
  const tmpRes = new Float32Array(64);

  function dct2d(block) {
    // rijen
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) tmpIn[j] = block[i * 8 + j];
      dct1d(tmpIn, tmpOut);
      for (let j = 0; j < 8; j++) tmpCol[i * 8 + j] = tmpOut[j];
    }
    // kolommen
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) tmpIn[i] = tmpCol[i * 8 + j];
      dct1d(tmpIn, tmpOut);
      for (let i = 0; i < 8; i++) tmpRes[i * 8 + j] = tmpOut[i];
    }
    return tmpRes;
  }

  const idctCol = new Float32Array(64);
  const idctRes = new Float32Array(64);

  function idct2d(block) {
    // kolommen
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) tmpIn[i] = block[i * 8 + j];
      idct1d(tmpIn, tmpOut);
      for (let i = 0; i < 8; i++) idctCol[i * 8 + j] = tmpOut[i];
    }
    // rijen
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) tmpIn[j] = idctCol[i * 8 + j];
      idct1d(tmpIn, tmpOut);
      for (let j = 0; j < 8; j++) idctRes[i * 8 + j] = tmpOut[j];
    }
    return idctRes;
  }

  // ---------- Sleutel, handtekening en blokvolgorde ----------
  function bytesToBits(bytes, count) {
    const bits = new Uint8Array(count * 8);
    for (let i = 0; i < count; i++) {
      for (let b = 0; b < 8; b++) {
        bits[i * 8 + b] = (bytes[i] >> (7 - b)) & 1;
      }
    }
    return bits;
  }

  async function hmac(secret, message) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
    return new Uint8Array(sig);
  }

  // v2-handtekening: HMAC-SHA-256(sleutel, domein + payload), eerste 16 bytes.
  async function signatureBits(payload, secret) {
    const sig = await hmac(secret, 'OpenWatermark-v2:' + payload);
    return bytesToBits(sig, SIGNATURE_BYTES);
  }

  // v2-blokvolgorde: seed uit een aparte HMAC over sleutel + payload,
  // zodat de posities per gebruiker en per code verschillen.
  async function signatureSeed(payload, secret) {
    const seedBytes = await hmac(secret, 'OpenWatermark-v2-volgorde:' + payload);
    return ((seedBytes[0] << 24) | (seedBytes[1] << 16) | (seedBytes[2] << 8) | seedBytes[3]) >>> 0;
  }

  // v1 (legacy): kale SHA-256 van de payload, eerste 8 bytes.
  async function legacyBits(payload) {
    const data = new TextEncoder().encode(payload);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return bytesToBits(new Uint8Array(buf), LEGACY_BYTES);
  }

  function shuffledIndices(total, seed) {
    const arr = new Uint32Array(total);
    for (let i = 0; i < total; i++) arr[i] = i;
    let s = seed >>> 0;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // ---------- Blokken lezen/schrijven ----------
  function readBlockLuma(data, width, blockCol, blockRow) {
    const block = new Float32Array(64);
    const ox = blockCol * 8;
    const oy = blockRow * 8;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const px = ox + x;
        const py = oy + y;
        const idx = (py * width + px) * 4;
        block[y * 8 + x] =
          0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
    }
    return block;
  }

  function writeBlockLuma(data, width, blockCol, blockRow, origLuma, newLuma) {
    const ox = blockCol * 8;
    const oy = blockRow * 8;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const px = ox + x;
        const py = oy + y;
        const idx = (py * width + px) * 4;
        const delta = newLuma[y * 8 + x] - origLuma[y * 8 + x];
        data[idx] = Math.max(0, Math.min(255, data[idx] + delta));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + delta));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + delta));
      }
    }
  }

  // Haal een bewerkbaar canvas + ImageData op uit een <img> of <canvas>.
  // Een meegegeven canvas wordt in-place bewerkt: geen extra decode/encode.
  function getWorkingCanvas(source) {
    if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
      const ctx = source.getContext('2d', { willReadFrequently: true });
      return { canvas: source, ctx, own: false };
    }
    const canvas = document.createElement('canvas');
    canvas.width = source.naturalWidth || source.width;
    canvas.height = source.naturalHeight || source.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    return { canvas, ctx, own: true };
  }

  function embedBits(data, width, height, bits, order) {
    const cols = Math.floor(width / BLOCK);
    for (let bitIdx = 0; bitIdx < bits.length; bitIdx++) {
      const bit = bits[bitIdx];
      for (let r = 0; r < REDUNDANCY; r++) {
        const blockNum = order[bitIdx * REDUNDANCY + r];
        const blockCol = blockNum % cols;
        const blockRow = (blockNum - blockCol) / cols;

        const luma = readBlockLuma(data, width, blockCol, blockRow);
        const dctBlock = dct2d(luma);

        // Zet dezelfde coëfficiënten in alle posities op hetzelfde teken
        for (let ci = 0; ci < COEFFS.length; ci++) {
          const idx = COEFFS[ci];
          const current = dctBlock[idx];
          if (bit === 1) {
            dctBlock[idx] = Math.abs(current) + STRENGTH;
          } else {
            dctBlock[idx] = -Math.abs(current) - STRENGTH;
          }
        }

        const idctBlock = idct2d(dctBlock);
        writeBlockLuma(data, width, blockCol, blockRow, luma, idctBlock);
      }
    }
  }

  function extractConfidence(data, width, height, expected, order) {
    const cols = Math.floor(width / BLOCK);
    let matches = 0;
    for (let bitIdx = 0; bitIdx < expected.length; bitIdx++) {
      let votes = 0;
      for (let r = 0; r < REDUNDANCY; r++) {
        const blockNum = order[bitIdx * REDUNDANCY + r];
        const blockCol = blockNum % cols;
        const blockRow = (blockNum - blockCol) / cols;
        const luma = readBlockLuma(data, width, blockCol, blockRow);
        const dctBlock = dct2d(luma);

        let posSum = 0, negSum = 0;
        for (let ci = 0; ci < COEFFS.length; ci++) {
          const v = dctBlock[COEFFS[ci]];
          if (v > 0) posSum += v; else negSum -= v;
        }
        if (posSum > negSum) votes++;
      }
      const extracted = votes > REDUNDANCY / 2 ? 1 : 0;
      if (extracted === expected[bitIdx]) matches++;
    }
    return matches / expected.length;
  }

  function assertUsable(payload, secret) {
    if (!payload || !String(payload).trim()) {
      throw new Error('Verificatiecode is leeg.');
    }
    if (!secret || !String(secret).trim()) {
      throw new Error('Geheime sleutel ontbreekt. Zonder sleutel kan er geen ondertekend watermerk worden ingebed.');
    }
  }

  // ---------- Embed ----------
  // source: <img> of <canvas>. Een canvas wordt in-place bewerkt en daarna
  // één keer geëncodeerd met de opgegeven kwaliteit (standaard 0,92).
  async function embed(source, payload, secret, quality) {
    assertUsable(payload, secret);
    const q = typeof quality === 'number' ? quality : 0.92;

    const { canvas, ctx } = getWorkingCanvas(source);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const bits = await signatureBits(payload, secret);
    const blocksNeeded = bits.length * REDUNDANCY;
    if (blocksNeeded > totalBlocks) {
      throw new Error('Afbeelding is te klein voor een robuust watermerk (minimaal ~160×160 px).');
    }

    const order = shuffledIndices(totalBlocks, await signatureSeed(payload, secret));
    embedBits(imageData.data, canvas.width, canvas.height, bits, order);

    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));
  }

  // ---------- Verify (v2) ----------
  async function verify(source, payload, secret) {
    assertUsable(payload, secret);
    const { canvas, ctx } = getWorkingCanvas(source);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const expected = await signatureBits(payload, secret);
    if (expected.length * REDUNDANCY > totalBlocks) return { match: false, confidence: 0, legacy: false };

    const order = shuffledIndices(totalBlocks, await signatureSeed(payload, secret));
    const confidence = extractConfidence(imageData.data, canvas.width, canvas.height, expected, order);
    return { match: confidence > 0.75, confidence, legacy: false };
  }

  // ---------- Verify (legacy v1, alleen lezen) ----------
  // Voor foto's die met OpenWatermark 1.x / app 2.4.0 of eerder zijn gemaakt:
  // vaste seed, kale SHA-256, 64 bits. Zwakker, maar zo blijven oude foto's
  // controleerbaar.
  async function verifyLegacy(source, payload) {
    if (!payload || !String(payload).trim()) {
      throw new Error('Verificatiecode is leeg.');
    }
    const { canvas, ctx } = getWorkingCanvas(source);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const expected = await legacyBits(payload);
    if (expected.length * REDUNDANCY > totalBlocks) return { match: false, confidence: 0, legacy: true };

    const order = shuffledIndices(totalBlocks, LEGACY_SEED);
    const confidence = extractConfidence(imageData.data, canvas.width, canvas.height, expected, order);
    return { match: confidence > 0.75, confidence, legacy: true };
  }

  // ---------- Publieke API ----------
  window.OpenWatermarkInvisible = { embed, verify, verifyLegacy, version: '2.0.0' };
})();
