// src/assets/components/Header.jsx
import React, { useState, useEffect } from 'react'
import { supabase, logout } from '../../config/supabase'
import LoginModal from './LoginModal'

export default function Header({ isDarkMode, toggleDarkMode, setPage, page }) {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // 1. Verificar sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 2. Escuchar cambios de sesión (Login, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div 
          onClick={() => setPage && setPage("home")} 
          className="flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-md shadow-rose-500/20">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="text-rose-500 font-bold text-xl tracking-tight hidden sm:block">staymx</span>
        </div>

        {/* MENÚ DE NAVEGACIÓN DERECHA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1">
            {[["home","Inicio"],["explore","Explorar"],["favorites","Favoritos"],["reservations","Mis viajes"],["my-listings","Publicaciones"]].map(([p, label]) => (
              <button 
                key={p} 
                onClick={() => setPage && setPage(p)}
                className={`relative text-xs font-bold px-3 py-2 rounded-full transition-all ${page === p ? "bg-gray-100 dark:bg-gray-800 text-rose-500" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setPage && setPage("publish")} 
            className="hidden sm:block text-xs font-bold text-gray-700 dark:text-gray-200 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            + Modo Anfitrión
          </button>

          {/* BOTÓN MODO OSCURO */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:shadow-sm transition-all"
            title="Alternar modo oscuro"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* BOTÓN DE LOGIN / MUESTRA DE USUARIO LOGUEADO */}
          {user ? (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full pl-3 pr-1 py-1">
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300 max-w-[110px] truncate">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-full transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-full transition shadow-md shadow-rose-500/20"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      {/* MODAL DE LOGIN */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}