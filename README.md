# OpenWatermark

**Protect photographers. Challenge AI watermark removal. Keep creative work yours.**

OpenWatermark is a free, open-source web app that watermarks your photos **entirely in your browser**. Nothing is uploaded, there are no accounts and no tracking — your photos never leave your device.

**▶ Live demo: [keyzerphotos.github.io/OpenWatermark](https://keyzerphotos.github.io/OpenWatermark/)**

![Version](https://img.shields.io/badge/app-2.5.0-blue) ![Invisible engine](https://img.shields.io/badge/invisible%20engine-2.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## What it does

### Visible watermark
- Your **name/text** or your own **logo** (PNG with transparency works best), tiled across the whole photo — a pattern is far harder to remove cleanly than a single corner logo.
- Sliders for size, opacity, rotation and spacing, with a live preview.
- Two presets: **Customer preview** (max 1600 px, JPEG 82%) for online galleries, and **Full** (original size, JPEG 92%).
- Batch up to **100 photos** at once; multiple photos download as a single ZIP.
- Custom filename suffix (e.g. `_OpenWatermark`).

### Invisible watermark (signed)
On top of the visible layer, you can embed an **invisible DCT watermark** carrying your personal verification code:

- The code is **signed with your own secret key** (HMAC-SHA-256, 128-bit signature). The key is generated once, in your browser, and stored only on your device.
- Because the block positions are derived from your key, someone who finds your photo cannot forge your mark or cleanly overwrite it — in testing, the original signature still verified at 99–100% after an overwrite attempt.
- It survives normal JPEG recompression (verified at quality 95 and 82 in our tests).

### Verification
The app includes a **verification tool**: pick a photo you found online, enter your code and secret key, and it tells you whether that photo carries your signature — even if the visible watermark was removed. Photos marked with older versions (1.x) are still recognised through a legacy check.

## Honest limitations

No watermark is magic, and we'd rather say so up front:

- A visible watermark makes removal **harder, not impossible**. Determined editing or AI tools can still remove it, usually at the cost of image quality.
- The invisible layer does **not** survive resizing, cropping, heavy compression or AI editing. It is an extra layer of evidence, not a lock.
- A successful verification is a strong indication, not absolute legal proof. For cryptographic provenance, look at **C2PA** content credentials, which modern cameras increasingly support.

## Your secret key

- Your secret key signs your code. **Anyone with your key can create watermarks "from you"** — keep it private.
- If you generate a new key, older photos can only be verified with the old key. Keep a copy of your key somewhere safe; it lives only in your browser's local storage and is never sent anywhere.

## Privacy

- All processing happens locally in your browser. No uploads, no analytics, no cookies.
- Your logo, code and secret key are stored in your browser's `localStorage` on your device only.
- The only external request the page makes is the JSZip library from a CDN, used to bundle multi-photo downloads.

## Run it yourself

OpenWatermark is three static files — no build step:

```bash
git clone https://github.com/keyzerphotos/OpenWatermark.git
cd OpenWatermark
python3 -m http.server 8000
# open http://localhost:8000
```

Serve it over HTTPS or `localhost`: the invisible watermark uses the Web Crypto API (`crypto.subtle`), which browsers only expose in secure contexts. The hosted demo on GitHub Pages works out of the box.

| File | Purpose |
| --- | --- |
| `index.html` | UI and styling |
| `app.js` | App logic (v2.5.0) |
| `invisible-watermark.js` | Invisible DCT watermark engine (v2.0.0) |

## Tech

Vanilla HTML/CSS/JavaScript — no framework, no build. The invisible watermark works on 8×8 DCT blocks in the luma channel, signing mid-frequency coefficients, with each signature bit embedded 3× for robustness.

## Contributing

Issues and pull requests are welcome. If you test the invisible watermark against a platform or edit we haven't tried, sharing the result (image size, what was done to it, verification confidence) helps more than anything.

## License

[MIT](LICENSE) — © 2026 Alex Keyzer / [Keyzer.photos](https://keyzer.photos)

---

*Built by a photographer, for photographers. The app UI is currently in Dutch; an English version is on the wishlist.*
