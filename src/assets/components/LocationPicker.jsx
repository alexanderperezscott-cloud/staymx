import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Asignamos el token (Agregamos || '' para evitar crashes si el .env no carga a tiempo)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function LocationPicker({ formData, setFormData }) {
  const mapContainer = useRef(null);
  const map = useRef(null); // <-- Faltaba esta referencia clave
  const markerRef = useRef(null);

  useEffect(() => {
    // Si el mapa ya existe, no lo volvemos a cargar
    if (map.current) return;

    // Coordenadas por defecto (Centro de México)
    const initialLng = formData.longitude || -99.1332;
    const initialLat = formData.latitude || 19.4326;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Estilo oscuro
      center: [initialLng, initialLat],
      zoom: 5
    });

    // Marcador arrastrable
    markerRef.current = new mapboxgl.Marker({ draggable: true, color: '#FF385C' })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current);

    // Actualizar coordenadas al soltar el pin
    markerRef.current.on('dragend', () => {
      const lngLat = markerRef.current.getLngLat();
      setFormData(prev => ({
        ...prev,
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }));
    });

  }, []); // <-- Dependencias vacías para evitar que el mapa parpadee y colapse

  return (
    <div className="mt-4">
      <label className="text-sm text-gray-300 mb-2 block">
        Ubicación exacta en el mapa *
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Arrastra el marcador rojo para señalar la entrada exacta de tu alojamiento.
      </p>
      
      <div 
        ref={mapContainer} 
        className="h-[300px] w-full rounded-xl border border-gray-700 shadow-inner overflow-hidden" 
      />
    </div>
  );
}