// src/App.jsx
import { useState, useEffect } from "react"
import Header from './assets/components/Header.jsx'
import { 
  supabase, 
  getListings, 
  createListing, 
  deleteListing,
  getReservations, 
  createReservation, 
  createReservationWithPayment,
  signUpUser, 
  signInUser, 
  signOutUser, 
  loginWithGoogle,
  closeGooglePopup,
  getUserProfile,
  uploadAvatar
} from './config/supabase'

const initialListings = [
  { id:"d64d7323-dfe7-4212-80a4-9c1ec3513", title:"Cabaña en la selva con cenote privado", location:"Valladolid, Yucatán", price:2400, rating:4.99, reviews:57, img:"https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80", type:"Cabaña", guests:4, beds:2, baths:1, superhost:false, amenities:["WiFi","Cenote","Desayuno","Tours"] },
  { id:"11111111-1111-1111-1111-111111111111", title:"Casa colonial en el centro histórico", location:"Campeche, Campeche", price:850, rating:4.97, reviews:184, img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", type:"Casa", guests:6, beds:3, baths:2, superhost:true, amenities:["WiFi","Cocina","A/C","Estacionamiento"] },
  { id:"22222222-2222-2222-2222-222222222222", title:"Loft moderno con vista al mar", location:"Mérida, Yucatán", price:1200, rating:4.92, reviews:93, img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", type:"Loft", guests:2, beds:1, baths:1, superhost:true, amenities:["WiFi","Alberca","Gym","Balcón"] },
  { id:"44444444-4444-4444-4444-444444444444", title:"Departamento minimalista en Polanco", location:"Ciudad de México, CDMX", price:1800, rating:4.85, reviews:221, img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", type:"Departamento", guests:4, beds:2, baths:2, superhost:true, amenities:["WiFi","A/C","Cocina","Netflix"] },
]

const mexicoLocations = {
  "Campeche": ["Campeche Centro", "Ciudad del Carmen", "Champotón", "Calakmul"],
  "Yucatán": ["Mérida", "Valladolid", "Progreso", "Izamal"],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum", "Cozumel", "Holbox"],
  "CDMX": ["Polanco", "Condesa", "Roma Norte", "Coyoacán", "Centro Histórico"],
  "Jalisco": ["Puerto Vallarta", "Guadalajara", "Tequila", "Zapopan"],
  "Baja California Sur": ["Los Cabos", "La Paz", "Todos Santos"]
}

const tiposOpc      = ["Casa","Loft","Cabaña","Departamento","Villa","Estudio"]
const amenidadesOpc = ["WiFi", "Cocina", "Aire Acondicionado", "Alberca", "Estacionamiento", "Gym", "Balcón", "Pet Friendly", "Parrilla", "Vista al Mar"]

const addDays  = (iso,n) => { const d=new Date(iso); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0] }
const diffDays = (a,b) => Math.round((new Date(b)-new Date(a))/(1000*60*60*24))
const today    = new Date().toISOString().split("T")[0]

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(String(email).toLowerCase())
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"

// ── Modal de Autenticación ──────────────────────────────────────────────────
function AuthModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab]           = useState("signup")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        closeGooglePopup()
        if (onSuccess) onSuccess(session.user)
        onClose()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isOpen, onClose, onSuccess])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg("")

    if (!validateEmail(email)) {
      setErrorMsg("Ingresa una dirección de correo válida (ejemplo: nombre@dominio.com).")
      return
    }

    const disposableDomains = ["mailinator.com", "yopmail.com", "tempmail.com", "10minutemail.com"]
    const domain = email.split("@")[1]
    if (disposableDomains.includes(domain)) {
      setErrorMsg("No se permiten direcciones de correo temporales o desechables.")
      return
    }

    setLoading(true)

    if (tab === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Por favor ingresa tu nombre completo.")
        setLoading(false)
        return
      }

      const { data, error } = await signUpUser(email, password, fullName)
      setLoading(false)

      if (error) {
        setErrorMsg(error.message)
      } else {
        if (data?.user) {
          await supabase.from('profiles').upsert([
            { id: data.user.id, full_name: fullName, email, role: 'user' }
          ])
          onSuccess(data.user)
        }
        alert("¡Cuenta creada exitosamente!")
        onClose()
      }
    } else {
      const { data, error } = await signInUser(email, password)
      setLoading(false)

      if (error) setErrorMsg("Correo o contraseña incorrectos.")
      else {
        onSuccess(data.user)
        onClose()
      }
    }
  }

  const handleGoogleAuth = async () => {
    setErrorMsg("")
    const { error } = await loginWithGoogle()
    if (error) setErrorMsg(error.message)
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>

        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
          <button
            type="button"
            onClick={() => { setTab("signup"); setErrorMsg(""); }}
            className={`flex-1 py-3 text-sm font-extrabold text-center border-b-2 transition-all ${
              tab === "signup"
                ? "border-rose-500 text-rose-500"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => { setTab("login"); setErrorMsg(""); }}
            className={`flex-1 py-3 text-sm font-extrabold text-center border-b-2 transition-all ${
              tab === "login"
                ? "border-rose-500 text-rose-500"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {tab === "signup"
            ? "Crea tu cuenta en StayMX para hospedar o realizar reservaciones."
            : "Ingresa tus datos para continuar en StayMX."}
        </p>

        {errorMsg && <p className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-4 font-medium">{errorMsg}</p>}

        <button 
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4 text-gray-800 dark:text-gray-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"/>
          <span className="text-xs text-gray-400 font-medium">o con correo</span>
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"/>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "signup" && (
            <Field label="Nombre Completo *">
              <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ej. Alexander Perez" className={inputCls} />
            </Field>
          )}
          <Field label="Correo Electrónico *">
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className={inputCls} />
          </Field>
          <Field label="Contraseña *">
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </Field>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base py-3.5 rounded-xl shadow-lg transition-colors mt-2"
          >
            {loading ? "Cargando..." : tab === "signup" ? "Crear cuenta gratis 🚀" : "Iniciar Sesión 🔑"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── ListingCard ─────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick, savedIds, onToggleSave }) {
  const isSaved = savedIds.includes(listing.id)
  return (
    <div onClick={() => onClick(listing)} className="group cursor-pointer bg-transparent overflow-hidden">
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 transition-all">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"/>
        
        {listing.superhost && (
          <span className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-800">
            🥇 Superhost
          </span>
        )}

        <button 
          onClick={e => { e.stopPropagation(); onToggleSave(listing.id) }} 
          className="absolute top-3 right-3 bg-transparent text-white/90 text-2xl drop-shadow-md hover:scale-110 active:scale-95 transition-transform"
        >
          {isSaved ? "❤️" : "🤍"}
        </button>
      </div>
      
      <div className="mt-3 px-1">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate flex-1">{listing.title}</p>
          <span className="text-sm flex items-center gap-0.5 shrink-0 text-gray-900 dark:text-gray-50">⭐ {listing.rating ? listing.rating.toFixed(2) : "5.0"}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{listing.location} · {listing.type}</p>
        <div className="flex justify-between items-baseline mt-1">
          <p className="text-sm text-gray-900 dark:text-gray-50">
            <strong className="text-base font-bold">${listing.price ? listing.price.toLocaleString() : "0"}</strong> MXN<span className="font-normal text-gray-500 dark:text-gray-400 text-xs">/noche</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Modal Reservación con Bloqueo de Fechas Ocupadas ─────────────────────────
function Modal({ listing, onClose, onReserve, reservations, user, openAuth }) {
  const [checkIn, setCheckIn]        = useState(addDays(today, 1))
  const [checkOut, setCheckOut]      = useState(addDays(today, 4))
  const [guests, setGuests]          = useState(1)
  const [paymentMethod, setPayment] = useState('card')
  const [done, setDone]              = useState(false)
  const [loading, setLoading]        = useState(false)

  if (!listing) return null

  // Filter existing active reservations for this property
  const activeBookings = (reservations || []).filter(
    r => (r.listing_id === listing.id || r.listingId === listing.id) && r.status !== 'cancelled'
  )

  // Check if selected range overlaps with existing bookings
  const isBlocked = activeBookings.some(r => {
    const resIn = r.check_in || r.checkIn
    const resOut = r.check_out || r.checkOut
    return checkIn < resOut && checkOut > resIn
  })

  const nights = Math.max(1, diffDays(checkIn, checkOut))
  const base   = listing.price * nights
  const fee    = Math.round(base * 0.12)
  const total  = base + fee

  const handleConfirmReservation = async () => {
    if (!user) {
      openAuth()
      return
    }

    if (isBlocked) return

    setLoading(true)
    const { data, error } = await createReservationWithPayment({
      listingId: listing.id,
      checkIn,
      checkOut,
      guests,
      total,
      paymentMethod
    })

    setLoading(false)

    if (error) {
      alert("Error al guardar la reservación: " + error.message)
      return
    }

    onReserve({
      listingId: listing.id,
      title: listing.title,
      img: listing.img,
      location: listing.location,
      checkIn,
      checkOut,
      guests,
      nights,
      total,
      id: data ? data[0]?.id : Date.now()
    })
    setDone(true)
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl transition-all duration-300">
        <div className="relative h-56">
          <img src={listing.img} alt={listing.title} className="w-full h-full object-cover"/>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 dark:bg-gray-850/90 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
        </div>
        <div className="p-6">
          <h2 className="font-bold text-xl text-gray-900 dark:text-gray-50 mb-1">{listing.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{listing.location} · {listing.type}</p>

          {activeBookings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <strong>Fechas ya reservadas en este espacio:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                {activeBookings.map((b, idx) => (
                  <li key={idx}>Del <strong>{b.check_in || b.checkIn}</strong> al <strong>{b.check_out || b.checkOut}</strong></li>
                ))}
              </ul>
            </div>
          )}

          {done ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">¡Reservación y Pago Confirmados!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300">Las fechas han quedado bloqueadas para otros usuarios.</p>
              <button onClick={onClose} className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold mt-4">Listo</button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Check-in</label>
                  <input type="date" min={addDays(today,1)} value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Check-out</label>
                  <input type="date" min={addDays(checkIn,1)} value={checkOut} onChange={e => setCheckOut(e.target.value)} className={inputCls}/>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Método de pago</label>
                <select value={paymentMethod} onChange={e => setPayment(e.target.value)} className={inputCls}>
                  <option value="card">💳 Tarjeta de Crédito / Débito</option>
                  <option value="paypal">🌐 PayPal</option>
                </select>
              </div>

              {isBlocked && (
                <p className="text-rose-600 text-xs font-medium mb-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">
                  ⚠️ Estas fechas no están disponibles porque ya se encuentra reservado.
                </p>
              )}

              <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-800 pt-3 mb-4">
                <span>Total</span><span>${total.toLocaleString()} MXN</span>
              </div>
              
              <button 
                onClick={handleConfirmReservation} 
                disabled={isBlocked || loading}
                className={`w-full font-bold py-3 rounded-xl transition-colors ${
                  isBlocked ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                }`}
              >
                {!user ? "Inicia sesión para reservar" : loading ? "Guardando..." : "Confirmar y pagar reservación"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 🏡 ── FORMULARIO MODO ANFITRIÓN ─────────────────────────────────────────────
function PublishForm({ onPublish, onCancel }) {
  const [step, setStep]       = useState(1)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const [selectedState, setSelectedState] = useState("Campeche")
  const [form, setForm] = useState({
    title:"", type:"Casa", price:"", guests:2, beds:1, baths:1,
    description:"", address:"", city:"Campeche Centro", amenities:[], imgUrl:""
  })

  const set = (k,v) => setForm(p => ({...p, [k]: v}))

  const toggleAmenity = (amenity) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(amenity)
        ? p.amenities.filter(a => a !== amenity)
        : [...p.amenities, amenity]
    }))
  }

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setPreview(ev.target.result); set("imgUrl", ev.target.result) }
    reader.readAsDataURL(file)
  }

  const validateStep = () => {
    const e = {}
    if (step===1 && (!form.title.trim() || !form.price || +form.price <= 0)) e.title = "Campos obligatorios requeridos"
    if (step===2 && (!form.address.trim())) e.address = "Ingresa la dirección exacta"
    if (step===3 && (!form.imgUrl || !form.description.trim())) e.img = "Agrega una foto y descripción"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)

    const newListingData = {
      title: form.title, 
      type: form.type, 
      price: +form.price, 
      guests: +form.guests,
      beds: +form.beds, 
      baths: +form.baths, 
      address: form.address, 
      city: form.city,
      state: selectedState, 
      description: form.description, 
      amenities: form.amenities, 
      img: form.imgUrl,
    }

    const { data, error } = await createListing(newListingData)
    setLoading(false)

    if (error) {
      alert("Error al publicar: " + error.message)
      return
    }

    if (data && data.length > 0) {
      alert("¡Tu alojamiento se ha publicado con éxito en StayMX!")
      onPublish(data[0])
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-900 dark:text-gray-50">
      <button onClick={onCancel} className="text-sm font-semibold text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Cancelar y salir</button>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Registra tu espacio en StayMX</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Conviértete en Anfitrión y comparte tu propiedad con huéspedes de todo México.</p>
        </div>
        <span className="text-xs font-bold bg-rose-100 text-rose-600 px-3 py-1 rounded-full">Paso {step} de 3</span>
      </div>

      {step===1 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">1. Datos principales del alojamiento</h2>
          
          <Field label="Título de tu publicación *" error={errors.title}>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ej. Hermoso Loft Colonial en el Centro" className={inputCls}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de Propiedad">
              <select value={form.type} onChange={e=>set("type",e.target.value)} className={inputCls}>
                {tiposOpc.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Precio por noche (MXN) *">
              <input type="number" min="100" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="Ej. 1200" className={inputCls}/>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <Field label="Capacidad (Huéspedes)">
              <input type="number" min="1" max="20" value={form.guests} onChange={e=>set("guests",+e.target.value)} className={inputCls}/>
            </Field>

            <Field label="Camas">
              <input type="number" min="1" max="10" value={form.beds} onChange={e=>set("beds",+e.target.value)} className={inputCls}/>
            </Field>

            <Field label="Baños">
              <input type="number" min="1" max="10" value={form.baths} onChange={e=>set("baths",+e.target.value)} className={inputCls}/>
            </Field>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">2. Ubicación y Amenidades (Dropdowns)</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estado de la República">
              <select 
                value={selectedState} 
                onChange={e => {
                  setSelectedState(e.target.value)
                  set("city", mexicoLocations[e.target.value][0])
                }} 
                className={inputCls}
              >
                {Object.keys(mexicoLocations).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </Field>

            <Field label="Ciudad / Municipio">
              <select value={form.city} onChange={e=>set("city",e.target.value)} className={inputCls}>
                {mexicoLocations[selectedState].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Dirección exacta *" error={errors.address}>
            <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Ej. Calle 12 #45 por 59 y 61, Col. Centro" className={inputCls}/>
          </Field>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">¿Qué servicios ofrece tu alojamiento?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenidadesOpc.map(a => {
                const checked = form.amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      checked ? "bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/40" : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800 text-gray-600"
                    }`}
                  >
                    {a} {checked && "✓"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">3. Fotografía y Descripción</h2>

          <Field label="Fotografía de la propiedad *" error={errors.img}>
            <input type="file" accept="image/*" onChange={handleImg} className={inputCls}/>
            {preview && (
              <img src={preview} alt="Vista previa" className="w-full h-48 object-cover rounded-2xl mt-3 border border-gray-200"/>
            )}
          </Field>

          <Field label="Descripción detallada *">
            <textarea 
              value={form.description} 
              onChange={e=>set("description",e.target.value)} 
              rows={4} 
              placeholder="Describe lo que hace especial a tu propiedad, zonas cercanas, ambiente, etc." 
              className={inputCls}
            />
          </Field>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold">
            Anterior
          </button>
        ) : <div/>}

        {step < 3 ? (
          <button onClick={() => { if (validateStep()) setStep(s => s + 1) }} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md">
            Siguiente
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md">
            {loading ? "Publicando..." : "Publicar propiedad 🏡"}
          </button>
        )}
      </div>
    </div>
  )
}

// 🛡️ ── DASHBOARD ADMINISTRADOR ────────────────────────────────────────────────
function AdminDashboard({ listings, onDelete }) {
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

// ── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                       = useState("home")
  const [selectedListing, setSelectedListing] = useState(null)

  // Autenticación y Rol
  const [user, setUser]         = useState(null)
  const [userRole, setUserRole] = useState("user")
  const [authOpen, setAuthOpen] = useState(false)

  // Sincronización asegurada de sesión y perfiles
  useEffect(() => {
    async function handleUserSession(session) {
      const u = session?.user ?? null
      setUser(u)

      if (u) {
        closeGooglePopup()
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
          if (data.full_name) {
            u.user_metadata = { ...u.user_metadata, full_name: data.full_name }
          }
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

  // MODO OSCURO
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("staymx_dark_mode") === "true")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("staymx_dark_mode", isDarkMode)
  }, [isDarkMode])

  // Cargar Alojamientos con Respaldo
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

      // Merge avoiding duplicates by ID
      const existingIds = new Set(dbListings.map(item => item.id))
      const uniqueInitial = initialListings.filter(item => !existingIds.has(item.id))
      
      setListings([...dbListings, ...uniqueInitial])
    } else {
      setListings(initialListings)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // FUNCIÓN "SORPRÉNDEME"
  const handleSurpriseMe = () => {
    if (listings.length === 0) return
    const randomIndex = Math.floor(Math.random() * listings.length)
    setSelectedListing(listings[randomIndex])
  }

  // Eliminación por Admin
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

  // Cargar Reservaciones de la BD
  const [reservations, setReservations] = useState([])
  async function fetchRes() {
    const { data, error } = await getReservations()
    if (!error && data) setReservations(data)
  }

  useEffect(() => {
    fetchRes()
  }, [])

  // Manejo de Favoritos
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

  // User's own reservations
  const userReservations = reservations.filter(r => user && r.guest_id === user.id)

  const handleOpenPublish = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setPage("publish")
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
        onOpenPublish={handleOpenPublish}
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

      {/* RUTA: MIS RESERVACIONES */}
      {page === "reservations" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black mb-2">Tus Reservaciones</h2>
          <p className="text-sm text-gray-500 mb-8">Consulta tus próximas estancias y fechas confirmadas.</p>

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
                return (
                  <div key={r.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-5 flex gap-4 items-center shadow-sm">
                    <img src={listingInfo?.img || "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80"} alt="Alojamiento" className="w-24 h-24 rounded-xl object-cover shrink-0"/>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{listingInfo?.title || 'Alojamiento en StayMX'}</h3>
                      <p className="text-xs text-rose-500 font-semibold mt-1">Del {r.check_in} al {r.check_out}</p>
                      <p className="text-xs text-gray-400 mt-1">Huéspedes: {r.guests_count || 1} · Total: ${r.total_price ? Number(r.total_price).toLocaleString() : '0'} MXN</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        Confirmada
                      </span>
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
      <Modal 
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