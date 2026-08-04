// src/App.jsx
import { useState, useEffect, useMemo } from "react"
import Header from './assets/components/Header.jsx'
import ListingCard from './assets/components/ListingCard.jsx'
import ReservationModal from './assets/components/ReservationModal.jsx'
import AdminDashboard from './assets/components/AdminDashboard.jsx'
import AuthModal from './assets/components/LoginModal.jsx'
import ReservationChat from './assets/components/ReservationChat.jsx'
import HostModeWrapper from './assets/components/HostModeWrapper.jsx' 
import toast, { Toaster } from 'react-hot-toast'

import { 
  supabase, 
  getListings, 
  deleteListing,
  getReservations, 
  cancelReservation,
  signOutUser, 
  getUserProfile,
  getUserFavorites,  
  toggleFavorite     
} from './config/supabase'

import { initialListings } from './data/initialData'

export default function App() {
  const [page, setPage]                       = useState("home")
  const [selectedListing, setSelectedListing] = useState(null)

  // Auth & Roles
  const [user, setUser]         = useState(null)
  const [userRole, setUserRole] = useState("user")
  const [authOpen, setAuthOpen] = useState(false)

  // Favoritos
  const [savedIds, setSavedIds] = useState([])
  
  // Chat
  const [chatReservation, setChatReservation] = useState(null)

  // Buscador y Carga 
  const [loadingListings, setLoadingListings] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function handleUserSession(session) {
      const u = session?.user ?? null
      setUser(u)

      if (u) {
        let { data } = await getUserProfile(u.id)

        if (!data) {
          const userFullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuario'
          
          const { data: createdProfile } = await supabase.from('profiles').upsert([
            {
              id: u.id,
              full_name: userFullName,
              email: u.email,
              avatar_url: u.user_metadata?.avatar_url || null,
              role: 'user'
            }
          ]).select().maybeSingle()

          setUserRole(createdProfile?.role || 'user')
        } else {
          setUserRole(data.role || 'user')
        }

        fetchUserFavorites()
      } else {
        setUserRole("user")
        try {
          const localFavs = JSON.parse(localStorage.getItem("staymx_favorites")) || []
          setSavedIds(localFavs)
        } catch { setSavedIds([]) }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserFavorites() {
    const { data } = await getUserFavorites()
    if (data) {
      const dbFavs = data.map(f => f.listing_id)
      setSavedIds(dbFavs)
      localStorage.setItem("staymx_favorites", JSON.stringify(dbFavs))
    }
  }

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("staymx_dark_mode") === "true")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    document.body.style.backgroundColor = isDarkMode ? "#030712" : "#ffffff"
    localStorage.setItem("staymx_dark_mode", isDarkMode)
  }, [isDarkMode])

  // Load Listings from Supabase
  const [listings, setListings] = useState([])

  async function fetchListings() {
    setLoadingListings(true)
    const { data, error } = await getListings()
    
    if (!error && data && data.length > 0) {
      const dbListings = data.map(i => ({
        id: i.id,
        host_id: i.host_id, 
        title: i.title, 
        location: `${i.city || i.address || 'México'}, ${i.state || ''}`, 
        price: i.price_per_night || i.price,
        phone: i.phone || 'No especificado',
        rating: 5.0, 
        reviews: 0, 
        img: i.image_url || i.img || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80", 
        images: i.images || [i.image_url || i.img].filter(Boolean),
        type: i.property_type || 'Alojamiento', 
        guests: i.guests || 2,
        beds: i.beds || 1, 
        baths: i.baths || 1, 
        superhost: false,
        amenities: i.amenities || ["WiFi"], 
        description: i.description, 
        address: i.address
      }))
      setListings(dbListings)
    } else {
      setListings(initialListings)
    }
    setLoadingListings(false)
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Load Reservations
  const [reservations, setReservations] = useState([])
  async function fetchRes() {
    const { data, error } = await getReservations()
    if (!error && data) setReservations(data)
  }

  useEffect(() => {
    fetchRes()
  }, [])

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reservación?")) return
    const { error } = await cancelReservation(reservationId)
    if (error) {
      toast.error("Error al cancelar: " + error.message)
    } else {
      toast.success("Reservación cancelada exitosamente.")
      fetchRes()
      fetchListings()
    }
  }

  const toggleSave = async (id) => {
    const isCurrentlySaved = savedIds.includes(id)
    const newSavedIds = isCurrentlySaved ? savedIds.filter(x => x !== id) : [...savedIds, id]
    
    setSavedIds(newSavedIds)
    localStorage.setItem("staymx_favorites", JSON.stringify(newSavedIds))

    if (user) {
      try {
        await toggleFavorite(id, isCurrentlySaved)
        toast.success(isCurrentlySaved ? 'Eliminado de favoritos' : 'Guardado en favoritos', {
          icon: isCurrentlySaved ? '💔' : '❤️',
          style: { borderRadius: '10px', background: isDarkMode ? '#1F2937' : '#fff', color: isDarkMode ? '#fff' : '#333' }
        })
      } catch (error) {
        toast.error("Error guardando favorito")
        setSavedIds(savedIds)
      }
    } else {
      toast('Inicia sesión para guardarlo en todos tus dispositivos', { icon: '💡' })
    }
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este alojamiento permanentemente?")) return
    const { error } = await deleteListing(id)
    if (error) {
      toast.error("Error al eliminar: " + error.message)
    } else {
      setListings(prev => prev.filter(l => l.id !== id))
      toast.success("Alojamiento eliminado con éxito.")
    }
  }

  const savedListings = listings.filter(l => savedIds.includes(l.id))
  const userActiveReservations = reservations.filter(r => user && r.guest_id === user.id && r.status !== 'cancelled')
  const userReservationsAll = reservations.filter(r => user && r.guest_id === user.id)

  const handleSurpriseMe = () => {
    if (listings.length === 0) return
    const randomIndex = Math.floor(Math.random() * listings.length)
    setSelectedListing(listings[randomIndex])
  }

  const filteredListings = useMemo(() => {
    return listings.filter(l => 
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [listings, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans pb-16 lg:pb-0 transition-colors duration-300">
      
      <Toaster position="bottom-center" />

      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        setPage={setPage} 
        page={page} 
        user={user}
        userRole={userRole}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={signOutUser}
        onOpenPublish={() => user ? setPage("publish") : setAuthOpen(true)}
        savedCount={savedIds.length}
        reservationsCount={userActiveReservations.length}
      />

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={u => setUser(u)} />

      {/* ADMIN ROUTE */}
      {page === "admin" && userRole === "admin" && (
        <AdminDashboard listings={listings} onDelete={handleDeleteListing} />
      )}

      {/* PUBLISH ROUTE (MODO ANFITRIÓN CON INE) */}
      {page === "publish" && (
        <HostModeWrapper 
          onPublish={() => { fetchListings(); setPage("explore") }} 
          onCancel={() => setPage("home")} 
        />
      )}

      {/* HOME ROUTE */}
      {page === "home" && (
        <div className="animate-in fade-in duration-500">
          {/* NUEVO HERO SECTION PREMIUM */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-32 px-6 text-center overflow-hidden flex items-center justify-center border-b border-gray-800/50">
            {/* Elementos decorativos de fondo tipo Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[60%] bg-rose-500/20 rounded-full blur-[120px]"></div>
              <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
            </div>
            
            <div className="relative max-w-3xl mx-auto z-10">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight drop-shadow-lg">
                Descubre espacios <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">únicos</span> en todo México
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
                Encuentra y reserva cabañas, lofts y casas espectaculares diseñadas para tus próximas vacaciones inolvidables.
              </p>
              <div className="flex gap-4 justify-center flex-wrap mt-6">
                <button 
                  onClick={() => setPage("explore")} 
                  className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                >
                  Comenzar a explorar
                </button>
                <button 
                  onClick={() => user ? setPage("reservations") : setAuthOpen(true)} 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Mis Reservaciones
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight">Alojamientos destacados</h2>
              <button onClick={() => setPage("explore")} className="text-rose-500 font-bold hover:text-rose-600 hover:underline hidden sm:block">Ver todos &rarr;</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingListings ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse">
                    <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2"></div>
                  </div>
                ))
              ) : (
                listings.slice(0, 3).map(l => (
                  <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
                ))
              )}
            </div>
            <button onClick={() => setPage("explore")} className="mt-8 w-full py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors sm:hidden">
              Ver todos los alojamientos
            </button>
          </div>
        </div>
      )}

      {/* MIS RESERVACIONES ROUTE */}
      {page === "reservations" && (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-4xl font-black tracking-tight mb-2">Tus Reservaciones</h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-10">Consulta tus próximas estancias y gestiona tus fechas.</p>

          {!user ? (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <span className="text-6xl mb-4 block">✈️</span>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">Inicia sesión para ver tus viajes</p>
              <button onClick={() => setAuthOpen(true)} className="mt-6 bg-rose-500 text-white px-8 py-3 rounded-full font-bold transition hover:bg-rose-600 hover:scale-105 shadow-lg shadow-rose-500/20">
                Iniciar sesión
              </button>
            </div>
          ) : userReservationsAll.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <span className="text-6xl mb-4 block">🏝️</span>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">Aún no tienes reservaciones registradas.</p>
              <p className="text-gray-500 mt-2">¡Es el momento perfecto para planear tu próxima aventura!</p>
              <button onClick={() => setPage("explore")} className="mt-6 bg-rose-500 text-white px-8 py-3 rounded-full font-bold transition hover:bg-rose-600 hover:scale-105 shadow-lg shadow-rose-500/20">
                Explorar alojamientos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userReservationsAll.map(r => {
                const listingInfo = listings.find(l => l.id === r.listing_id)
                const isCancelled = r.status === 'cancelled'

                return (
                  <div key={r.id} className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    {/* Indicador de estado visual */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isCancelled ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    
                    <img src={listingInfo?.img || listingInfo?.image || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80"} alt="Alojamiento" className="w-full sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0 shadow-sm"/>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">{listingInfo?.title || 'Alojamiento en StayMX'}</h3>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3 border border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">🗓️ {r.check_in} al {r.check_out}</p>
                        <p className="text-xs text-gray-500 mt-1">Huéspedes: {r.guests_count || 1} · Total: <span className="font-bold text-gray-900 dark:text-gray-100">${r.total_price ? Number(r.total_price).toLocaleString() : '0'} MXN</span></p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <button 
                          onClick={() => setChatReservation({ reservation: r, listingInfo })}
                          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2"
                        >
                           Mensaje al anfitrión
                        </button>
                        
                        <a href={`tel:${listingInfo?.phone}`} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                           Llamar
                        </a>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isCancelled 
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        }`}>
                          {isCancelled ? 'Cancelada' : 'Confirmada'}
                        </span>

                        {!isCancelled && (
                          <button 
                            onClick={() => handleCancelReservation(r.id)}
                            className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            Cancelar estancia
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <ReservationChat 
            isOpen={!!chatReservation} 
            onClose={() => setChatReservation(null)}
            reservation={chatReservation?.reservation}
            listingInfo={chatReservation?.listingInfo}
            currentUser={user}
          />
        </div>
      )}

      {/* EXPLORE ROUTE (CON BUSCADOR MEJORADO) */}
      {page === "explore" && (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black tracking-tight">Explorar alojamientos</h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Encuentra tu lugar ideal para tus próximas vacaciones.</p>
            </div>

            {/* NUEVO BUSCADOR GLASSMORPHISM */}
            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <input
                type="text"
                placeholder="Buscar por ciudad, estado o título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full pl-14 pr-6 py-4 border border-gray-200 dark:border-gray-700/50 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
              />
              <span className="absolute left-6 top-4 text-xl">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {loadingListings ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2"></div>
                </div>
              ))
            ) : filteredListings.length > 0 ? (
              filteredListings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <span className="text-6xl mb-4 block">🌵</span>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No encontramos resultados</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">No hay alojamientos que coincidan con "{searchTerm}".</p>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAVORITES ROUTE */}
      {page === "favorites" && (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-4xl font-black tracking-tight mb-2">Tus Favoritos</h2>
          <p className="text-base text-gray-500 mb-10">Lugares que has guardado para tu próximo viaje.</p>

          {savedListings.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-6xl mb-4">🤍</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">Aún no has guardado ninguna casa</p>
              <p className="text-gray-500 mt-2 mb-6">Toca el corazón en cualquier alojamiento para guardarlo aquí.</p>
              <button onClick={() => setPage("explore")} className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold transition hover:bg-rose-600 hover:scale-105 shadow-lg shadow-rose-500/20">
                Explorar listados
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
              {savedListings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
              ))}
            </div>
          )}
        </div>
      )}

      <ReservationModal 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
        onReserve={() => { fetchRes(); fetchListings(); }} 
        reservations={reservations} 
        user={user} 
        openAuth={() => { setSelectedListing(null); setAuthOpen(true); }} 
      />

    </div>
  )
}