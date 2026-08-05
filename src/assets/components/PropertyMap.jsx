import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function PropertyMap({ properties = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // 1. Validar coordenadas estrictamente (Si fallan, carga CDMX por defecto)
    const firstProp = properties.length > 0 ? properties[0] : null;
    let lat = 19.4326; 
    let lng = -99.1332; 

    if (firstProp && firstProp.latitude && firstProp.longitude) {
      const parsedLat = parseFloat(firstProp.latitude);
      const parsedLng = parseFloat(firstProp.longitude);
      // Solo usamos las coordenadas si son números reales válidos
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        lat = parsedLat;
        lng = parsedLng;
      }
    }

    // 2. Inicializar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 13, 
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // 3. Forzar redibujado cuando el mapa termine de cargar sus estilos
    map.current.on('load', () => {
      map.current.resize();
    });

    // 4. Observar cambios en el tamaño del contenedor (Soluciona el mapa en blanco)
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    // 5. Seguros de tiempo extra para animaciones de React
    setTimeout(() => map.current?.resize(), 300);
    setTimeout(() => map.current?.resize(), 800);

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [properties]);

  // Efecto para renderizar el PIN rojo
  useEffect(() => {
    if (!map.current) return;

    const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
    currentMarkers.forEach(marker => marker.remove());

    properties.forEach((prop) => {
      const lat = parseFloat(prop.latitude);
      const lng = parseFloat(prop.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div class="p-2 font-sans">
            <h4 class="font-bold text-sm m-0">${prop.title || 'Alojamiento'}</h4>
            <p class="text-gray-600 text-xs m-0 mt-1">$${prop.price || prop.price_per_night || 0} MXN / noche</p>
          </div>`
        );

        new mapboxgl.Marker({ color: '#FF385C' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
  }, [properties]);

  return (
    // CAMBIO IMPORTANTE: Agregamos min-h-[200px] para forzar que la caja exista
    <div ref={mapContainer} className="w-full h-full min-h-[200px] rounded-xl bg-gray-100 dark:bg-gray-800" />
  );
}