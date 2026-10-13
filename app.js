(function() {
  'use strict';

  const TRANSLATIONS = {
    nl: {
      subtitle: "Bescherm je foto's met je eigen logo. Alles lokaal in je browser.",
      photos_title: "Foto's",
      photos_drop: "Tik om foto's te kiezen",
      photos_hint: "meerdere foto's mogelijk",
      logo_title: "Jouw logo",
      logo_drop: "Tik om je logo te kiezen",
      logo_hint: "PNG met transparante achtergrond werkt het best",
      logo_ready: "Klaar voor gebruik",
      logo_change: "Wijzigen",
      settings_title: "Instellingen",
      set_size: "Logogrootte",
      set_opacity: "Transparantie",
      set_rotation: "Rotatie",
      set_spacing: "Afstand",
      result_title: "Resultaat",
      result_preview: "Voorbeeld (eerste foto)",
      result_download: "Download alle foto's (ZIP)",
      result_reset: "Alles wissen",
      notice_strong: "Eerlijk:",
      notice_text: " een zichtbaar watermerk maakt verwijdering lastiger, maar niet onmogelijk.",
      footer_text: "OpenWatermark · Open source op",
      footer_privacy: "Je foto's blijven op je toestel. Niets wordt verstuurd.",
      max_photos: (max, skipped) => `Maximaal ${max} foto's per keer. ${skipped} overgeslagen.`,
      photos_loaded: (n) => `${n} foto('s) geladen.`,
      logo_loaded: "Logo geladen.",
      logo_must_be_image: "Logo moet een afbeelding zijn.",
      logo_load_error: "Logo kon niet geladen worden.",
      processing: (n) => `Bezig met ${n} foto('s)...`,
      creating_zip: "ZIP maken...",
      done_zip: (n) => `Klaar! ${n} foto('s) gedownload als ZIP.`,
      error_prefix: "Fout: ",
      preview_error: "Fout bij voorbeeld: "
    },
    en: {
      subtitle: "Protect your photos with your own logo. Everything local in your browser.",
      photos_title: "Photos",
      photos_drop: "Tap to choose photos",
      photos_hint: "multiple photos allowed",
      logo_title: "Your logo",
      logo_drop: "Tap to choose your logo",
      logo_hint: "PNG with transparent background works best",
      logo_ready: "Ready to use",
      logo_change: "Change",
      settings_title: "Settings",
      set_size: "Logo size",
      set_opacity: "Opacity",
      set_rotation: "Rotation",
      set_spacing: "Spacing",
      result_title: "Result",
      result_preview: "Preview (first photo)",
      result_download: "Download all photos (ZIP)",
      result_reset: "Clear all",
      notice_strong: "Honest:",
      notice_text: " a visible watermark makes removal harder, but not impossible.",
      footer_text: "OpenWatermark · Open source on",
      footer_privacy: "Your photos stay on your device. Nothing is sent.",
      max_photos: (max, skipped) => `Maximum ${max} photos at a time. ${skipped} skipped.`,
      photos_loaded: (n) => `${n} photo(s) loaded.`,
      logo_loaded: "Logo loaded.",
      logo_must_be_image: "Logo must be an image.",
      logo_load_error: "Logo could not be loaded.",
      processing: (n) => `Processing ${n} photo(s)...`,
      creating_zip: "Creating ZIP...",
      done_zip: (n) => `Done! ${n} photo(s) downloaded as ZIP.`,
      error_prefix: "Error: ",
      preview_error: "Preview error: "
    },
    de: {
      subtitle: "Schütze deine Fotos mit deinem eigenen Logo. Alles lokal im Browser.",
      photos_title: "Fotos",
      photos_drop: "Tippe, um Fotos auszuwählen",
      photos_hint: "mehrere Fotos möglich",
      logo_title: "Dein Logo",
      logo_drop: "Tippe, um dein Logo auszuwählen",
      logo_hint: "PNG mit transparentem Hintergrund funktioniert am besten",
      logo_ready: "Bereit zur Verwendung",
      logo_change: "Ändern",
      settings_title: "Einstellungen",
      set_size: "Logogröße",
      set_opacity: "Transparenz",
      set_rotation: "Drehung",
      set_spacing: "Abstand",
      result_title: "Ergebnis",
      result_preview: "Vorschau (erstes Foto)",
      result_download: "Alle Fotos herunterladen (ZIP)",
      result_reset: "Alles löschen",
      notice_strong: "Ehrlich:",
      notice_text: " ein sichtbares Wasserzeichen erschwert das Entfernen, macht es aber nicht unmöglich.",
      footer_text: "OpenWatermark · Open Source auf",
      footer_privacy: "Deine Fotos bleiben auf deinem Gerät. Nichts wird gesendet.",
      max_photos: (max, skipped) => `Maximal ${max} Fotos pro Vorgang. ${skipped} übersprungen.`,
      photos_loaded: (n) => `${n} Foto(s) geladen.`,
      logo_loaded: "Logo geladen.",
      logo_must_be_image: "Logo muss ein Bild sein.",
      logo_load_error: "Logo konnte nicht geladen werden.",
      processing: (n) => `Verarbeite ${n} Foto(s)...`,
      creating_zip: "ZIP wird erstellt...",
      done_zip: (n) => `Fertig! ${n} Foto(s) als ZIP heruntergeladen.`,
      error_prefix: "Fehler: ",
      preview_error: "Vorschaufehler: "
    }
  };

  const SUPPORTED = ['nl', 'en', 'de'];

  function detectLanguage() {
    const saved = localStorage.getItem('ow_lang');
    if (saved && SUPPORTED.includes(saved)) return saved;
    const browserLangs = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language || 'en'];
    for (const lang of browserLangs) {
      const code = lang.toLowerCase().split('-')[0];
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
    localStorage.setItem('ow_lang', lang);
    applyTranslations();
  }

  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  applyTranslations();

  const photoZone = document.getElementById('photoZone');
  const photoInput = document.getElementById('photoInput');
  const photoList = document.getElementById('photoList');
  const logoZone = document.getElementById('logoZone');
  const logoInput = document.getElementById('logoInput');
  const logoInfoRow = document.getElementById('logoInfoRow');
  const logoThumb = document.getElementById('logoThumb');
  const logoName = document.getElementById('logoName');
  const changeLogoBtn = document.getElementById('changeLogoBtn');
  const resultCard = document.getElementById('resultCard');
  const preview = document.getElementById('preview');
  const statusEl = document.getElementById('status');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const resetBtn = document.getElementById('resetBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const logoSize = document.getElementById('logoSize');
  const opacity = document.getElementById('opacity');
  const rotation = document.getElementById('rotation');
  const spacing = document.getElementById('spacing');

  let photos = [];
  let logoImage = null;

  photoZone.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => addPhotos(e.target.files));
  photoZone.addEventListener('dragover', (e) => { e.preventDefault(); photoZone.classList.add('dragover'); });
  photoZone.addEventListener('dragleave', () => photoZone.classList.remove('dragover'));
  photoZone.addEventListener('drop', (e) => {
    e.preventDefault();
    photoZone.classList.remove('dragover');
    addPhotos(e.dataTransfer.files);
  });

  function addPhotos(fileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const maxPhotos = 100;
    const toAdd = files.slice(0, maxPhotos - photos.length);
    toAdd.forEach(file => photos.push({ file, id: Math.random().toString(36).slice(2) }));
    if (files.length > toAdd.length) {
      setStatus(t('max_photos', maxPhotos, files.length - toAdd.length), 'error');
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
  }

  function renderPhotoList() {
    if (photos.length === 0) {
      photoList.classList.remove('visible');
      photoList.innerHTML = '';
      return;
    }
    photoList.classList.add('visible');
    photoList.innerHTML = '';
    photos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'photo-item';
      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.src = URL.createObjectURL(p.file);
      thumb.onload = () => URL.revokeObjectURL(thumb.src);
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = p.file.name;
      const remove = document.createElement('div');
      remove.className = 'remove';
      remove.textContent = '✕';
      remove.addEventListener('click', (e) => { e.stopPropagation(); removePhoto(p.id); });
      item.appendChild(thumb);
      item.appendChild(name);
      item.appendChild(remove);
      photoList.appendChild(item);
    });
  }

  logoZone.addEventListener('click', () => logoInput.click());
  changeLogoBtn.addEventListener('click', (e) => { e.stopPropagation(); logoInput.click(); });
  logoInput.addEventListener('change', (e) => { if (e.target.files[0]) loadLogo(e.target.files[0]); });
  logoZone.addEventListener('dragover', (e) => { e.preventDefault(); logoZone.classList.add('dragover'); });
  logoZone.addEventListener('dragleave', () => logoZone.classList.remove('dragover'));
  logoZone.addEventListener('drop', (e) => {
    e.preventDefault();
    logoZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) loadLogo(e.dataTransfer.files[0]);
  });

  function loadLogo(file) {
    if (!file.type.startsWith('image/')) {
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
      if (photos.length > 0) generatePreview();
    };
    img.onerror = () => setStatus(t('logo_load_error'), 'error');
    img.src = url;
  }

  function bindSlider(el, valEl, suffix) {
    el.addEventListener('input', () => {
      valEl.textContent = el.value + suffix;
      if (logoImage && photos.length > 0) generatePreview();
    });
  }
  bindSlider(logoSize, document.getElementById('logoSizeVal'), '%');
  bindSlider(opacity, document.getElementById('opacityVal'), '%');
  bindSlider(rotation, document.getElementById('rotationVal'), '°');
  bindSlider(spacing, document.getElementById('spacingVal'), '');

  function loadImage(file) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }

  async function applyWatermark(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const logoW = (canvas.width * parseInt(logoSize.value)) / 100;
    const logoH = (logoImage.height / logoImage.width) * logoW;
    const gap = parseInt(spacing.value);
    const rot = (parseInt(rotation.value) * Math.PI) / 180;
    const cellW = logoW + gap;
    const cellH = logoH + gap;
    const margin = Math.max(logoW, logoH);
    ctx.globalAlpha = parseInt(opacity.value) / 100;
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
    return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
  }

  async function generatePreview() {
    if (!logoImage || photos.length === 0) return;
    try {
      const img = await loadImage(photos[0].file);
      const blob = await applyWatermark(img);
      preview.src = URL.createObjectURL(blob);
      resultCard.style.display = 'block';
    } catch (err) {
      setStatus(t('preview_error') + err.message, 'error');
    }
  }

  downloadZipBtn.addEventListener('click', async () => {
    if (!logoImage || photos.length === 0) return;
    downloadZipBtn.disabled = true;
    progressBar.classList.add('visible');
    progressFill.style.width = '0%';
    setStatus(t('processing', photos.length));
    try {
      const zip = new JSZip();
      const folder = zip.folder('OpenWatermark');
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const img = await loadImage(p.file);
        const blob = await applyWatermark(img);
        const baseName = p.file.name.replace(/\.[^.]+$/, '');
        folder.file(`${baseName}_watermerk.jpg`, blob);
        progressFill.style.width = `${((i + 1) / photos.length) * 100}%`;
      }
      setStatus(t('creating_zip'));
      const zipBlob = await zip.generateAsync({
        type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 }
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpenWatermark_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setStatus(t('done_zip', photos.length), 'success');
    } catch (err) {
      console.error(err);
      setStatus(t('error_prefix') + err.message, 'error');
    } finally {
      downloadZipBtn.disabled = false;
      setTimeout(() => {
        progressBar.classList.remove('visible');
        progressFill.style.width = '0%';
      }, 1500);
    }
  });

  resetBtn.addEventListener('click', () => {
    photos = [];
    photoInput.value = '';
    logoInput.value = '';
    renderPhotoList();
    logoInfoRow.style.display = 'none';
    logoZone.style.display = 'block';
    logoImage = null;
    resultCard.style.display = 'none';
    setStatus('');
  });

  function updateDownloadState() {
    downloadZipBtn.disabled = photos.length === 0 || !logoImage;
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  updateDownloadState();
})();
