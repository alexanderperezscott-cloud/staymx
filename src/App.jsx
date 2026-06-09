import { useState, useEffect } from "react"

const listings = [
  { id:1, title:"Casa colonial en el centro histórico", location:"Campeche, Campeche", price:850, rating:4.97, reviews:184, img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", type:"Casa", guests:6, beds:3, baths:2, tag:"Popular", tagColor:"bg-orange-500", superhost:true, amenities:["WiFi","Cocina","A/C","Estacionamiento"] },
  { id:2, title:"Loft moderno con vista al mar", location:"Mérida, Yucatán", price:1200, rating:4.92, reviews:93, img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", type:"Loft", guests:2, beds:1, baths:1, tag:"Superhost", tagColor:"bg-green-600", superhost:true, amenities:["WiFi","Alberca","Gym","Balcón"] },
  { id:3, title:"Cabaña en la selva con cenote privado", location:"Valladolid, Yucatán", price:2400, rating:4.99, reviews:57, img:"https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80", type:"Cabaña", guests:4, beds:2, baths:1, tag:"Nuevo", tagColor:"bg-indigo-500", superhost:false, amenities:["WiFi","Cenote","Desayuno","Tours"] },
  { id:4, title:"Departamento minimalista en Polanco", location:"Ciudad de México, CDMX", price:1800, rating:4.85, reviews:221, img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", type:"Departamento", guests:4, beds:2, baths:2, tag:"", tagColor:"", superhost:true, amenities:["WiFi","A/C","Cocina","Netflix"] },
  { id:5, title:"Villa de lujo con alberca infinita", location:"Los Cabos, BCS", price:5500, rating:5.0, reviews:38, img:"https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80", type:"Villa", guests:8, beds:4, baths:3, tag:"Lujo", tagColor:"bg-yellow-600", superhost:true, amenities:["WiFi","Alberca","Chef","Spa"] },
  { id:6, title:"Estudio acogedor cerca de la playa", location:"Puerto Vallarta, JAL", price:680, rating:4.78, reviews:145, img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", type:"Estudio", guests:2, beds:1, baths:1, tag:"Económico", tagColor:"bg-teal-600", superhost:false, amenities:["WiFi","Cocina","A/C","Playa cerca"] },
]

const destinations = [
  { name:"Campeche", img:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&q=80", count:"42 alojamientos" },
  { name:"Mérida", img:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80", count:"128 alojamientos" },
  { name:"Cancún", img:"https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400&q=80", count:"315 alojamientos" },
  { name:"CDMX", img:"https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&q=80", count:"872 alojamientos" },
]

const categories = ["Todos","Casa","Loft","Cabaña","Departamento","Villa","Estudio"]

// helpers
const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
const toISO = (d) => d.toISOString().split("T")[0]
const today = toISO(new Date())
const addDays = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate()+n); return toISO(d) }
const diffDays = (a, b) => Math.round((new Date(b)-new Date(a))/(1000*60*60*24))
const fmt = (iso) => new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})

// ── ListingCard ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick, savedIds, onToggleSave }) {
  const isSaved = savedIds.includes(listing.id)
  return (
    <div onClick={()=>onClick(listing)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <div className="relative h-48 overflow-hidden">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover"/>
        {listing.tag && <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>{listing.tag}</span>}
        <button onClick={(e)=>{e.stopPropagation();onToggleSave(listing.id)}} className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:scale-110 transition-transform">
          {isSaved?"❤️":"🤍"}
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1 gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{listing.title}</p>
          <span className="text-xs flex items-center gap-1 shrink-0">⭐ {listing.rating}</span>
        </div>
        <p className="text-xs text-gray-500 mb-1">{listing.location} · {listing.type}</p>
        <p className="text-xs text-gray-400 mb-3">{listing.beds} cama{listing.beds>1?"s":""} · {listing.baths} baño{listing.baths>1?"s":""} · {listing.guests} huéspedes</p>
        <div className="flex justify-between items-center">
          <p className="text-sm"><strong className="text-base">${listing.price.toLocaleString()}</strong><span className="text-gray-400 text-xs"> MXN/noche</span></p>
          <p className="text-xs text-gray-400">{listing.reviews} reseñas</p>
        </div>
      </div>
    </div>
  )
}

// ── Modal con reservaciones ──────────────────────────────────────────────────
function Modal({ listing, onClose, onReserve, reservations }) {
  const [checkIn, setCheckIn]   = useState(addDays(today,1))
  const [checkOut, setCheckOut] = useState(addDays(today,4))
  const [guests, setGuests]     = useState(1)
  const [done, setDone]         = useState(false)

  if (!listing) return null

  // fechas ocupadas para este listing
  const blocked = (reservations||[]).filter(r=>r.listingId===listing.id)
  const isBlocked = blocked.some(r => checkIn < r.checkOut && checkOut > r.checkIn)

  const nights = Math.max(1, diffDays(checkIn, checkOut))
  const base   = listing.price * nights
  const fee    = Math.round(base * 0.12)
  const total  = base + fee

  const handleCheckIn = (v) => {
    setCheckIn(v)
    if (v >= checkOut) setCheckOut(addDays(v,1))
    setDone(false)
  }
  const handleCheckOut = (v) => { setCheckOut(v); setDone(false) }

  const handleReserve = () => {
    if (isBlocked) return
    onReserve({ listingId:listing.id, title:listing.title, img:listing.img, location:listing.location, checkIn, checkOut, guests, nights, total, id:Date.now() })
    setDone(true)
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <img src={listing.img} alt={listing.title} className="w-full h-52 object-cover rounded-t-2xl"/>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-lg leading-snug flex-1 pr-4">{listing.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
          </div>
          <p className="text-sm text-gray-500 mb-2">{listing.location} · {listing.type} · hasta {listing.guests} huéspedes</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold">⭐ {listing.rating}</span>
            <span className="text-xs text-gray-400">({listing.reviews} reseñas)</span>
            {listing.superhost && <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">Superhost</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {listing.amenities.map(a=><span key={a} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">{a}</span>)}
          </div>

          {/* Reservación */}
          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-green-700 mb-1">¡Reservación confirmada!</p>
              <p className="text-sm text-gray-500">{fmt(checkIn)} → {fmt(checkOut)} · {nights} noche{nights>1?"s":""}</p>
              <p className="text-sm font-semibold mt-1">${total.toLocaleString()} MXN total</p>
              <button onClick={onClose} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm transition-colors">Ver mis reservaciones</button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-sm mb-3">Selecciona tus fechas</h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Check-in</label>
                  <input type="date" min={addDays(today,1)} value={checkIn} onChange={e=>handleCheckIn(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Check-out</label>
                  <input type="date" min={addDays(checkIn,1)} value={checkOut} onChange={e=>handleCheckOut(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1">Huéspedes (máx. {listing.guests})</label>
                <input type="number" min="1" max={listing.guests} value={guests} onChange={e=>setGuests(Math.min(listing.guests,Math.max(1,+e.target.value)))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>

              {isBlocked && (
                <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg px-3 py-2">⚠️ Esas fechas ya están reservadas. Elige otras.</p>
              )}

              {blocked.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Fechas ocupadas:</p>
                  {blocked.map(r=>(
                    <p key={r.id} className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mb-1">{fmt(r.checkIn)} → {fmt(r.checkOut)}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-sm mb-2">
                <span>${listing.price.toLocaleString()} × {nights} noche{nights>1?"s":""}</span>
                <span>${base.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>Tarifa de servicio (12%)</span>
                <span>${fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3 mb-4">
                <span>Total</span>
                <span>${total.toLocaleString()} MXN</span>
              </div>

              <button
                onClick={handleReserve}
                disabled={isBlocked}
                className={`w-full font-semibold py-3 rounded-xl transition-colors ${isBlocked?"bg-gray-200 text-gray-400 cursor-not-allowed":"bg-orange-500 hover:bg-orange-600 text-white"}`}
              >
                Confirmar reservación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                   = useState("home")
  const [search, setSearch]               = useState("")
  const [category, setCategory]           = useState("Todos")
  const [selectedListing, setSelectedListing] = useState(null)

  // Favoritos
  const [savedIds, setSavedIds] = useState(()=>{
    try { const s=localStorage.getItem("staymx_favorites"); return s?JSON.parse(s):[] } catch{return[]}
  })
  useEffect(()=>{ localStorage.setItem("staymx_favorites",JSON.stringify(savedIds)) },[savedIds])
  const toggleSave = (id) => setSavedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])
  const savedListings = listings.filter(l=>savedIds.includes(l.id))

  // Reservaciones
  const [reservations, setReservations] = useState(()=>{
    try { const s=localStorage.getItem("staymx_reservations"); return s?JSON.parse(s):[] } catch{return[]}
  })
  useEffect(()=>{ localStorage.setItem("staymx_reservations",JSON.stringify(reservations)) },[reservations])
  const addReservation = (r) => setReservations(prev=>[r,...prev])
  const cancelReservation = (id) => setReservations(prev=>prev.filter(r=>r.id!==id))

  // Filtros
  const filtered = listings.filter(l=>{
    const normalize2 = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    const ms = !search || normalize2(l.title).includes(normalize2(search)) || normalize2(l.location).includes(normalize2(search))
    const mc = category==="Todos" || l.type===category
    return ms && mc
  })

  const goExplore = (term="") => { setSearch(term); setPage("explore") }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div onClick={()=>{setPage("home");setSearch("");setCategory("Todos")}} className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="text-orange-500 text-xl">📍</span>
            <span className="text-orange-500 font-bold text-xl">StayMX</span>
          </div>
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <span className="text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage("explore")}} placeholder="Buscar destino..."
              className="bg-transparent flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"/>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[["home","Inicio"],["explore","Explorar"],["favorites","Favoritos"],["reservations","Mis viajes"],["about","Nosotros"]].map(([p,label])=>(
              <button key={p} onClick={()=>p==="explore"?goExplore():setPage(p)}
                className={`relative text-sm px-3 py-2 rounded-lg transition-colors ${page===p?"text-orange-500 font-medium":"text-gray-500 hover:bg-gray-100"}`}>
                {label}
                {p==="favorites" && savedIds.length>0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{savedIds.length}</span>}
                {p==="reservations" && reservations.length>0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{reservations.length}</span>}
              </button>
            ))}
            <button className="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">Publicar</button>
          </div>
        </div>
      </nav>

      {/* HOME */}
      {page==="home" && (
        <div>
          <div className="relative bg-gray-900 text-white py-20 px-4 text-center overflow-hidden min-h-72 flex items-center justify-center">
            <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{backgroundImage:"url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=60)"}}/>
            <div className="relative max-w-xl mx-auto">
              <p className="text-orange-400 text-xs tracking-widest uppercase mb-4 font-medium">Tu próxima aventura te espera</p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">Descubre México<br/><em className="text-orange-400 not-italic">como nunca antes</em></h1>
              <p className="text-white/60 text-base mb-8 leading-relaxed">Más de 1,400 alojamientos únicos en toda la república.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={()=>goExplore()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">Explorar alojamientos</button>
                <button onClick={()=>goExplore()} className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full transition-colors">Ver destinos</button>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-b border-orange-100">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[["1,400+","Alojamientos"],["38","Ciudades"],["96%","Satisfacción"],["24/7","Soporte"]].map(([n,l])=>(
                <div key={l}><p className="text-2xl font-bold text-orange-500">{n}</p><p className="text-xs text-gray-500 mt-1">{l}</p></div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-14">
            <h2 className="text-2xl font-bold mb-2">Destinos populares</h2>
            <p className="text-gray-500 text-sm mb-8">Los lugares más buscados por nuestros viajeros</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map(d=>(
                <div key={d.name} onClick={()=>goExplore(d.name)} className="rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all bg-white">
                  <img src={d.img} alt={d.name} className="w-full h-36 object-cover"/>
                  <div className="p-3"><p className="font-semibold text-sm">{d.name}</p><p className="text-xs text-gray-400 mt-0.5">{d.count}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 py-14 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">Destacados esta semana</h2>
              <p className="text-gray-500 text-sm mb-8">Seleccionados por nuestro equipo editorial</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0,3).map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}
              </div>
              <div className="text-center mt-10">
                <button onClick={()=>goExplore()} className="border border-gray-300 hover:bg-gray-100 px-8 py-3 rounded-full text-sm transition-colors">Ver todos los alojamientos →</button>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white py-16 px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">¿Tienes un espacio para compartir?</h2>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">Únete a más de 3,200 anfitriones que ya generan ingresos con su propiedad.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">Comenzar a publicar</button>
          </div>
        </div>
      )}

      {/* EXPLORE */}
      {page==="explore" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">{search?`Resultados para "${search}"`:"Explorar alojamientos"}</h2>
            <span className="text-sm text-gray-400">{filtered.length} alojamiento{filtered.length!==1?"s":""}</span>
          </div>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${category===c?"bg-gray-900 text-white border-gray-900":"bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{c}</button>
            ))}
          </div>
          {filtered.length===0
            ? <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-4">🏡</p><p className="text-lg mb-2">No encontramos resultados</p><p className="text-sm">Intenta con otra búsqueda o categoría</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}</div>
          }
        </div>
      )}

      {/* FAVORITES */}
      {page==="favorites" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Mis favoritos</h2>
            {savedListings.length>0 && <button onClick={()=>setSavedIds([])} className="text-sm text-red-400 hover:text-red-600 transition-colors">Borrar todos</button>}
          </div>
          {savedListings.length===0
            ? <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🤍</p><p className="text-lg mb-2">Aún no tienes favoritos</p><p className="text-sm mb-8">Toca el corazón en cualquier alojamiento</p><button onClick={()=>goExplore()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors">Explorar alojamientos</button></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{savedListings.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}</div>
          }
        </div>
      )}

      {/* RESERVACIONES */}
      {page==="reservations" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Mis viajes</h2>
            <span className="text-sm text-gray-400">{reservations.length} reservación{reservations.length!==1?"es":""}</span>
          </div>
          {reservations.length===0
            ? <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🧳</p><p className="text-lg mb-2">No tienes reservaciones aún</p><p className="text-sm mb-8">Explora alojamientos y haz tu primera reservación</p><button onClick={()=>goExplore()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors">Explorar alojamientos</button></div>
            : <div className="flex flex-col gap-4">
                {reservations.map(r=>(
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
                    <img src={r.img} alt={r.title} className="w-full sm:w-40 h-40 sm:h-auto object-cover shrink-0"/>
                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <p className="font-semibold text-base mb-1">{r.title}</p>
                        <p className="text-sm text-gray-500 mb-3">{r.location}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-0.5">Check-in</p><p className="font-semibold text-gray-700">{fmt(r.checkIn)}</p></div>
                          <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-0.5">Check-out</p><p className="font-semibold text-gray-700">{fmt(r.checkOut)}</p></div>
                          <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-0.5">Noches</p><p className="font-semibold text-gray-700">{r.nights}</p></div>
                          <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-0.5">Huéspedes</p><p className="font-semibold text-gray-700">{r.guests}</p></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-lg">${r.total.toLocaleString()} <span className="text-xs font-normal text-gray-400">MXN</span></p>
                        <button onClick={()=>cancelReservation(r.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full transition-colors">Cancelar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ABOUT */}
      {page==="about" && (
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Sobre StayMX</h1>
          <p className="text-gray-500 leading-relaxed mb-8">StayMX nació con la misión de conectar a viajeros mexicanos y extranjeros con los alojamientos más auténticos de México.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {["Verificación de anfitriones","Pagos 100% seguros","Soporte 24/7","Cancelación flexible"].map(v=>(
              <div key={v} className="flex items-center gap-3 bg-orange-50 rounded-xl p-4"><span className="text-orange-500 font-bold">✓</span><span className="text-sm font-medium">{v}</span></div>
            ))}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">Proyecto SPA en React + Tailwind CSS para la Plenaria de Sistemas. Componentes reutilizables, props dinámicos, arreglos de datos y localStorage para persistencia.</p>
        </div>
      )}

      {/* MODAL */}
      <Modal listing={selectedListing} onClose={()=>setSelectedListing(null)} onReserve={(r)=>{addReservation(r);}} reservations={reservations}/>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white/40 text-center py-8 text-xs">
        <p className="text-white font-bold text-lg mb-1">StayMX</p>
        <p>Proyecto Alpha — SPA con React + Tailwind · Plenaria de Sistemas 2025</p>
      </footer>
    </div>
  )
}
