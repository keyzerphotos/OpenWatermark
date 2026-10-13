/* OpenWatermark - app.js
 * Versie 2.4.0 - MIT-licentie
 * Lightroom-stijl. Alleen Nederlands. Dubbelklik slider = reset.
 * Nieuw in 2.4.0: bestandsnaam-suffix met suggesties.
 */
(function () {
  'use strict';

  const T = {
    subtitle: "Bescherm je foto's met je eigen logo of naam. Alles lokaal in je browser.",
    step_photos: "Foto's",
    step_watermark: "Watermerk",
    step_settings: "Instellen",
    step_download: "Klaar",

    info_title: "Hoe werkt OpenWatermark?",
    info_body: "<p>OpenWatermark plaatst een watermerk over je foto's zodat ze moeilijker te stelen zijn. Alles gebeurt in je eigen browser, je foto's worden nergens naartoe gestuurd.</p><h3>Wat het doet</h3><p>Je kiest een logo of een tekst. De app herhaalt dat watermerk over de hele foto. Dat maakt het lastiger voor iemand met AI-tools om het weg te poetsen zonder de foto te beschadigen.</p><h3>Wat het niet doet</h3><p>Geen enkele methode kan garanderen dat een watermerk niet verwijderd wordt. Het maakt het alleen lastiger. Voor echte bescherming van herkomst heb je C2PA-metadata nodig, dat zit al in moderne camera's.</p><h3>Je verificatiecode</h3><p>Je kunt optioneel een code invullen. Die wordt onzichtbaar in de foto verborgen. Later kun je daarmee bewijs hebben dat de foto van jou is, ook als iemand het zichtbare watermerk heeft weggehaald. Het is geen absolute garantie.</p>",
    info_close: "Sluiten",

    photos_title: "Kies je foto's",
    photos_hint_card: "Sleep of tik om te kiezen",
    photos_drop: "Sleep of tik om foto's te kiezen",
    photos_hint: "meerdere foto's mogelijk",
    photos_counter: (n, max) => `<strong>${n}</strong> van ${max} foto's geladen`,

    wm_title: "Kies je watermerk",
    wm_hint_card: "Tekst of je eigen logo",
    wm_toggle_text: "Tekst",
    wm_toggle_logo: "Logo",
    wm_text_label: "Jouw naam",
    wm_text_hint: "Bijvoorbeeld je naam, bedrijfsnaam of website. Deze tekst wordt herhaald over de hele foto.",
    wm_color_white: "Wit",
    wm_color_black: "Zwart",

    logo_drop: "Sleep of tik om je logo te kiezen",
    logo_hint: "PNG met transparante achtergrond",
    logo_ready: "Klaar voor gebruik",
    logo_change: "Wijzigen",

    settings_title: "Stel je watermerk in",
    settings_hint: "Kies een preset en pas eventueel de sliders aan",
    preset_preview: "Klant-preview",
    preset_preview_desc: "max 1600 px, 82%",
    preset_full: "Volledig",
    preset_full_desc: "origineel, 92%",
    preset_hint: "Klant-preview is bedoeld voor online galerijen. Volledig bewaart je originele formaat.",
    set_size: "Grootte",
    set_opacity: "Transparantie",
    set_rotation: "Rotatie",
    set_spacing: "Afstand",
    set_suffix: "Bestandsnaam",
    set_suffix_help: "Achter de bestandsnaam. Leeg = originele naam.",
    set_payload: "Verificatiecode",
    set_payload_hint: "bv. jouw@email.nl",
    set_payload_help: "Deze code wordt onzichtbaar in elke foto verborgen. Je kunt hem later gebruiken als aanwijzing dat de foto van jou is.",
    set_payload_more: "Wat doet deze code precies?",
    set_payload_explanation: "<p>Je verificatiecode wordt <strong>onzichtbaar in je foto verborgen</strong>. Je ziet er niets van, maar de code zit wel in de afbeelding. Dit heet een <em>digitaal watermerk</em>.</p><p><strong>Waarom is dit handig?</strong> Stel, iemand steelt je foto, poetst je logo weg en zet hem op Instagram. Met deze code kun je een aanwijzing hebben dat de foto van jou is, ook als het zichtbare logo verdwenen is.</p><p><strong>Wat vul je in?</strong> Iets unieks dat alleen jij weet. Bijvoorbeeld je e-mailadres, je website, of een code zoals <code>keyzerphotos-2026</code>. Een keer instellen is genoeg. De app gebruikt dezelfde code voor al je foto's en onthoudt hem voor de volgende keer.</p><p><strong>Wat het niet is:</strong> geen wachtwoord, geen absolute garantie. Een vastberaden aanvaller kan het ook verwijderen. En bij zware compressie of AI-bewerking kan het verdwijnen. Het is een extra laag, geen slot.</p>",

    result_title: "Klaar om te downloaden",
    result_hint: "Controleer het voorbeeld en klik op downloaden",
    result_preview: "Voorbeeld (eerste foto)",
    result_empty: "Het voorbeeld verschijnt zodra je foto's en een watermerk hebt.",
    result_download_single: "Download foto",
    result_download_multiple: (n) => `Download ${n} foto's als ZIP`,
    result_reset: "Foto's wissen",

    counter_text: "foto's verwerkt met dit watermerk",

    notice_strong: "Eerlijk:",
    notice_text: " een zichtbaar watermerk maakt verwijdering lastiger, maar niet onmogelijk. De onzichtbare laag overleeft milde compressie, maar is geen absolute garantie. Voor echte herkomstbescherming is C2PA-metadata nodig, dat zit al in moderne camera's zoals Nikon Z9 en Canon R5 Mark II.",
    footer_text: "OpenWatermark - Open source op",
    footer_info: "Info",
    footer_privacy: "Je foto's blijven op je toestel. Niets wordt verstuurd.",
    invisible_alert: "De onzichtbare watermerk-laag kon niet geladen worden. Je foto's krijgen alleen het zichtbare watermerk.",

    max_photos: (max, skipped) => `Maximaal ${max} foto's per keer. ${skipped} overgeslagen.`,
    photos_loaded: (n) => `${n} foto('s) geladen.`,
    logo_loaded: "Logo geladen en opgeslagen.",
    logo_must_be_image: "Logo moet een afbeelding zijn.",
    logo_load_error: "Logo kon niet geladen worden.",
    processing_one: (i, n) => `Foto ${i} van ${n}...`,
    creating_zip: "ZIP maken...",
    done_single: "Klaar! Foto gedownload.",
    done_multiple: (n) => `Klaar! ${n} foto's gedownload als ZIP.`,
    error_prefix: "Fout: ",
    preview_error: "Fout bij voorbeeld: ",
    no_jszip: "ZIP-bibliotheek kon niet geladen worden. Controleer je internetverbinding.",
    too_many: (max) => `Maximaal ${max} foto's per keer.`
  };

  function t(key, ...args) {
    const val = T[key];
    return typeof val === 'function' ? val(...args) : val;
  }

  const MAX_PHOTOS = 100;
  const STORAGE = {
    logo: 'ow_logo_data',
    logoName: 'ow_logo_name',
    payload: 'ow_payload',
    text: 'ow_wm_text',
    wmMode: 'ow_wm_mode',
    textColor: 'ow_wm_color',
    counter: 'ow_counter',
    suffix: 'ow_suffix'
  };
  const PRESETS = {
    preview: { maxSide: 1600, quality: 0.82 },
    full: { maxSide: Infinity, quality: 0.92 }
  };

  function applyTranslations() {
    document.documentElement.lang = 'nl';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.title = "OpenWatermark - Bescherm je foto's";
  }

  const $ = (id) => document.getElementById(id);

  const cardWatermark = $('cardWatermark');
  const cardSettings = $('cardSettings');
  const cardResult = $('cardResult');
  const steps = document.querySelectorAll('.step');

  const photoZone = $('photoZone');
  const photoInput = $('photoInput');
  const photoList = $('photoList');
  const photoCounter = $('photoCounter');

  const wmToggle = $('wmToggle');
  const textMode = $('textMode');
  const logoMode = $('logoMode');
  const wmText = $('wmText');
  const colorPicker = $('colorPicker');

  const logoZone = $('logoZone');
  const logoInput = $('logoInput');
  const logoInfoRow = $('logoInfoRow');
  const logoThumb = $('logoThumb');
  const logoName = $('logoName');
  const changeLogoBtn = $('changeLogoBtn');

  const presetRow = $('presetRow');
  const preview = $('preview');
  const previewEmpty = $('previewEmpty');
  const statusEl = $('status');
  const downloadBtn = $('downloadBtn');
  const resetBtn = $('resetBtn');
  const actionBar = $('actionBar');
  const progressBar = $('progressBar');
  const progressFill = $('progressFill');
  const invisibleAlert = $('invisibleAlert');

  const infoBtn = $('infoBtn');
  const infoBtnFooter = $('infoBtnFooter');
  const infoOverlay = $('infoOverlay');
  const infoClose = $('infoClose');

  const counterBox = $('counterBox');
  const counterNumber = $('counterNumber');

  const logoSize = $('logoSize');
  const opacity = $('opacity');
  const rotation = $('rotation');
  const spacing = $('spacing');
  const payloadInput = $('payloadInput');
  const suffixInput = $('suffixInput');
  const suffixDropdownBtn = $('suffixDropdownBtn');
  const suffixMenu = $('suffixMenu');

  const logoSizeVal = $('logoSizeVal');
  const opacityVal = $('opacityVal');
  const rotationVal = $('rotationVal');
  const spacingVal = $('spacingVal');

  let photos = [];
  let logoImage = null;
  let previewUrl = null;
  let busy = false;
  let currentPreset = 'preview';
  let wmMode = 'text';
  let textColor = 'white';

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function saveLogo(dataUrl, fileName) {
    safeSet(STORAGE.logo, dataUrl);
    safeSet(STORAGE.logoName, fileName || 'logo.png');
  }
  function loadLogoData() {
    const dataUrl = safeGet(STORAGE.logo);
    if (!dataUrl) return null;
    return { dataUrl, name: safeGet(STORAGE.logoName) || 'logo.png' };
  }
  function clearLogoData() {
    safeRemove(STORAGE.logo);
    safeRemove(STORAGE.logoName);
  }

  function savePayload(v) { safeSet(STORAGE.payload, v || ''); }
  function loadPayloadValue() { return safeGet(STORAGE.payload) || ''; }

  function saveText(v) { safeSet(STORAGE.text, v || ''); }
  function loadTextValue() { return safeGet(STORAGE.text) || ''; }

  function saveWmMode(v) { safeSet(STORAGE.wmMode, v); }
  function loadWmMode() { return safeGet(STORAGE.wmMode) || 'text'; }

  function saveTextColor(v) { safeSet(STORAGE.textColor, v); }
  function loadTextColor() { return safeGet(STORAGE.textColor) || 'white'; }

  function saveSuffix(v) { safeSet(STORAGE.suffix, v || ''); }
  function loadSuffixValue() {
    const stored = safeGet(STORAGE.suffix);
    return stored === null ? '_OpenWatermark' : stored;
  }

  function getCounter() {
    const v = parseInt(safeGet(STORAGE.counter) || '0', 10);
    return isNaN(v) ? 0 : v;
  }
  function addToCounter(n) {
    const total = getCounter() + n;
    safeSet(STORAGE.counter, String(total));
    updateCounterDisplay();
  }
  function updateCounterDisplay() {
    if (!counterBox || !counterNumber) return;
    const total = getCounter();
    if (total > 0) {
      counterBox.classList.add('visible');
      counterNumber.textContent = total;
    } else {
      counterBox.classList.remove('visible');
    }
  }

  function setStep(stepNum) {
    steps.forEach(s => {
      const n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === stepNum);
      s.classList.toggle('done', n < stepNum);
    });
  }

  function hasWatermark() {
    if (!wmText) return wmMode === 'logo' ? !!logoImage : false;
    if (wmMode === 'logo') return !!logoImage;
    return wmText.value.trim().length > 0;
  }

  function updateDownloadLabel() {
    if (!downloadBtn) return;
    if (photos.length === 1) {
      downloadBtn.textContent = t('result_download_single');
    } else if (photos.length > 1) {
      downloadBtn.textContent = t('result_download_multiple', photos.length);
    } else {
      downloadBtn.textContent = t('result_download_single');
    }
  }

  function updateFlow() {
    const hasPhotos = photos.length > 0;
    const hasWm = hasWatermark();
    const hasAll = hasPhotos && hasWm;

    if (cardWatermark) {
      cardWatermark.classList.toggle('locked', !hasPhotos);
      cardWatermark.classList.toggle('done', hasPhotos && hasWm);
    }
    if (cardSettings) cardSettings.classList.toggle('locked', !hasAll);
    if (cardResult) {
      cardResult.classList.toggle('locked', !hasAll);
      cardResult.classList.toggle('done', hasAll);
    }

    if (!hasPhotos) setStep(1);
    else if (!hasWm) setStep(2);
    else setStep(3);

    if (actionBar) actionBar.classList.toggle('visible', hasAll);
    if (downloadBtn) downloadBtn.disabled = !hasAll || busy;

    updatePhotoCounter();
    updateDownloadLabel();

    if (!preview || !previewEmpty) return;

    if (!hasAll) {
      preview.style.display = 'none';
      previewEmpty.classList.remove('hidden');
    } else if (preview.src) {
      preview.style.display = 'block';
      previewEmpty.classList.add('hidden');
    } else {
      preview.style.display = 'none';
      previewEmpty.classList.remove('hidden');
    }
  }

  function updatePhotoCounter() {
    if (!photoCounter) return;
    if (photos.length === 0) {
      photoCounter.classList.remove('visible');
      return;
    }
    photoCounter.classList.add('visible');
    photoCounter.innerHTML = t('photos_counter', photos.length, MAX_PHOTOS);
  }

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function setWmMode(mode) {
    wmMode = mode;
    saveWmMode(mode);
    if (wmToggle) {
      wmToggle.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
    }
    if (textMode) textMode.classList.toggle('visible', mode === 'text');
    if (logoMode) logoMode.classList.toggle('hidden', mode !== 'logo');
    updateFlow();
    if (photos.length > 0 && hasWatermark()) generatePreview();
  }

  if (wmToggle) {
    wmToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => setWmMode(btn.dataset.mode));
    });
  }

  function setTextColor(color) {
    textColor = color;
    saveTextColor(color);
    if (colorPicker) {
      colorPicker.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.color === color);
      });
    }
    if (photos.length > 0 && hasWatermark()) debouncePreview();
  }

  if (colorPicker) {
    colorPicker.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => setTextColor(btn.dataset.color));
    });
  }

  if (presetRow) {
    presetRow.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPreset = btn.dataset.preset;
        presetRow.querySelectorAll('.preset-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.preset === currentPreset);
        });
      });
    });
  }

  function openInfo() {
    if (infoOverlay) infoOverlay.classList.add('visible');
  }
  if (infoBtn) infoBtn.addEventListener('click', openInfo);
  if (infoBtnFooter) infoBtnFooter.addEventListener('click', openInfo);
  if (infoClose && infoOverlay) {
    infoClose.addEventListener('click', () => infoOverlay.classList.remove('visible'));
  }
  if (infoOverlay) {
    infoOverlay.addEventListener('click', (e) => {
      if (e.target === infoOverlay) infoOverlay.classList.remove('visible');
    });
  }

  if (photoZone && photoInput) {
    photoZone.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => addPhotos(e.target.files));
    photoZone.addEventListener('dragover', (e) => { e.preventDefault(); photoZone.classList.add('dragover'); });
    photoZone.addEventListener('dragleave', () => photoZone.classList.remove('dragover'));
    photoZone.addEventListener('drop', (e) => {
      e.preventDefault();
      photoZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) addPhotos(e.dataTransfer.files);
    });
  }

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
    updateFlow();
    if (hasWatermark() && photos.length > 0) generatePreview();
  }

  function removePhoto(id) {
    photos = photos.filter(p => p.id !== id);
    renderPhotoList();
    updateFlow();
    if (hasWatermark() && photos.length > 0) generatePreview();
    else if (photos.length === 0) revokePreviewUrl();
  }

  function renderPhotoList() {
    if (!photoList) return;
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
      remove.textContent = '\u2715';
      remove.setAttribute('role', 'button');
      remove.addEventListener('click', (e) => { e.stopPropagation(); removePhoto(p.id); });

      item.appendChild(thumb);
      item.appendChild(name);
      item.appendChild(remove);
      frag.appendChild(item);
    });
    photoList.appendChild(frag);
  }

  if (wmText) {
    wmText.addEventListener('input', () => {
      saveText(wmText.value);
      updateFlow();
      if (photos.length > 0 && hasWatermark()) debouncePreview();
    });
  }

  if (logoZone && logoInput) {
    logoZone.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadLogo(e.target.files[0]);
    });
    logoZone.addEventListener('dragover', (e) => { e.preventDefault(); logoZone.classList.add('dragover'); });
    logoZone.addEventListener('dragleave', () => logoZone.classList.remove('dragover'));
    logoZone.addEventListener('drop', (e) => {
      e.preventDefault();
      logoZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) loadLogo(e.dataTransfer.files[0]);
    });
  }

  if (changeLogoBtn && logoInput) {
    changeLogoBtn.addEventListener('click', (e) => { e.stopPropagation(); logoInput.click(); });
  }

  function loadLogo(file) {
    if (!file.type || !file.type.startsWith('image/')) {
      setStatus(t('logo_must_be_image'), 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      if (logoThumb) logoThumb.src = url;
      if (logoName) logoName.textContent = file.name;
      if (logoInfoRow) logoInfoRow.style.display = 'block';
      if (logoZone) logoZone.style.display = 'none';

      const reader = new FileReader();
      reader.onload = (ev) => {
        saveLogo(ev.target.result, file.name);
        setStatus(t('logo_loaded'), 'success');
      };
      reader.readAsDataURL(file);

      updateFlow();
      if (photos.length > 0) generatePreview();
    };
    img.onerror = () => { URL.revokeObjectURL(url); setStatus(t('logo_load_error'), 'error'); };
    img.src = url;
  }

  function restoreLogo() {
    const stored = loadLogoData();
    if (!stored) return;

    const img = new Image();
    img.onload = () => {
      logoImage = img;
      if (logoThumb) logoThumb.src = stored.dataUrl;
      if (logoName) logoName.textContent = stored.name;
      if (logoInfoRow) logoInfoRow.style.display = 'block';
      if (logoZone) logoZone.style.display = 'none';
      updateFlow();
      if (photos.length > 0 && hasWatermark()) generatePreview();
    };
    img.onerror = () => { clearLogoData(); };
    img.src = stored.dataUrl;
  }

  function bindSlider(el, valEl, suffix) {
    if (!el || !valEl) return;

    el.addEventListener('input', () => {
      valEl.textContent = el.value + suffix;
      if (photos.length > 0 && hasWatermark()) debouncePreview();
    });

    const resetToDefault = () => {
      const def = el.getAttribute('data-default');
      if (def === null) return;
      el.value = def;
      valEl.textContent = def + suffix;
      if (photos.length > 0 && hasWatermark()) debouncePreview();
    };

    el.addEventListener('dblclick', resetToDefault);

    let lastTap = 0;
    el.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 350) {
        e.preventDefault();
        resetToDefault();
      }
      lastTap = now;
    });
  }

  bindSlider(logoSize, logoSizeVal, '%');
  bindSlider(opacity, opacityVal, '%');
  bindSlider(rotation, rotationVal, '\u00B0');
  bindSlider(spacing, spacingVal, '');

  let previewTimer = null;
  function debouncePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(generatePreview, 150);
  }

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

  function createTextWatermarkImage(text, color, fontSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = 'bold ' + fontSize + 'px -apple-system, BlinkMacSystemFont, sans-serif';

    ctx.font = font;
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width) + 20;
    const height = Math.ceil(fontSize * 1.4);

    canvas.width = width;
    canvas.height = height;
    const ctx2 = canvas.getContext('2d');
    ctx2.font = font;
    ctx2.fillStyle = color === 'black' ? '#000000' : '#ffffff';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(text, 10, height / 2);

    return canvas;
  }

  async function applyWatermark(baseImg) {
    const preset = PRESETS[currentPreset];

    let outW = baseImg.width;
    let outH = baseImg.height;
    if (preset.maxSide !== Infinity) {
      const longest = Math.max(outW, outH);
      if (longest > preset.maxSide) {
        const scale = preset.maxSide / longest;
        outW = Math.round(outW * scale);
        outH = Math.round(outH * scale);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImg, 0, 0, outW, outH);

    let wmSource;
    if (wmMode === 'logo' && logoImage) {
      wmSource = logoImage;
    } else {
      const baseDim = Math.min(outW, outH);
      const fontSize = Math.max(20, Math.round(baseDim * 0.05));
      wmSource = createTextWatermarkImage(wmText.value.trim() || 'OpenWatermark', textColor, fontSize);
    }

    const wmRatio = wmSource.height / wmSource.width;
    const logoW = (outW * parseInt(logoSize.value, 10)) / 100;
    const logoH = logoW * wmRatio;
    const gap = parseInt(spacing.value, 10);
    const rot = (parseInt(rotation.value, 10) * Math.PI) / 180;
    const cellW = logoW + gap;
    const cellH = logoH + gap;
    const margin = Math.max(logoW, logoH);

    ctx.globalAlpha = parseInt(opacity.value, 10) / 100;

    for (let y = -margin; y < outH + margin; y += cellH) {
      for (let x = -margin; x < outW + margin; x += cellW) {
        ctx.save();
        ctx.translate(x + logoW / 2, y + logoH / 2);
        ctx.rotate(rot);
        ctx.drawImage(wmSource, -logoW / 2, -logoH / 2, logoW, logoH);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    const visibleBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    );

    const payload = (payloadInput && payloadInput.value ? payloadInput.value : 'OpenWatermark-standaard').trim();

    if (window.OpenWatermarkInvisible && payload) {
      try {
        const visibleImg = await loadImageFromBlob(visibleBlob);
        return await window.OpenWatermarkInvisible.embed(visibleImg, payload);
      } catch (err) {
        console.warn('Onzichtbaar watermerk overgeslagen:', err.message);
        return visibleBlob;
      }
    }
    return visibleBlob;
  }

  function revokePreviewUrl() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  }

  async function generatePreview() {
    if (!hasWatermark() || photos.length === 0) return;
    try {
      const img = await loadImage(photos[0].file);
      const blob = await applyWatermark(img);
      revokePreviewUrl();
      previewUrl = URL.createObjectURL(blob);
      if (preview) {
        preview.src = previewUrl;
        preview.style.display = 'block';
      }
      if (previewEmpty) previewEmpty.classList.add('hidden');
    } catch (err) {
      setStatus(t('preview_error') + err.message, 'error');
    }
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      if (busy) return;
      if (!hasWatermark() || photos.length === 0) return;

      busy = true;
      updateFlow();
      if (progressBar) progressBar.classList.add('visible');
      if (progressFill) progressFill.style.width = '0%';

      try {
        const suffix = (suffixInput && suffixInput.value !== null) ? suffixInput.value : '_OpenWatermark';
        const results = [];
        for (let i = 0; i < photos.length; i++) {
          setStatus(t('processing_one', i + 1, photos.length));
          const p = photos[i];
          const img = await loadImage(p.file);
          const blob = await applyWatermark(img);
          const baseName = p.file.name.replace(/\.[^.]+$/, '') || `foto_${i + 1}`;
          results.push({ name: `${baseName}${suffix}.jpg`, blob });
          if (progressFill) progressFill.style.width = `${((i + 1) / photos.length) * 100}%`;
          await new Promise(r => setTimeout(r, 0));
        }

        if (results.length === 1) {
          const url = URL.createObjectURL(results[0].blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = results[0].name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          setStatus(t('done_single'), 'success');
        } else {
          if (typeof JSZip === 'undefined') {
            setStatus(t('no_jszip'), 'error');
            busy = false;
            updateFlow();
            return;
          }
          setStatus(t('creating_zip'));
          const zip = new JSZip();
          const folder = zip.folder('OpenWatermark');
          results.forEach(r => folder.file(r.name, r.blob));
          const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          });
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `OpenWatermark_${new Date().toISOString().slice(0, 10)}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          setStatus(t('done_multiple', results.length), 'success');
        }

        addToCounter(results.length);

        downloadBtn.classList.add('success-flash');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '\u2713';
        setTimeout(() => {
          downloadBtn.classList.remove('success-flash');
          downloadBtn.textContent = originalText;
          updateDownloadLabel();
        }, 1800);

        setStep(4);
      } catch (err) {
        console.error(err);
        setStatus(t('error_prefix') + (err && err.message ? err.message : err), 'error');
      } finally {
        busy = false;
        updateFlow();
        setTimeout(() => {
          if (progressBar) progressBar.classList.remove('visible');
          if (progressFill) progressFill.style.width = '0%';
        }, 1200);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      photos = [];
      if (photoInput) photoInput.value = '';
      revokePreviewUrl();
      if (preview) {
        preview.removeAttribute('src');
        preview.style.display = 'none';
      }
      renderPhotoList();
      setStatus('');
      updateFlow();
    });
  }

  if (payloadInput) {
    payloadInput.addEventListener('input', () => {
      savePayload(payloadInput.value);
    });
  }

  if (suffixInput) {
    suffixInput.addEventListener('input', () => {
      saveSuffix(suffixInput.value);
    });
  }

  if (suffixDropdownBtn && suffixMenu) {
    suffixDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      suffixMenu.style.display = suffixMenu.style.display === 'none' ? 'block' : 'none';
    });

    suffixMenu.querySelectorAll('.suffix-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (suffixInput) suffixInput.value = val;
        saveSuffix(val);
        suffixMenu.style.display = 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!suffixMenu.contains(e.target) && e.target !== suffixDropdownBtn) {
        suffixMenu.style.display = 'none';
      }
    });
  }

  applyTranslations();

  const savedPayload = loadPayloadValue();
  if (savedPayload && payloadInput) payloadInput.value = savedPayload;

  const savedSuffix = loadSuffixValue();
  if (suffixInput) suffixInput.value = savedSuffix;

  const savedText = loadTextValue();
  if (savedText && wmText) wmText.value = savedText;

  const savedMode = loadWmMode();
  setWmMode(savedMode);

  const savedColor = loadTextColor();
  setTextColor(savedColor);

  restoreLogo();
  updateCounterDisplay();

  // Wacht heel even zodat invisible-watermark.js zeker geladen is
  setTimeout(() => {
    const hasInvisible = typeof window.OpenWatermarkInvisible === 'object'
      && typeof window.OpenWatermarkInvisible.embed === 'function';

    if (invisibleAlert) {
      if (!hasInvisible) {
        invisibleAlert.classList.add('visible');
      } else {
        invisibleAlert.classList.remove('visible');
        console.log('Onzichtbaar watermerk geladen, versie:', window.OpenWatermarkInvisible.version);
      }
    }
  }, 100);

  updateFlow();
})();
