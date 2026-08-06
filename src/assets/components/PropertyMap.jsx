import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function PropertyMap({ properties = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]); // Guardar referencia de los pines

  useEffect(() => {
    if (map.current) return;

    // Iniciar el mapa (el centro inicial no importa tanto porque lo moveremos abajo)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326], 
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // SOLUCIÓN AL MAPA GRIS/BLANCO: Forzar al mapa a recalcular su tamaño
    map.current.on('load', () => {
      map.current.resize();
    });
    
    // Respaldo de seguridad por si tarda en renderizar la tarjeta
    setTimeout(() => {
      if (map.current) map.current.resize();
    }, 200);

  }, []);

  // Agregar marcadores y CENTRAR LA CÁMARA
  useEffect(() => {
    if (!map.current || !properties.length) return;

    // Limpiar marcadores viejos (por si la lista cambia)
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    properties.forEach((prop) => {
      // SOLUCIÓN AL PIN PERDIDO: Convertir a número por si vienen como string de la BD
      const lng = parseFloat(prop.longitude);
      const lat = parseFloat(prop.latitude);

      if (!isNaN(lng) && !isNaN(lat)) {
        hasValidCoords = true;
        
        const marker = new mapboxgl.Marker({ color: '#FF385C' })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: sans-serif;">
                <h4 style="margin:0; font-weight:bold;">${prop.title || 'Alojamiento'}</h4>
                ${prop.price_per_night ? `<p style="margin:4px 0 0;">$${prop.price_per_night} MXN / noche</p>` : ''}
              </div>`
            )
          )
          .addTo(map.current);
        
        markersRef.current.push(marker);
        bounds.extend([lng, lat]); // Expandir los límites para incluir este pin
      }
    });

    // MOVER LA CÁMARA HACIA EL PIN
    if (hasValidCoords) {
      if (properties.length === 1) {
        // Si es una sola casa, volar directo con buen zoom
        const lng = parseFloat(properties[0].longitude);
        const lat = parseFloat(properties[0].latitude);
        map.current.flyTo({ center: [lng, lat], zoom: 14, essential: true });
      } else {
        // Si son varias casas, alejar la cámara para que se vean todas
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    }
  }, [properties]);

  // AJUSTE APLICADO: h-48 para reducir la altura y rounded-xl shadow-inner para integrarlo al diseño
  return <div ref={mapContainer} className="w-full h-48 rounded-xl overflow-hidden shadow-inner" />;
}