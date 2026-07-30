// src/assets/components/AdminDashboard.jsx
import React from 'react'

export default function AdminDashboard({ listings, onDelete }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-2">
            🛡️ Panel de Administración
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión global de publicaciones registradas en StayMX.
          </p>
        </div>
        <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900">
          Modo Admin Activo
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 font-bold text-sm text-gray-700 dark:text-gray-300">
          Total de alojamientos: {listings.length}
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {listings.map(l => (
            <div key={l.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <img src={l.img} alt={l.title} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"/>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{l.title}</h3>
                  <p className="text-xs text-gray-500">{l.location} · <span className="font-semibold text-rose-500">${l.price} MXN/noche</span></p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {l.id}</p>
                </div>
              </div>

              <button 
                onClick={() => onDelete(l.id)} 
                className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
              >
                🗑️ Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}