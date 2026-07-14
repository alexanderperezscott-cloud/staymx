// src/components/ListingCard.jsx
import React from 'react';

const ListingCard = ({ listing }) => {
  return (
    <div className="group cursor-pointer">
      {/* Contenedor de Imagen con Ratio de Aspecto */}
      <div className="aspect-[20/19] w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Etiqueta 'Favorito entre huéspedes' (Inspirado en image_0.png) */}
        {listing.guestFavorite && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-950/80 backdrop-blur-sm text-gray-950 dark:text-gray-50 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            Favorito entre huéspedes
          </div>
        )}
        
        {/* Botón Corazón (Favoritos) */}
        <button className="absolute top-3 right-3 text-white/70 hover:text-rose-500 hover:scale-110 transition">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>

      {/* Detalles del Anuncio */}
      <div className="mt-3 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-950 dark:text-gray-50 truncate transition-colors duration-300">
            {listing.title}
          </div>
          {/* Calificación (Inspirado en image_0.png) */}
          <div className="flex items-center gap-1 text-sm text-gray-950 dark:text-gray-50 transition-colors duration-300">
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-gray-950 dark:text-gray-50 transition-colors duration-300">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            <span className="font-medium">{listing.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 truncate">
          {listing.description}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {listing.dates}
        </p>
        <p className="mt-1 text-base text-gray-950 dark:text-gray-50 transition-colors duration-300">
          <span className="font-semibold">${listing.price.toLocaleString('es-MX')} MXN</span>
          <span className="font-normal"> la noche</span>
        </p>
      </div>
    </div>
  );
};

export default ListingCard;