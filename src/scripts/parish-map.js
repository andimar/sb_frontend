(() => {
  function init() {
    document.querySelectorAll('[data-component="parish-map"]').forEach(element => {
      if (element.dataset.initialized) return;
      const wrapper = element.closest('.sb-location-map-wrap');
      const status = wrapper.querySelector('[data-map-status]');
      let map;
      try {
        const props = JSON.parse(element.dataset.props);
        if (!window.L || !Number.isFinite(props.latitude) || !Number.isFinite(props.longitude)
          || Math.abs(props.latitude) > 90 || Math.abs(props.longitude) > 180) throw new Error('Invalid map');
        element.dataset.initialized = 'true';
        element.replaceChildren();
        map = L.map(element, { scrollWheelZoom: false }).setView([props.latitude, props.longitude], props.zoom);
        let tilesLoaded = false;
        const tiles = L.tileLayer(props.tileUrl, { maxZoom: 19, attribution: '' }).addTo(map);
        const attribution = document.createElement('span');
        attribution.textContent = props.attribution;
        const source = document.createElement('a');
        source.href = 'https://www.openstreetmap.org/copyright';
        source.textContent = 'OpenStreetMap';
        attribution.append(' · ', source);
        map.attributionControl.addAttribution(attribution.outerHTML);
        tiles.on('tileload', () => { tilesLoaded = true; status.textContent = ''; });
        tiles.on('tileerror', () => { if (!tilesLoaded) status.textContent = 'La cartografia non è disponibile. Puoi usare le indicazioni accanto alla mappa.'; });
        const icon = L.divIcon({ className: 'sb-parish-pin', html: '<span aria-hidden="true"><i>✝</i></span>', iconSize: [46, 54], iconAnchor: [23, 54], popupAnchor: [0, -52] });
        const popup = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = props.title;
        const address = document.createElement('p');
        address.textContent = props.address;
        popup.append(name, address);
        const marker = L.marker([props.latitude, props.longitude], { icon, title: props.title, alt: props.title }).addTo(map).bindPopup(popup);
        marker.bindTooltip('San Bernardo', { permanent: true, direction: 'bottom', offset: [0, 5], className: 'sb-parish-label' });
        const reset = wrapper.querySelector('[data-map-reset]');
        reset.hidden = false;
        reset.addEventListener('click', () => { map.setView([props.latitude, props.longitude], props.zoom); marker.openPopup(); });
        if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize()).observe(element);
      } catch (error) {
        if (map) map.remove();
        status.textContent = 'Mappa non disponibile. L’indirizzo e i collegamenti alle indicazioni restano disponibili.';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
