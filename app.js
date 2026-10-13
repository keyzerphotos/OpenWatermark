/* OpenWatermark — app.js
 * Versie 0.4.0 · MIT-licentie
 */
(function () {
  'use strict';

  // ============================================================
  //  VERTALINGEN
  // ============================================================
  const TRANSLATIONS = {
    nl: {
      subtitle: "Bescherm je foto's met je eigen logo. Alles lokaal in je browser.",
      photos_title: "Foto's",
      photos_drop: "Sleep of tik om foto's te kiezen",
      photos_hint: "meerdere foto's mogelijk",
      logo_title: "Jouw logo",
      logo_drop: "Sleep of tik om je logo te kiezen",
      logo_hint: "PNG met transparante achtergrond werkt het best",
      logo_ready: "Klaar voor gebruik",
      logo_change: "Wijzigen",
      settings_title: "Instellingen",
      set_size: "Logogrootte",
      set_opacity: "Transparantie",
      set_rotation: "Rotatie",
      set_spacing: "Afstand",
      set_payload: "Verificatiecode",
      set_payload_hint: "bv. jouw@email.nl",
      result_title: "Resultaat",
      result_preview: "Voorbeeld (eerste foto)",
      result_download: "Download alle foto's (ZIP)",
      result_reset: "Alles wissen",
      result_verify: "Controleer onzichtbaar watermerk",
      notice_strong: "Eerlijk:",
      notice_text: " een zichtbaar watermerk maakt verwijdering lastiger, maar niet onmogelijk. De onzichtbare laag overleeft JPEG-compressie en verkleining, maar is geen absolute garantie. Voor echte herkomstbescherming is C2PA-metadata nodig — dat zit al in moderne camera's zoals Nikon Z9 en Canon R5 Mark II.",
      footer_text: "OpenWatermark · Open source op",
      footer_privacy: "Je foto's blijven op je toestel. Niets wordt verstuurd.",
      max_photos: (max, skipped) => `Maximaal ${max} foto's per keer. ${skipped} overgeslagen.`,
      photos_loaded: (n) => `${n} foto('s) geladen.`,
      logo_loaded: "Logo geladen.",
      logo_must_be_image: "Logo moet een afbeelding zijn.",
      logo_load_error: "Logo kon niet geladen worden.",
      photo_load_error: "Foto kon niet geladen worden.",
      processing_one: (i, n) => `Foto ${i} van ${n}...`,
      creating_zip: "ZIP maken...",
      done_zip: (n) => `Klaar! ${n} foto('s) gedownload als ZIP.`,
      error_prefix: "Fout: ",
      preview_error: "Fout bij voorbeeld: ",
      no_jszip: "ZIP-bibliotheek kon niet geladen worden. Controleer je internetverbinding.",
      too_many: (max) => `Maximaal ${max} foto's per keer.`,
      too_small: "Deze foto is te klein voor een robuust onzichtbaar watermerk.",
      verify_match: (c) => `Onzichtbaar watermerk gevonden (${Math.round(c * 100)}% overeenkomst).`,
      verify_no_match: (c) => `Geen overeenkomst gevonden (${Math.round(c * 100)}%).`,
      verify_prompt: "Laad eerst een foto en vul een verificatiecode in.",
    },
    en: {
      subtitle: "Protect your photos with your own logo. Everything local in your browser.",
      photos_title: "Photos",
      photos_drop: "Drag or tap to choose photos",
      photos_hint: "multiple photos allowed",
      logo_title: "Your logo",
      logo_drop: "Drag or tap to choose your logo",
      logo_hint: "PNG with transparent background works best",
      logo_ready: "Ready to use",
      logo_change: "Change",
      settings_title: "Settings",
      set_size: "Logo size",
      set_opacity: "Opacity",
      set_rotation: "Rotation",
      set_spacing: "Spacing",
      set_payload: "Verification code",
      set_payload_hint: "e.g. your@email.com",
      result_title: "Result",
      result_preview: "Preview (first photo)",
      result_download: "Download all photos (ZIP)",
      result_reset: "Clear all",
      result_verify: "Check invisible watermark",
      notice_strong: "Honest:",
      notice_text: " a visible watermark makes removal harder, but not impossible. The invisible layer survives JPEG compression and resizing, but is not an absolute guarantee. For real provenance protection, C2PA metadata is needed — already built into modern cameras like the Nikon Z9 and Canon R5 Mark II.",
      footer_text: "OpenWatermark · Open source on",
      footer_privacy: "Your photos stay on your device. Nothing is sent.",
      max_photos: (max, skipped) => `Maximum ${max} photos at a time. ${skipped} skipped.`,
      photos_loaded: (n) => `${n} photo(s) loaded.`,
      logo_loaded: "Logo loaded.",
      logo_must_be_image: "Logo must be an image.",
      logo_load_error: "Logo could not be loaded.",
      photo_load_error: "Photo could not be loaded.",
      processing_one: (i, n) => `Photo ${i} of ${n}...`,
      creating_zip: "Creating ZIP...",
      done_zip: (n) => `Done! ${n} photo(s) downloaded as ZIP.`,
      error_prefix: "Error: ",
      preview_error: "Preview error: ",
      no_jszip: "ZIP library could not be loaded. Check your internet connection.",
      too_many: (max) => `Maximum ${max} photos at a time.`,
      too_small: "This photo is too small for a robust invisible watermark.",
      verify_match: (c) => `Invisible watermark found (${Math.round(c * 100)}% match).`,
      verify_no_match: (c) => `No match found (${Math.round(c * 100)}%).`,
      verify_prompt: "Load a photo and enter a verification code first.",
    },
    de: {
      subtitle: "Schütze deine Fotos mit deinem eigenen Logo. Alles lokal im Browser.",
      photos_title: "Fotos",
      photos_drop: "Ziehen oder tippen, um Fotos zu wählen",
      photos_hint: "mehrere Fotos möglich",
      logo_title: "Dein Logo",
      logo_drop: "Ziehen oder tippen, um dein Logo zu wählen",
      logo_hint: "PNG mit transparentem Hintergrund funktioniert am besten",
      logo_ready: "Bereit zur Verwendung",
      logo_change: "Ändern",
      settings_title: "Einstellungen",
      set_size: "Logogröße",
      set_opacity: "Transparenz",
      set_rotation: "Drehung",
      set_spacing: "Abstand",
      set_payload: "Verifizierungscode",
      set_payload_hint: "z.B. deine@email.de",
      result_title: "Ergebnis",
      result_preview: "Vorschau (erstes Foto)",
      result_download: "Alle Fotos herunterladen (ZIP)",
      result_reset: "Alles löschen",
      result_verify: "Unsichtbares Wasserzeichen prüfen",
      notice_strong: "Ehrlich:",
      notice_text: " ein sichtbares Wasserzeichen erschwert das Entfernen, macht es aber nicht unmöglich. Die unsichtbare Ebene übersteht JPEG-Kompression und Verkleinerung, ist aber keine absolute Garantie. Für echten Herkunftsschutz ist C2PA-Metadaten nötig — bereits in modernen Kameras wie der Nikon Z9 und Canon R5 Mark II integriert.",
      footer_text: "OpenWatermark · Open Source auf",
      footer_privacy: "Deine Fotos bleiben auf deinem Gerät. Nichts wird gesendet.",
      max_photos: (max, skipped) => `Maximal ${max} Fotos pro Vorgang. ${skipped} übersprungen.`,
      photos_loaded: (n) => `${n} Foto(s) geladen.`,
      logo_loaded: "Logo geladen.",
      logo_must_be_image: "Logo muss ein Bild sein.",
      logo_load_error: "Logo konnte nicht geladen werden.",
      photo_load_error: "Foto konnte nicht geladen werden.",
      processing_one: (i, n) => `Foto ${i} von ${n}...`,
      creating_zip: "ZIP wird erstellt...",
      done_zip: (n) => `Fertig! ${n} Foto(s) als ZIP heruntergeladen.`,
      error_prefix: "Fehler: ",
      preview_error: "Vorschaufehler: ",
      no_jszip: "ZIP-Bibliothek konnte nicht geladen werden. Prüfe deine Internetverbindung.",
      too_many: (max) => `Maximal ${max} Fotos pro Vorgang.`,
      too_small: "Dieses Foto ist zu klein für ein robustes unsichtbares Wasserzeichen.",
      verify_match: (c) => `Unsichtbares Wasserzeichen gefunden (${Math.round(c * 100)}% Übereinstimmung).`,
      verify_no_match: (c) => `Keine Übereinstimmung gefunden (${Math.round(c * 100)}%).`,
      verify_prompt: "Lade zuerst ein Foto und gib einen Verifizierungscode ein.",
    }
  };

  const SUPPORTED = ['nl', 'en', 'de'];
  const MAX_PHOTOS = 100;
  const JPEG_QUALITY = 0.92;

  // ============================================================
  //  TAAL
  // ============================================================
  function detectLanguage() {
    try {
      const saved = localStorage.getItem('ow_lang');
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch (_) {}
    const langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || 'en'];
    for (const lang of langs) {
      const code = String(lang).toLowerCase().split('-')[0];
      if (SUPPORTED.includes(code)) return code;
    }
    return 'en';
  }

  let currentLang = detectLanguage();

  function t(key, ...args) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    const val = dict[key] !== undefined ? dict[key] : TRANSLATIONS.en[key];
    return typeof val === 'function' ? val(...args) : val;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('.lang-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    const titles = {
      nl: "OpenWatermark — Bescherm je foto's",
      en: "OpenWatermark — Protect your photos",
      de: "OpenWatermark — Schütze deine Fotos"
    };
    document.title = titles[currentLang] || titles.en;
  }

  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    try { localStorage.setItem('ow_lang', lang); } catch (_) {}
    applyTranslations();
  }

  // ============================================================
  //  DOM
  // ============================================================
  const $ = (id) => document.getElementById(id);

  const photoZone = $('photoZone');
  const photoInput = $('photoInput');
  const photoList = $('photoList');
  const logoZone = $('logoZone');
  const logoInput = $('logoInput');
  const logoInfoRow = $('logoInfoRow');
  const logoThumb = $('logoThumb');
  const logoName = $('logoName');
  const changeLogoBtn = $('changeLogoBtn');
  const resultCard = $('resultCard');
  const preview = $('preview');
  const statusEl = $('status');
  const downloadZipBtn = $('downloadZipBtn');
  const resetBtn = $('resetBtn');
  const verifyBtn = $('verifyBtn');
  const progressBar = $('progressBar');
  const progressFill = $('progressFill');

  const logoSize = $('logoSize');
  const opacity = $('opacity');
  const rotation = $('rotation');
  const spacing = $('spacing');
  const payloadInput = $('payloadInput');

  const logoSizeVal = $('logoSizeVal');
  const opacityVal = $('opacityVal');
  const rotationVal = $('rotationVal');
  const spacingVal = $('spacingVal');

  // ============================================================
  //  STATE
  // ============================================================
  let photos = [];
  let logoImage = null;
  let previewUrl = null;
  let busy = false;

  // ============================================================
  //  STATUS
  // ============================================================
  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function updateDownloadState() {
    downloadZipBtn.disabled = busy || photos.length === 0 || !logoImage;
  }

  // ============================================================
  //  TAALSCHAKELAAR
  // ============================================================
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // ============================================================
  //  FOTO'S
  // ============================================================
  photoZone.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => addPhotos(e.target.files));
  photoZone.addEventListener('dragover', (e) => { e.preventDefault(); photoZone.classList.add('dragover'); });
  photoZone.addEventListener('dragleave', () => photoZone.classList.remove('dragover'));
  photoZone.addEventListener('drop', (e) => {
    e.preventDefault();
    photoZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length) addPhotos(e.dataTransfer.files);
  });

  function addPhotos(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.startsWith('image/'));
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { setStatus(t('too_many', MAX_PHOTOS), 'error'); return; }
    const toAdd = files.slice(0, remaining);

    toAdd.forEach(file => photos.push({ file, id: Math.random().toString(36).slice(2, 10) }));

    if (files.length > toAdd.length) {
      setStatus(t('max_photos', MAX_PHOTOS, files.length - toAdd.length), 'error');
    } else {
      setStatus(t('photos_loaded', photos.length));
    }

    renderPhotoList();
    updateDownloadState();
    if (logoImage && photos.length > 0) generatePreview();
  }

  function removePhoto(id) {
    photos = photos.filter(p => p.id !== id);
    renderPhotoList();
    updateDownloadState();
    if (logoImage && photos.length > 0) generatePreview();
    else if (photos.length === 0) {
      resultCard.style.display = 'none';
      revokePreviewUrl();
    }
  }

  function renderPhotoList() {
    photoList.innerHTML = '';
    if (photos.length === 0) { photoList.classList.remove('visible'); return; }
    photoList.classList.add('visible');

    const frag = document.createDocumentFragment();
    photos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'photo-item';

      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      const url = URL.createObjectURL(p.file);
      thumb.src = url;
      thumb.onload = () => URL.revokeObjectURL(url);

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = p.file.name;

      const remove = document.createElement('div');
      remove.className = 'remove';
      remove.textContent = '✕';
      remove.setAttribute('role', 'button');
      remove.addEventListener('click', (e) => { e.stopPropagation(); removePhoto(p.id); });

      item.appendChild(thumb);
      item.appendChild(name);
      item.appendChild(remove);
      frag.appendChild(item);
    });
    photoList.appendChild(frag);
  }

  // ============================================================
  //  LOGO
  // ============================================================
  logoZone.addEventListener('click', () => logoInput.click());
  changeLogoBtn.addEventListener('click', (e) => { e.stopPropagation(); logoInput.click(); });
  logoInput.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) loadLogo(e.target.files[0]); });
  logoZone.addEventListener('dragover', (e) => { e.preventDefault(); logoZone.classList.add('dragover'); });
  logoZone.addEventListener('dragleave', () => logoZone.classList.remove('dragover'));
  logoZone.addEventListener('drop', (e) => {
    e.preventDefault();
    logoZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadLogo(e.dataTransfer.files[0]);
  });

  function loadLogo(file) {
    if (!file.type || !file.type.startsWith('image/')) {
      setStatus(t('logo_must_be_image'), 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      logoThumb.src = url;
      logoName.textContent = file.name;
      logoInfoRow.style.display = 'block';
      logoZone.style.display = 'none';
      setStatus(t('logo_loaded'));
      updateDownloadState();
      if (photos.length > 0) generatePreview();
    };
    img.onerror = () => { URL.revokeObjectURL(url); setStatus(t('logo_load_error'), 'error'); };
    img.src = url;
  }

  // ============================================================
  //  SLIDERS
  // ============================================================
  function bindSlider(el, valEl, suffix) {
    el.addEventListener('input', () => {
      valEl.textContent = el.value + suffix;
      if (logoImage && photos.length > 0) debouncePreview();
    });
  }
  bindSlider(logoSize, logoSizeVal, '%');
  bindSlider(opacity, opacityVal, '%');
  bindSlider(rotation, rotationVal, '°');
  bindSlider(spacing, spacingVal, '');

  let previewTimer = null;
  function debouncePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(generatePreview, 150);
  }

  // ============================================================
  //  HELPERS
  // ============================================================
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

  function loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Blob load failed')); };
      img.src = url;
    });
  }

  // ============================================================
  //  WATERMERK TOEPASSEN (zichtbaar + onzichtbaar)
  // ============================================================
  async function applyWatermark(baseImg) {
    // ---- Stap 1: zichtbaar watermerk ----
    const canvas = document.createElement('canvas');
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImg, 0, 0);

    const logoW = (canvas.width * parseInt(logoSize.value, 10)) / 100;
    const logoH = (logoImage.height / logoImage.width) * logoW;
    const gap = parseInt(spacing.value, 10);
    const rot = (parseInt(rotation.value, 10) * Math.PI) / 180;
    const cellW = logoW + gap;
    const cellH = logoH + gap;
    const margin = Math.max(logoW, logoH);

    ctx.globalAlpha = parseInt(opacity.value, 10) / 100;

    for (let y = -margin; y < canvas.height + margin; y += cellH) {
      for (let x = -margin; x < canvas.width + margin; x += cellW) {
        ctx.save();
        ctx.translate(x + logoW / 2, y + logoH / 2);
        ctx.rotate(rot);
        ctx.drawImage(logoImage, -logoW / 2, -logoH / 2, logoW, logoH);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    const visibleBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    );

    // ---- Stap 2: onzichtbaar watermerk (DCT) ----
    const payload = (payloadInput.value || 'OpenWatermark-standaard').trim();

    if (window.OpenWatermarkInvisible && payload) {
      try {
        const visibleImg = await loadImageFromBlob(visibleBlob);
        return await window.OpenWatermarkInvisible.embed(visibleImg, payload);
      } catch (err) {
        // Als onzichtbaar watermerken mislukt (bv. afbeelding te klein),
        // lever dan de zichtbare versie zonder onzichtbare laag.
        console.warn('Onzichtbaar watermerk overgeslagen:', err.message);
        return visibleBlob;
      }
    }

    return visibleBlob;
  }

  // ============================================================
  //  PREVIEW
  // ============================================================
  function revokePreviewUrl() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  }

  async function generatePreview() {
    if (!logoImage || photos.length === 0) return;
    try {
      const img = await loadImage(photos[0].file);
      const blob = await applyWatermark(img);
      revokePreviewUrl();
      previewUrl = URL.createObjectURL(blob);
      preview.src = previewUrl;
      resultCard.style.display = 'block';
    } catch (err) {
      setStatus(t('preview_error') + err.message, 'error');
    }
  }

  // ============================================================
  //  ZIP DOWNLOAD
  // ============================================================
  downloadZipBtn.addEventListener('click', async () => {
    if (busy) return;
    if (!logoImage || photos.length === 0) return;

    if (typeof JSZip === 'undefined') {
      setStatus(t('no_jszip'), 'error');
      return;
    }

    busy = true;
    updateDownloadState();
    progressBar.classList.add('visible');
    progressFill.style.width = '0%';

    try {
      const zip = new JSZip();
      const folder = zip.folder('Open
