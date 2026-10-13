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
      updateDownloadState();
      if (photos.length > 0) generatePreview();
    };
    img.onerror = () => setStatus(t('logo_load_error'), 'error');
    img.src = url;
}
