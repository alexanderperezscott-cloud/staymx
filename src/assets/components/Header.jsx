// src/assets/components/Header.jsx
export default function Header({ 
  isDarkMode, 
  toggleDarkMode, 
  setPage, 
  page, 
  user, 
  userRole, 
  onOpenAuth, 
  onSignOut 
}) {
  // Obtener la inicial del nombre o correo del usuario
  const userName = user?.user_metadata?.full_name || user?.email || "Usuario"
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url // Si se loguea con Google, traerá foto

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => setPage("home")} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-2xl font-black tracking-tight text-rose-500 group-hover:scale-105 transition-transform">
            staymx
          </span>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
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

          {userRole === "admin" && (
            <button 
              onClick={() => setPage("admin")} 
              className={`text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all ${page === "admin" ? "ring-2 ring-amber-400" : ""}`}
            >
              🛡️ Dashboard Admin
            </button>
          )}
        </nav>

        {/* CONTROLES DE USUARIO Y MODO OSCURO */}
        <div className="flex items-center gap-3">
          
          {/* Botón Modo Oscuro */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
            title="Cambiar tema"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* SI EL USUARIO NO ESTÁ LOGUEADO */}
          {!user ? (
            <button 
              onClick={onOpenAuth}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-colors"
            >
              Iniciar sesión / Registrarse
            </button>
          ) : (
            /* SI EL USUARIO SÍ ESTÁ LOGUEADO -> MOSTRAR PERFIL/FOTO */
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              
              {/* Icono/Foto de Perfil */}
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

              {/* Botón Cerrar Sesión */}
              <button 
                onClick={onSignOut}
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors"
                title="Cerrar Sesión"
              >
                Salir 🚪
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}