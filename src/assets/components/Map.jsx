import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function PropertyMap({ properties = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Inicializar solo una vez

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326], // CDMX por defecto
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  // Agregar marcadores
  useEffect(() => {
    if (!map.current) return;

    properties.forEach((prop) => {
      if (prop.latitude && prop.longitude) {
        new mapboxgl.Marker({ color: '#FF385C' }) // Color Airbnb
          .setLngLat([prop.longitude, prop.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: sans-serif;">
                <h4 style="margin:0; font-weight:bold;">${prop.title}</h4>
                <p style="margin:4px 0 0;">$${prop.price_per_night} MXN / noche</p>
              </div>`
            )
          )
          .addTo(map.current);
      }
    });
  }, [properties]);

  return <div ref={mapContainer} className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg" />;
}