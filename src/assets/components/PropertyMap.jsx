import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Usamos la variable de entorno de Vite
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function PropertyMap({ properties = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Evitar inicializar el mapa múltiples veces
    if (map.current) return; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Estilo limpio
      center: [-99.1332, 19.4326], // Coordenadas iniciales (ej. CDMX)
      zoom: 11,
    });

    // Agregar controles de zoom
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Limpieza al desmontar el componente (importante en React 19)
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Efecto para actualizar los marcadores cuando cambian las propiedades
  useEffect(() => {
    if (!map.current) return;

    // Limpiar marcadores previos si hicieras un filtrado dinámico
    const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
    currentMarkers.forEach(marker => marker.remove());

    properties.forEach((prop) => {
      if (prop.latitude && prop.longitude) {
        // Crear el popup estilo Airbnb
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div class="p-2 font-sans">
            <h4 class="font-bold text-sm m-0">${prop.title}</h4>
            <p class="text-gray-600 text-xs m-0 mt-1">$${prop.price} MXN / noche</p>
          </div>`
        );

        // Crear y añadir el marcador
        new mapboxgl.Marker({ color: '#FF385C' }) // Color corporativo de Airbnb
          .setLngLat([prop.longitude, prop.latitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
  }, [properties]);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}