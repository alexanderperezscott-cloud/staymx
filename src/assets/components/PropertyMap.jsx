import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function PropertyMap({ properties = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; 

    const firstProp = properties.length > 0 ? properties[0] : null;
    const initialLng = firstProp && firstProp.longitude ? Number(firstProp.longitude) : -99.1332;
    const initialLat = firstProp && firstProp.latitude ? Number(firstProp.latitude) : 19.4326;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // SOLUCIÓN AL MAPA EN BLANCO: Forzamos redibujado dinámico
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }
    // Redibujado de seguridad a los 300ms
    setTimeout(() => map.current?.resize(), 300);

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
    currentMarkers.forEach(marker => marker.remove());

    properties.forEach((prop) => {
      const lat = Number(prop.latitude);
      const lng = Number(prop.longitude);

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

        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true
        });
      }
    });
  }, [properties]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 relative bg-gray-100 dark:bg-gray-800">
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />
    </div>
  );
}