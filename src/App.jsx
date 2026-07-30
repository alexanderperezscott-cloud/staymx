// src/App.jsx
import { useState, useEffect } from "react"
import Header from './assets/components/Header.jsx'
import ListingCard from './assets/components/ListingCard.jsx'
import ReservationModal from './assets/components/ReservationModal.jsx'
import PublishForm from './assets/components/PublishForm.jsx'
import AdminDashboard from './assets/components/AdminDashboard.jsx'
import AuthModal from './assets/components/LoginModal.jsx'

import { 
  supabase, 
  getListings, 
  deleteListing,
  getReservations, 
  cancelReservation,
  signOutUser, 
  getUserProfile
} from './config/supabase'

import { initialListings } from './data/initialData'

export default function App() {
  const [page, setPage]                       = useState("home")
  const [selectedListing, setSelectedListing] = useState(null)

  // Autenticación y Rol
  const [user, setUser]         = useState(null)
  const [userRole, setUserRole] = useState("user")
  const [authOpen, setAuthOpen] = useState(false)

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
      } else {
        setUserRole("user")
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Modo Oscuro
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("staymx_dark_mode") === "true")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("staymx_dark_mode", isDarkMode)
  }, [isDarkMode])

  // Cargar Alojamientos
  const [listings, setListings] = useState(initialListings)

  async function fetchListings() {
    const { data, error } = await getListings()
    if (!error && data && data.length > 0) {
      const dbListings = data.map(i => ({
        id: i.id, 
        title: i.title, 
        location: `${i.city || i.address || 'México'}, ${i.state || ''}`, 
        price: i.price_per_night || i.price,
        rating: 5.0, 
        reviews: 0, 
        img: i.image_url || i.img, 
        type: i.property_type || 'Alojamiento', 
        guests: i.guests || 2,
        beds: i.beds || 1, 
        baths: i.baths || 1, 
        superhost: false,
        amenities: i.amenities || ["WiFi"], 
        description: i.description, 
        address: i.address
      }))

      const existingIds = new Set(dbListings.map(item => item.id))
      const uniqueInitial = initialListings.filter(item => !existingIds.has(item.id))
      
      setListings([...dbListings, ...uniqueInitial])
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Cargar Reservaciones de la BD
  const [reservations, setReservations] = useState([])
  async function fetchRes() {
    const { data, error } = await getReservations()
    if (!error && data) setReservations(data)
  }

  useEffect(() => {
    fetchRes()
  }, [])

  // Manejo de Cancelación de Reservación
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reservación?")) return

    const { error } = await cancelReservation(reservationId)
    if (error) {
      alert("Error al cancelar la reservación: " + error.message)
    } else {
      alert("Reservación cancelada exitosamente.")
      fetchRes()
      fetchListings()
    }
  }

  // Favoritos
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("staymx_favorites")) || [] } catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem("staymx_favorites", JSON.stringify(savedIds))
  }, [savedIds])

  const toggleSave = (id) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const savedListings = listings.filter(l => savedIds.includes(l.id))
  const userReservations = reservations.filter(r => user && r.guest_id === user.id)

  const handleSurpriseMe = () => {
    if (listings.length === 0) return
    const randomIndex = Math.floor(Math.random() * listings.length)
    setSelectedListing(listings[randomIndex])
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este alojamiento permanentemente?")) return

    const { error } = await deleteListing(id)
    if (error) {
      alert("Error al eliminar: " + error.message)
    } else {
      setListings(prev => prev.filter(l => l.id !== id))
      alert("Alojamiento eliminado con éxito.")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans pb-16 lg:pb-0">
      
      {/* Header */}
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
      />

      {/* Modal Autenticación */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={u => setUser(u)} />

      {/* RUTA: DASHBOARD ADMIN */}
      {page === "admin" && userRole === "admin" && (
        <AdminDashboard listings={listings} onDelete={handleDeleteListing} />
      )}

      {/* RUTA: FORMULARIO PUBLICAR */}
      {page === "publish" && (
        <PublishForm onPublish={() => { fetchListings(); setPage("explore") }} onCancel={() => setPage("home")}/>
      )}

      {/* RUTA: INICIO (HOME) */}
      {page === "home" && (
        <div>
          <div className="relative bg-gray-900 text-white py-28 px-6 text-center overflow-hidden flex items-center justify-center">
            <div className="relative max-w-xl mx-auto z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-4">Descubre espacios únicos en todo México</h1>
              <div className="flex gap-3 justify-center flex-wrap mt-6">
                <button onClick={() => setPage("explore")} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-bold">Comenzar a explorar</button>
                <button onClick={() => user ? setPage("reservations") : setAuthOpen(true)} className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-bold">
                  Mis Reservaciones
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-14">
            <h2 className="text-2xl font-bold mb-6">Alojamientos destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 3).map(l => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RUTA: MIS RESERVACIONES Y CANCELACIÓN */}
      {page === "reservations" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black mb-2">Tus Reservaciones</h2>
          <p className="text-sm text-gray-500 mb-8">Consulta tus próximas estancias y gestiona tus fechas.</p>

          {!user ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-semibold">Inicia sesión para ver tus reservaciones.</p>
              <button onClick={() => setAuthOpen(true)} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs">
                Iniciar sesión
              </button>
            </div>
          ) : userReservations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-semibold">Aún no tienes reservaciones registradas.</p>
              <button onClick={() => setPage("explore")} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs">
                Explorar alojamientos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userReservations.map(r => {
                const listingInfo = listings.find(l => l.id === r.listing_id)
                const isCancelled = r.status === 'cancelled'

                return (
                  <div key={r.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-5 flex gap-4 items-center shadow-sm relative">
                    <img src={listingInfo?.img || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80"} alt="Alojamiento" className="w-24 h-24 rounded-xl object-cover shrink-0"/>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{listingInfo?.title || 'Alojamiento en StayMX'}</h3>
                      <p className="text-xs text-rose-500 font-semibold mt-1">Del {r.check_in} al {r.check_out}</p>
                      <p className="text-xs text-gray-400 mt-1">Huéspedes: {r.guests_count || 1} · Total: ${r.total_price ? Number(r.total_price).toLocaleString() : '0'} MXN</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isCancelled 
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        }`}>
                          {isCancelled ? 'Cancelada' : 'Confirmada'}
                        </span>

                        {!isCancelled && (
                          <button 
                            onClick={() => handleCancelReservation(r.id)}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 underline transition"
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
        </div>
      )}

      {/* RUTA: EXPLORAR */}
      {page === "explore" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-black">Explorar todos los alojamientos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Encuentra tu lugar ideal para tus próximas vacaciones.</p>
            </div>

            <button 
              onClick={handleSurpriseMe}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              🎲 ¡Sorpréndeme!
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
            ))}
          </div>
        </div>
      )}

      {/* RUTA: FAVORITOS */}
      {page === "favorites" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black mb-2">Tus Alojamientos Favoritos</h2>
          <p className="text-sm text-gray-500 mb-8">Lugares que has guardado para tu próximo viaje.</p>

          {savedListings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-3">🤍</p>
              <p className="text-base font-semibold">Aún no has guardado ninguna casa en tus favoritos.</p>
              <button onClick={() => setPage("explore")} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs">
                Explorar listados
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedListings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Reservación */}
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