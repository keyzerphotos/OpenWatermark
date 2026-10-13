/* OpenWatermark - Onzichtbaar watermerk (DCT)
 * Versie 1.0.0 - MIT-licentie
 */
(function () {
  'use strict';

  const BLOCK = 8;
  const COEFF_IDX = 20;
  const STRENGTH = 10.0;
  const REDUNDANCY = 3;
  const SEED = 987654321;

  function dct1d(input) {
    const out = new Float32Array(8);
    for (let k = 0; k < 8; k++) {
      let sum = 0;
      for (let n = 0; n < 8; n++) {
        sum += input[n] * Math.cos(((2 * n + 1) * k * Math.PI) / 16);
      }
      const c = k === 0 ? 1 / Math.SQRT2 : 1;
      out[k] = sum * c * 0.5;
    }
    return out;
  }

  function dct2d(block) {
    const temp = new Float32Array(64);
    const result = new Float32Array(64);
    for (let i = 0; i < 8; i++) {
      const row = new Float32Array(8);
      for (let j = 0; j < 8; j++) row[j] = block[i * 8 + j];
      const tr = dct1d(row);
      for (let j = 0; j < 8; j++) temp[i * 8 + j] = tr[j];
    }
    for (let j = 0; j < 8; j++) {
      const col = new Float32Array(8);
      for (let i = 0; i < 8; i++) col[i] = temp[i * 8 + j];
      const tr = dct1d(col);
      for (let i = 0; i < 8; i++) result[i * 8 + j] = tr[i];
    }
    return result;
  }

  function idct2d(block) {
    const temp = new Float32Array(64);
    const result = new Float32Array(64);
    for (let j = 0; j < 8; j++) {
      const col = new Float32Array(8);
      for (let i = 0; i < 8; i++) {
        const c = i === 0 ? 1 / Math.SQRT2 : 1;
        col[i] = block[i * 8 + j] * c;
      }
      for (let n = 0; n < 8; n++) {
        let sum = 0;
        for (let k = 0; k < 8; k++) {
          sum += col[k] * Math.cos(((2 * n + 1) * k * Math.PI) / 16);
        }
        temp[n * 8 + j] = sum * 0.5;
      }
    }
    for (let i = 0; i < 8; i++) {
      const row = new Float32Array(8);
      for (let j = 0; j < 8; j++) {
        const c = j === 0 ? 1 / Math.SQRT2 : 1;
        row[j] = temp[i * 8 + j] * c;
      }
      for (let n = 0; n < 8; n++) {
        let sum = 0;
        for (let k = 0; k < 8; k++) {
          sum += row[k] * Math.cos(((2 * n + 1) * k * Math.PI) / 16);
        }
        result[i * 8 + n] = sum * 0.5;
      }
    }
    return result;
  }

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

  function shuffledIndices(total) {
    const arr = new Uint32Array(total);
    for (let i = 0; i < total; i++) arr[i] = i;
    let s = SEED;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function readBlockLuma(data, width, blockCol, blockRow) {
    const block = new Float32Array(64);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const px = blockCol * 8 + x;
        const py = blockRow * 8 + y;
        const idx = (py * width + px) * 4;
        block[y * 8 + x] =
          0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
    }
    return block;
  }

  function writeBlockLuma(data, width, blockCol, blockRow, origLuma, newLuma) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const px = blockCol * 8 + x;
        const py = blockRow * 8 + y;
        const idx = (py * width + px) * 4;
        const delta = newLuma[y * 8 + x] - origLuma[y * 8 + x];
        data[idx]     = Math.max(0, Math.min(255, data[idx] + delta));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + delta));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + delta));
      }
    }
  }

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
      throw new Error('Afbeelding is te klein voor een robuust watermerk.');
    }

    for (let bitIdx = 0; bitIdx < bits.length; bitIdx++) {
      const bit = bits[bitIdx];
      for (let r = 0; r < REDUNDANCY; r++) {
        const blockNum = order[bitIdx * REDUNDANCY + r];
        const blockCol = blockNum % cols;
        const blockRow = Math.floor(blockNum / cols);

        const luma = readBlockLuma(data, canvas.width, blockCol, blockRow);
        const dctBlock = dct2d(luma);
        const current = dctBlock[COEFF_IDX];
        if (bit === 1) {
          dctBlock[COEFF_IDX] = Math.abs(current) + STRENGTH;
        } else {
          dctBlock[COEFF_IDX] = -Math.abs(current) - STRENGTH;
        }
        const idctBlock = idct2d(dctBlock);
        writeBlockLuma(data, canvas.width, blockCol, blockRow, luma, idctBlock);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
  }

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
        const blockRow = Math.floor(blockNum / cols);
        const luma = readBlockLuma(data, canvas.width, blockCol, blockRow);
        const dctBlock = dct2d(luma);
        if (dctBlock[COEFF_IDX] > 0) votes++;
      }
      const extracted = votes > REDUNDANCY / 2 ? 1 : 0;
      if (extracted === expected[bitIdx]) matches++;
    }
    const confidence = matches / expected.length;
    return { match: confidence > 0.75, confidence };
  }

  window.OpenWatermarkInvisible = { embed, verify };
})();
