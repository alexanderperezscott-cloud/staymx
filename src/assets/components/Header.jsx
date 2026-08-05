// src/assets/components/Header.jsx
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 transition-colors duration-300">
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

          {/* MIS ALOJAMIENTOS (Lugares que estás rentando para viajar) */}
          {user && (
            <button 
              onClick={() => setPage("reservations")} 
              className={`hover:text-rose-500 transition-colors ${page === "reservations" ? "text-rose-500 font-bold" : ""}`}
            >
               Mis Alojamientos
            </button>
          )}

          {/* MODO ANFITRIÓN (Panel para ver tus propiedades publicadas o crear nuevas) */}
          {user && (
            <button 
              onClick={onOpenPublish} 
              className={`hover:text-rose-500 transition-colors ${page === "publish" ? "text-rose-500 font-bold" : ""}`}
            >
               Modo Anfitrión
            </button>
          )}

          {/* DASHBOARD ADMIN */}
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
        <div className="flex items-center gap-3">
          
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
            title="Cambiar tema"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {!user ? (
            <button 
              onClick={onOpenAuth}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-colors"
            >
              Iniciar sesión / Registrarse
            </button>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              
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
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors"
                title="Cerrar Sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}