// src/components/Header.jsx
import React, { useState } from 'react';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo - Usamos el nombre de tu proyecto */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
             <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-rose-500 hidden md:block">staymx</span>
        </div>

        {/* Barra de Búsqueda Minimalista (Centro) - Recreando la de image_0.png */}
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900">
          <div className="px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800">
            Cualquier lugar
          </div>
          <div className="px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800">
            Cualquier semana
          </div>
          <div className="px-5 py-2.5 text-sm text-gray-500 dark:text-gray-400">
            ¿Cuántos?
          </div>
          <div className="p-2 ml-1">
            <button className="bg-rose-500 text-white p-2.5 rounded-full hover:bg-rose-600">
              <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M27 27l-7-7m2-6a8 8 0 11-16 0 8 8 0 0116 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Acciones del Usuario (Derecha) */}
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-900 dark:text-gray-100 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Pon tu casa
          </button>
          
          {/* Botón para cambiar Modo Oscuro */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isDarkMode ? (
              // Icono Sol
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 21v-2.25m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              // Icono Luna
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {/* Menú de Usuario Minimalista */}
          <button className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-full pl-4 pr-2 py-1.5 hover:shadow-md transition bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M4 8h24M4 16h24M4 24h24"></path>
            </svg>
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
              AM
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;