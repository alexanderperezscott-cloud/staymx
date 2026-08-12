// src/assets/components/Header.jsx
import React, { useState } from 'react'

export default function Header({ 
  isDarkMode, 
  toggleDarkMode, 
  setPage, 
  page, 
  user, 
  userRole, 
  onOpenAuth, 
  onSignOut,
  onOpenPublish,
  savedCount = 0
}) {
  const userName = user?.user_metadata?.full_name || user?.email || "Usuario"
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigate = (nextPage) => {
    setPage(nextPage)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
        
        {/* LOGO */}
        <div 
          onClick={() => handleNavigate("home")} 
          className="flex items-center gap-2 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigate('home')
            }
          }}
          aria-label="Ir a inicio"
        >
          <span className="text-2xl font-black tracking-tight text-rose-500 group-hover:scale-105 transition-transform">
            staymx
          </span>
        </div>

        {/* NAVEGACIÓN PRINCIPAL (Todos los botones con diseño limpio y normal) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
          <button 
            onClick={() => setPage("home")} 
            className={`hover:text-rose-500 transition-colors ${page === "home" ? "text-rose-500 font-bold" : ""}`}
          >
            Inicio
          </button>

          <button 
            onClick={() => setPage("explore")} 
            className={`hover:text-rose-500 transition-colors ${page === "explore" ? "text-rose-500 font-bold" : ""}`}
          >
            Explorar
          </button>

          <button 
            onClick={() => setPage("favorites")} 
            className={`hover:text-rose-500 transition-colors flex items-center gap-1 ${page === "favorites" ? "text-rose-500 font-bold" : ""}`}
          >
            Favoritos {savedCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{savedCount}</span>}
          </button>

          {user && (
            <button 
              onClick={() => setPage("reservations")} 
              className={`hover:text-rose-500 transition-colors ${page === "reservations" ? "text-rose-500 font-bold" : ""}`}
            >
               Mis Alojamientos
            </button>
          )}

          {user && (
            <button 
              onClick={onOpenPublish} 
              className={`hover:text-rose-500 transition-colors ${page === "publish" ? "text-rose-500 font-bold" : ""}`}
            >
               Modo Anfitrión
            </button>
          )}

          {userRole === "admin" && (
            <button 
              onClick={() => setPage("admin")} 
              className={`hover:text-rose-500 transition-colors ${page === "admin" ? "text-rose-500 font-bold" : ""}`}
            >
               Dashboard Admin
            </button>
          )}
        </nav>

        {/* CONTROLES DE USUARIO Y MODO OSCURO */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Cambiar tema"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {!user ? (
            <button 
              onClick={onOpenAuth}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-label="Iniciar sesión o registrarse"
            >
              <span className="hidden sm:inline">Iniciar sesión / Registrarse</span>
              <span className="sm:hidden">Entrar</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-1 px-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover"/>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                  {userName.split(' ')[0]}
                </span>
              </div>

              <button 
                onClick={onSignOut}
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-full"
                title="Cerrar Sesión"
                aria-label="Cerrar sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 lg:hidden">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2" aria-label="Menú móvil">
            <button onClick={() => handleNavigate('home')} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'home' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
              Inicio
            </button>
            <button onClick={() => handleNavigate('explore')} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'explore' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
              Explorar
            </button>
            <button onClick={() => handleNavigate('favorites')} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'favorites' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
              Favoritos {savedCount > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{savedCount}</span>}
            </button>
            {user && (
              <button onClick={() => handleNavigate('reservations')} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'reservations' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                Mis Alojamientos
              </button>
            )}
            {user && (
              <button onClick={() => { onOpenPublish(); setMobileMenuOpen(false) }} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'publish' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                Modo Anfitrión
              </button>
            )}
            {userRole === 'admin' && (
              <button onClick={() => handleNavigate('admin')} className={`text-left px-3 py-2.5 rounded-xl font-semibold ${page === 'admin' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                Dashboard Admin
              </button>
            )}
            {user && (
              <button onClick={onSignOut} className="text-left px-3 py-2.5 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}