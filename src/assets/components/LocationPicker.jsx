import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function LocationPicker({ formData, setFormData }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (map.current) return;

    // Asegurar que las coordenadas iniciales sean válidas y numéricas
    const initialLng = parseFloat(formData.longitude) || -99.1332;
    const initialLat = parseFloat(formData.latitude) || 19.4326;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [initialLng, initialLat],
      zoom: 13 // Un zoom más cercano es mejor para seleccionar la calle
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

    // PREVENIR EL BUG DEL MAPA GRIS
    map.current.on('load', () => {
      map.current.resize();
    });
    setTimeout(() => {
      if (map.current) map.current.resize();
    }, 200);

  }, []); 
  
  // Opcional: Si el componente padre actualiza lat/lng de otra forma, 
  // que el pin se mueva automáticamente.
  useEffect(() => {
    if (markerRef.current && map.current && formData.longitude && formData.latitude) {
        const lng = parseFloat(formData.longitude);
        const lat = parseFloat(formData.latitude);
        if (!isNaN(lng) && !isNaN(lat)) {
            markerRef.current.setLngLat([lng, lat]);
            map.current.setCenter([lng, lat]);
        }
    }
  }, [formData.longitude, formData.latitude]);

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