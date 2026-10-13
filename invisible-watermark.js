/* OpenWatermark — Onzichtbaar watermerk (DCT)
 * Gebaseerd op het principe van frequentie-domein watermerking.
 * Werkt volledig in de browser, geen server nodig.
 */
(function () {
  'use strict';

  // 8x8 blokken voor DCT
  const BLOCK = 8;
  const DCT_SIZE = BLOCK * BLOCK;

  // Vooraf berekende cosinustabel
  const COS = new Float32Array(DCT_SIZE);
  for (let i = 0; i < DCT_SIZE; i++) {
    COS[i] = Math.cos(((2 * (i % 8) + 1) * Math.PI * (Math.floor(i / 8))) / 16);
  }

  // 1D DCT op een vector
  function dct1d(input) {
    const output = new Float32Array(8);
    for (let k = 0; k < 8; k++) {
      let sum = 0;
      for (let n = 0; n < 8; n++) {
        sum += input[n] * Math.cos(((2 * n + 1) * k * Math.PI) / 16);
      }
      const c = k === 0 ? 1 / Math.sqrt(2) : 1;
      output[k] = sum * c * 0.5;
    }
    return output;
  }

  // 2D DCT op een 8x8 blok
  function dct2d(block) {
    const temp = new Float32Array(64);
    const result = new Float32Array(64);

    // Rijen
    for (let i = 0; i < 8; i++) {
      const row = new Float32Array(8);
      for (let j = 0; j < 8; j++) row[j] = block[i * 8 + j];
      const transformed = dct1d(row);
      for (let j = 0; j < 8; j++) temp[i * 8 + j] = transformed[j];
    }

    // Kolommen
    for (let j = 0; j < 8; j++) {
      const col = new Float32Array(8);
      for (let i = 0; i < 8; i++) col[i] = temp[i * 8 + j];
      const transformed = dct1d(col);
      for (let i = 0; i < 8; i++) result[i * 8 + j] = transformed[i];
    }

    return result;
  }

  // Inverse 2D DCT
  function idct2d(block) {
    const temp = new Float32Array(64);
    const result = new Float32Array(64);

    for (let j = 0; j < 8; j++) {
      const col = new Float32Array(8);
      for (let i = 0; i < 8; i++) {
        const c = i === 0 ? 1 / Math.sqrt(2) : 1;
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
        const c = j === 0 ? 1 / Math.sqrt(2) : 1;
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

  // SHA-256 hash van een string → 64-bit digest
  async function hashPayload(payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);

    // Neem eerste 8 bytes (64 bits)
    const bits = [];
    for (let i = 0; i < 8; i++) {
      for (let b = 7; b >= 0; b--) {
        bits.push((hashArray[i] >> b) & 1);
      }
    }
    return bits; // 64 bits
  }

  // Seed-gebaseerde PRNG voor deterministische blokselectie
  function seededRandom(seed) {
    let state = seed;
    return function () {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  /**
   * Voeg een onzichtbaar watermerk toe aan een afbeelding
   * @param {HTMLImageElement|HTMLCanvasElement} source
   * @param {string} payload - Unieke code (bijv. e-mail + datum)
   * @returns {Promise<Blob>} - Afbeelding met onzichtbaar watermerk
   */
  async function embedInvisible(source, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = source.width || source.naturalWidth;
    canvas.height = source.height || source.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Haal de bits op
    const bits = await hashPayload(payload);

    // Bepaal aantal blokken
    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    // Seed voor deterministische selectie
    const seed = 12345;
    const rng = seededRandom(seed);

    // Verdeel bits over de blokken (herhaling voor robuustheid)
    const redundancy = 3;
    const selectedBlocks = [];

    for (let i = 0; i < totalBlocks; i++) {
      selectedBlocks.push(i);
    }

    // Fisher-Yates shuffle met seed
    for (let i = selectedBlocks.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [selectedBlocks[i], selectedBlocks[j]] = [selectedBlocks[j], selectedBlocks[i]];
    }

    // Aantal blokken dat we nodig hebben
    const blocksNeeded = bits.length * redundancy;
    const blocksToUse = selectedBlocks.slice(0, Math.min(blocksNeeded, totalBlocks));

    // Embed elk bit in een blok
    for (let bitIdx = 0; bitIdx < bits.length; bitIdx++) {
      const bit = bits[bitIdx];

      for (let r = 0; r < redundancy; r++) {
        const blockIndex = bitIdx * redundancy + r;
        if (blockIndex >= blocksToUse.length) break;

        const blockNum = blocksToUse[blockIndex];
        const blockCol = blockNum % cols;
        const blockRow = Math.floor(blockNum / cols);

        // Haal 8x8 blok op uit luminance (Y = 0.299R + 0.587G + 0.114B)
        const block = new Float32Array(64);
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const px = blockCol * 8 + x;
            const py = blockRow * 8 + y;
            const idx = (py * canvas.width + px) * 4;
            // Luminance
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            block[y * 8 + x] = lum;
          }
        }

        // DCT
        const dctBlock = dct2d(block);

        // Embed bit in middenfrequentie coëfficiënt
        // Gebruik index 20 (een typische middenfrequentie positie)
        const coeffIdx = 20;
        const strength = 8.0; // aanpasbaar: hoger = robuuster maar meer zichtbaar

        if (bit === 1) {
          dctBlock[coeffIdx] = Math.abs(dctBlock[coeffIdx]) + strength;
        } else {
          dctBlock[coeffIdx] = -Math.abs(dctBlock[coeffIdx]) - strength;
        }

        // IDCT
        const idctBlock = idct2d(dctBlock);

        // Terug naar pixels
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const px = blockCol * 8 + x;
            const py = blockRow * 8 + y;
            const idx = (py * canvas.width + px) * 4;

            const origLum = block[y * 8 + x];
            const newLum = idctBlock[y * 8 + x];
            const delta = newLum - origLum;

            data[idx] = Math.max(0, Math.min(255, data[idx] + delta));
            data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + delta));
            data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + delta));
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });
  }

  /**
   * Verifieer of een afbeelding een bepaald watermerk bevat
   * @param {HTMLImageElement|HTMLCanvasElement} source
   * @param {string} payload - De payload om te controleren
   * @returns {Promise<{match: boolean, confidence: number}>}
   */
  async function verifyInvisible(source, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = source.width || source.naturalWidth;
    canvas.height = source.height || source.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const expectedBits = await hashPayload(payload);

    const cols = Math.floor(canvas.width / BLOCK);
    const rows = Math.floor(canvas.height / BLOCK);
    const totalBlocks = cols * rows;

    const seed = 12345;
    const rng = seededRandom(seed);

    const selectedBlocks = [];
    for (let i = 0; i < totalBlocks; i++) selectedBlocks.push(i);

    for (let i = selectedBlocks.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [selectedBlocks[i], selectedBlocks[j]] = [selectedBlocks[j], selectedBlocks[i]];
    }

    const redundancy = 3;
    const bitsNeeded = expectedBits.length * redundancy;
    const blocksToUse = selectedBlocks.slice(0, Math.min(bitsNeeded, totalBlocks));

    // Extraheer bits
    const extractedBits = [];
    for (let bitIdx = 0; bitIdx < expectedBits.length; bitIdx++) {
      const votes = [];

      for (let r = 0; r < redundancy; r++) {
        const blockIndex = bitIdx * redundancy + r;
        if (blockIndex >= blocksToUse.length) break;

        const blockNum = blocksToUse[blockIndex];
        const blockCol = blockNum % cols;
        const blockRow = Math.floor(blockNum / cols);

        const block = new Float32Array(64);
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const px = blockCol * 8 + x;
            const py = blockRow * 8 + y;
            const idx = (py * canvas.width + px) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            block[y * 8 + x] = lum;
          }
        }

        const dctBlock = dct2d(block);
        const coeffIdx = 20;
        votes.push(dctBlock[coeffIdx] > 0 ? 1 : 0);
      }

      // Majority vote
      const ones = votes.filter(v => v === 1).length;
      extractedBits.push(ones > votes.length / 2 ? 1 : 0);
    }

    // Vergelijk
    let matches = 0;
    for (let i = 0; i < expectedBits.length; i++) {
      if (extractedBits[i] === expectedBits[i]) matches++;
    }

    const confidence = matches / expectedBits.length;

    return {
      match: confidence > 0.75,
      confidence: confidence
    };
  }

  // Exporteer naar window
  window.OpenWatermarkInvisible = {
    embed: embedInvisible,
    verify: verifyInvisible
  };
})();
