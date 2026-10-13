/* OpenWatermark - Onzichtbaar watermerk (DCT)
 * Versie 1.1.0 - MIT-licentie
 *
 * Verbetert t.o.v. 1.0.0:
 *  - Wiskundig correcte IDCT (geen beeldverandering meer)
 *  - Robuustere verificatie
 *  - Duidelijke statusmelding voor de UI
 */

(function () {
  'use strict';

  const BLOCK = 8;
  // Meerdere coëfficiënten in mid-frequency voor robuustheid
  const COEFFS = [20, 21, 22, 27, 28, 29, 34, 35, 36];
  const STRENGTH = 12.0;
  const REDUNDANCY = 3;
  const SEED = 987654321;

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

  // ---------- Payload → bits ----------
  async function payloadToBits(payload) {
    const data = new TextEncoder().encode(payload);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hash = new Uint8Array(buf);
    const bits = new Uint8Array(64);
    for (let i = 0; i < 8; i++) {
      for (let b = 0; b < 8; b++) {
        bits[i * 8 + b] = (hash[i] >> (7 - b)) & 1;
      }
    }
    return bits;
  }

  // ---------- Blockvolgorde ----------
  function shuffledIndices(total) {
    const arr = new Uint32Array(total);
    for (let i = 0; i < total; i++) arr[i] = i;
    let s = SEED;
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

  // ---------- Embed ----------
  async function embed(source, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = source.naturalWidth || source.width;
    canvas.height = source.naturalHeight || source.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const bits = await payloadToBits(payload);
    const order = shuffledIndices(totalBlocks);
    const blocksNeeded = bits.length * REDUNDANCY;

    if (blocksNeeded > totalBlocks) {
      throw new Error('Afbeelding is te klein voor een robuust watermerk (minimaal ~128×128 px).');
    }

    for (let bitIdx = 0; bitIdx < bits.length; bitIdx++) {
      const bit = bits[bitIdx];
      for (let r = 0; r < REDUNDANCY; r++) {
        const blockNum = order[bitIdx * REDUNDANCY + r];
        const blockCol = blockNum % cols;
        const blockRow = (blockNum - blockCol) / cols;

        const luma = readBlockLuma(data, canvas.width, blockCol, blockRow);
        const dctBlock = dct2d(luma);

        // Versterk dezelfde coëfficiënten in alle posities
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
        writeBlockLuma(data, canvas.width, blockCol, blockRow, luma, idctBlock);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
  }

  // ---------- Verify ----------
  async function verify(source, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = source.naturalWidth || source.width;
    canvas.height = source.naturalHeight || source.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const expected = await payloadToBits(payload);
    const order = shuffledIndices(totalBlocks);
    const blocksNeeded = expected.length * REDUNDANCY;

    if (blocksNeeded > totalBlocks) return { match: false, confidence: 0 };

    let matches = 0;
    for (let bitIdx = 0; bitIdx < expected.length; bitIdx++) {
      let votes = 0;
      for (let r = 0; r < REDUNDANCY; r++) {
        const blockNum = order[bitIdx * REDUNDANCY + r];
        const blockCol = blockNum % cols;
        const blockRow = (blockNum - blockCol) / cols;
        const luma = readBlockLuma(data, canvas.width, blockCol, blockRow);
        const dctBlock = dct2d(luma);

        // Stem op basis van som van alle COEFFS
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
    const confidence = matches / expected.length;
    return { match: confidence > 0.75, confidence };
  }

  // ---------- Publieke API ----------
  window.OpenWatermarkInvisible = { embed, verify, version: '1.1.0' };
})();
