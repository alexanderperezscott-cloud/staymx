// src/assets/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 text-gray-700 dark:text-gray-300 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Columna Izquierda: Branding y Soporte */}
        <div className="space-y-6">
          <div>
            <h3 className="text-3xl font-black text-rose-500 tracking-tight">staymx</h3>
            <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
              Descubre espacios únicos. Tu próxima aventura y descanso empieza aquí.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              Customer Support
            </h4>
            <a 
              href="mailto:staym3xico@gmail.com" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition"
            >
              <span className="text-lg">✉️</span> staym3xico@gmail.com
            </a>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta About Me (Ocupa 2 columnas en Desktop) */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            
            <h4 className="text-xs font-black uppercase text-rose-500 mb-3 tracking-widest flex items-center gap-2">
               Desarrollador
            </h4>
            
            <h5 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Alexander Perez Scott
            </h5>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 max-w-xl">
              Estudiante de 3er cuatrimestre de <strong>Ingeniería de Software en UNID</strong>. Apasionado por la creación de arquitecturas sólidas y experiencias web modernas. Este proyecto fue desarrollado íntegramente como una Single Page Application (SPA).
              Contactame en Alexanderperezscott@gmail.com
            </p>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                 React 19
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                 Tailwind CSS v4
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                 Node.js / Express
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                 PostgreSQL / Supabase
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 gap-4">
        <p>© {new Date().getFullYear()} StayMX. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          Desarrollado en <span className="text-gray-900 dark:text-white font-bold">Campeche, México </span>
        </p>
      </div>
    </footer>
  );
}