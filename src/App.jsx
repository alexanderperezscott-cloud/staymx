// src/App.jsx
import { useState, useEffect, useMemo } from "react"
import Header from './assets/components/Header.jsx'
import ListingCard from './assets/components/ListingCard.jsx'
import ReservationModal from './assets/components/ReservationModal.jsx'
import AdminDashboard from './assets/components/AdminDashboard.jsx'
import AuthModal from './assets/components/LoginModal.jsx'
import ReservationChat from './assets/components/ReservationChat.jsx'
import HostModeWrapper from './assets/components/HostModeWrapper.jsx' 
import PropertyMap from './assets/components/PropertyMap.jsx' 
import Footer from './assets/components/Footer.jsx'
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

import { initialListings, tiposOpc } from './data/initialData'

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

  // ESTADOS DEL BUSCADOR AVANZADO
  const [loadingListings, setLoadingListings] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState(15000)
  const [propertyType, setPropertyType] = useState('all')

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
        address: i.address,
        latitude: i.latitude,
        longitude: i.longitude
      }))
      setListings(dbListings)
    } else {
      setListings([])
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

  const handleSignOut = async () => {
    await signOutUser();
    if (page === "reservations" || page === "publish" || page === "admin") {
      setPage("home");
    }
  };

  const savedListings = listings.filter(l => savedIds.includes(l.id))
  const userActiveReservations = reservations.filter(r => user && r.guest_id === user.id && r.status !== 'cancelled')
  const userReservationsAll = reservations.filter(r => user && r.guest_id === user.id && r.status !== 'cancelled')

  const handleSurpriseMe = () => {
    if (listings.length === 0) return
    const randomIndex = Math.floor(Math.random() * listings.length)
    setSelectedListing(listings[randomIndex])
  }

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchPrice = Number(l.price) <= maxPrice
      const matchType = propertyType === 'all' || l.type === propertyType

      return matchSearch && matchPrice && matchType
    })
  }, [listings, searchTerm, maxPrice, propertyType])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans pb-16 lg:pb-0 transition-colors">
      
      <Toaster position="bottom-center" />

      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        setPage={setPage} 
        page={page} 
        user={user}
        userRole={userRole}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenPublish={() => user ? setPage("publish") : setAuthOpen(true)}
        onOpenMyListings={() => user ? setPage("reservations") : setAuthOpen(true)} 
        savedCount={savedIds.length}
        reservationsCount={userActiveReservations.length}
      />

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={u => setUser(u)} />

      {page === "admin" && userRole === "admin" && (
        <AdminDashboard listings={listings} onDelete={handleDeleteListing} />
      )}

      {page === "publish" && ( 
        <HostModeWrapper 
          onPublish={() => { fetchListings(); setPage("explore") }} 
          onCancel={() => setPage("home")} 
          userId={user?.id}
          user={user}
          initialView="list"
          onOpenChat={(reservation, listingInfo) => setChatReservation({ reservation, listingInfo })}
        />
      )}

      {page === "home" && (
        <div>
          <div className="relative bg-gray-900 text-white py-28 px-6 text-center overflow-hidden flex items-center justify-center">
            <div className="relative max-w-xl mx-auto z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-4">Descubre espacios únicos en todo México</h1>
              <div className="flex gap-3 justify-center flex-wrap mt-6">
                <button onClick={() => setPage("explore")} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-bold">Comenzar a explorar</button>
                <button onClick={() => user ? setPage("reservations") : setAuthOpen(true)} className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-bold">
                  Mis Alojamientos
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-14">
            <h2 className="text-2xl font-bold mb-6">Alojamientos destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingListings ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse">
                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  </div>
                ))
              ) : (
                listings.slice(0, 3).map(l => (
                  <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {page === "reservations" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black mb-2">Mis Alojamientos</h2>
          <p className="text-sm text-gray-500 mb-8">Consulta tus próximas estancias, su ubicación y contacta a tu anfitrión.</p>

          {!user ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-semibold">Inicia sesión para ver tus reservaciones.</p>
              <button onClick={() => setAuthOpen(true)} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs">
                Iniciar sesión
              </button>
            </div>
          ) : userReservationsAll.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-base font-semibold">Aún no tienes reservaciones activas registradas.</p>
              <button onClick={() => setPage("explore")} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full font-bold text-xs">
                Explorar alojamientos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {userReservationsAll.map(r => {
                const listingInfo = listings.find(l => l.id === r.listing_id) || {}
                const isCancelled = r.status === 'cancelled'

                return (
                  <div key={r.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-md flex flex-col gap-6 relative">
                    
                    <div className="flex gap-4 items-start">
                      <img src={listingInfo?.img || listingInfo?.images?.[0] || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80"} alt="Alojamiento" className="w-32 h-32 rounded-2xl object-cover shrink-0 shadow-sm"/>
                      
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">{listingInfo?.title || 'Alojamiento en StayMX'}</h3>
                        <p className="text-sm text-rose-500 font-bold mt-1">Del {r.check_in} al {r.check_out}</p>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1 mt-1">
                          📍 {listingInfo?.address ? `Dirección: ${listingInfo.address}` : 'Dirección no especificada'}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">Total pagado: ${r.total_price ? Number(r.total_price).toLocaleString() : '0'} MXN</p>
                        
                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${
                          isCancelled 
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200"
                        }`}>
                          {isCancelled ? '❌ Cancelada' : '✅ Confirmada'}
                        </span>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <a 
                          href={`tel:${listingInfo?.phone || ''}`}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white py-2.5 rounded-xl font-bold text-center text-sm transition flex flex-col items-center justify-center leading-tight"
                        >
                          <span>📞 Contactar con su número</span>
                          <span className="text-[11px] opacity-80 font-normal">{listingInfo?.phone ? `+52 ${listingInfo.phone}` : 'No especificado'}</span>
                        </a>

                        <button 
                          onClick={() => setChatReservation({ reservation: r, listingInfo })}
                          className="flex-1 border-2 border-gray-900 text-gray-900 hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center"
                        >
                          💬 Mensaje directo
                        </button>
                      </div>
                    )}

                    {!isCancelled && listingInfo?.latitude && (
                      <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mt-2">
                         <PropertyMap properties={[listingInfo]} />
                      </div>
                    )}

                    {!isCancelled && (
                      <button 
                        onClick={() => handleCancelReservation(r.id)}
                        className="mt-2 text-sm font-semibold text-rose-500 hover:text-rose-700 hover:underline transition self-center"
                      >
                        Cancelar reservación
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {page === "explore" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-4">Explorar alojamientos</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-3xl shadow-sm flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:w-1/3">
                <span className="absolute left-4 top-3 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Ciudad, lugar o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-none bg-gray-100 dark:bg-gray-950 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="w-full lg:w-1/4">
                <select 
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 border-none bg-gray-100 dark:bg-gray-950 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="all">Cualquier tipo</option>
                  {tiposOpc.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:w-1/4 flex flex-col justify-center px-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-500">Precio máximo</label>
                  <span className="text-xs font-black text-rose-500">${maxPrice} MXN</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="20000" 
                  step="500" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))} 
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
              <button 
                onClick={handleSurpriseMe}
                className="w-full lg:w-auto shrink-0 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                🎲 ¡Sorpréndeme!
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loadingListings ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mt-2"></div>
                </div>
              ))
            ) : filteredListings.length > 0 ? (
              filteredListings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                <span className="text-6xl mb-4 block">🏜️</span>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No encontramos resultados</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Prueba aumentando el precio máximo o quitando los filtros.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setMaxPrice(20000); setPropertyType('all'); }} 
                  className="bg-rose-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-rose-600 transition"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* --- EL CHAT MOVIDO AL FINAL PARA QUE SIEMPRE ESTÉ PRESENTE --- */}
      <ReservationChat 
        isOpen={!!chatReservation} 
        onClose={() => setChatReservation(null)}
        reservation={chatReservation?.reservation}
        listingInfo={chatReservation?.listingInfo}
        currentUser={user}
      />

      <ReservationModal 
        listing={selectedListing} 
        onClose={() => setSelectedListing(null)} 
        onReserve={() => { fetchRes(); fetchListings(); }} 
        reservations={reservations} 
        user={user} 
        openAuth={() => { setSelectedListing(null); setAuthOpen(true); }} 
        activeReservationsCount={userActiveReservations.length} 
      />

      <Footer />

    </div>
  )
}