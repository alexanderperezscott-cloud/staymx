// src/App.jsx
import { useState, useEffect } from "react"
import Header from './assets/components/Header.jsx'
import { getListings, createListing } from './config/supabase'

const initialListings = [
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

const categories  = ["Todos","Casa","Loft","Cabaña","Departamento","Villa","Estudio"]
const tiposOpc    = ["Casa","Loft","Cabaña","Departamento","Villa","Estudio"]
const amenidadesOpc = ["WiFi","Cocina","A/C","Alberca","Estacionamiento","Gym","Balcón","Desayuno","Mascotas","Jardín","Parrilla","Vista al mar"]

const normalize  = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
const toISO      = (d) => d.toISOString().split("T")[0]
const today      = toISO(new Date())
const addDays    = (iso,n) => { const d=new Date(iso); d.setDate(d.getDate()+n); return toISO(d) }
const diffDays   = (a,b) => Math.round((new Date(b)-new Date(a))/(1000*60*60*24))
const fmt        = (iso) => new Date(iso+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})

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

// ── ListingCard ─────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick, savedIds, onToggleSave }) {
  const isSaved = savedIds.includes(listing.id)
  return (
    <div onClick={()=>onClick(listing)} className="group cursor-pointer bg-transparent overflow-hidden">
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 transition-all">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"/>
        
        {listing.superhost && (
          <span className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-800">
            🥇 Superhost
          </span>
        )}
        
        {listing.tag && !listing.superhost && (
          <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm`}>
            {listing.tag}
          </span>
        )}

        {listing.isOwn && (
          <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow-md">
            Tu publicación
          </span>
        )}

        <button 
          onClick={e=>{e.stopPropagation(); onToggleSave(listing.id)}} 
          className="absolute top-3 right-3 bg-transparent text-white/90 text-2xl drop-shadow-md hover:scale-110 active:scale-95 transition-transform"
        >
          {isSaved ? "❤️" : "🤍"}
        </button>
      </div>
      
      <div className="mt-3 px-1">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate flex-1">{listing.title}</p>
          <span className="text-sm flex items-center gap-0.5 shrink-0 text-gray-900 dark:text-gray-50">⭐ {listing.rating.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{listing.location} · {listing.type}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{listing.beds} beds · {listing.baths} baths · {listing.guests} huéspedes</p>
        <div className="flex justify-between items-baseline mt-1">
          <p className="text-sm text-gray-900 dark:text-gray-50">
            <strong className="text-base font-bold">${listing.price.toLocaleString()}</strong> MXN<span className="font-normal text-gray-500 dark:text-gray-400 text-xs">/noche</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{listing.reviews} reseñas</p>
        </div>
      </div>
    </div>
  )
}

// ── Modal Reservación ─────────────────────────────────────────────────────────
function Modal({ listing, onClose, onReserve, reservations }) {
  const [checkIn,  setCheckIn]  = useState(addDays(today,1))
  const [checkOut, setCheckOut] = useState(addDays(today,4))
  const [guests,   setGuests]   = useState(1)
  const [done,     setDone]     = useState(false)

  if (!listing) return null

  const blocked   = (reservations||[]).filter(r=>r.listingId===listing.id)
  const isBlocked = blocked.some(r=>checkIn<r.checkOut && checkOut>r.checkIn)
  const nights    = Math.max(1,diffDays(checkIn,checkOut))
  const base      = listing.price*nights
  const fee       = Math.round(base*0.12)
  const total     = base+fee

  const handleCheckIn = (v) => { setCheckIn(v); if(v>=checkOut) setCheckOut(addDays(v,1)); setDone(false) }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div onClick={e=>e.stopPropagation()} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl transition-all duration-300">
        <div className="relative h-56">
          <img src={listing.img} alt={listing.title} className="w-full h-full object-cover"/>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 dark:bg-gray-850/90 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-105 transition-transform font-bold">✕</button>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-xl leading-snug text-gray-900 dark:text-gray-50 flex-1 pr-4">{listing.title}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{listing.location} · {listing.type} · Máx. {listing.guests} huéspedes</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">⭐ {listing.rating}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({listing.reviews} reseñas)</span>
            {listing.superhost && <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-md">🥇 Superhost</span>}
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-5">
            {listing.amenities.map(a=><span key={a} className="bg-gray-100 dark:bg-gray-800 text-gray-750 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">{a}</span>)}
          </div>
          {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{listing.description}</p>}
          {listing.address && <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">📍 {listing.address}</p>}

          {done ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 text-center shadow-inner">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">¡Reservación confirmada exitosamente!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{fmt(checkIn)} → {fmt(checkOut)} · {nights} noche{nights>1?"s":""}</p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-50 mt-2">${total.toLocaleString()} MXN total</p>
              <button onClick={onClose} className="mt-4 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow transition-colors">Listo</button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3">Elige tus fechas</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Check-in</label>
                  <input type="date" min={addDays(today,1)} value={checkIn} onChange={e=>handleCheckIn(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Check-out</label>
                  <input type="date" min={addDays(checkIn,1)} value={checkOut} onChange={e=>{setCheckOut(e.target.value);setDone(false)}} className={inputCls}/>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Huéspedes (máx. {listing.guests})</label>
                <input type="number" min="1" max={listing.guests} value={guests} onChange={e=>setGuests(Math.min(listing.guests,Math.max(1,+e.target.value)))} className={inputCls}/>
              </div>
              
              {isBlocked && <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mb-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg px-3 py-2">⚠️ Estas fechas colisionan con una reserva existente.</p>}
              {blocked.length>0 && <div className="mb-3"><p className="text-xs font-semibold text-gray-400 mb-1">Fechas ocupadas:</p>{blocked.map(r=><p key={r.id} className="text-xs text-gray-500 bg-gray-200/50 dark:bg-gray-800 rounded px-2 py-1 mb-1">{fmt(r.checkIn)} → {fmt(r.checkOut)}</p>)}</div>}
              
              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2"><span>${listing.price.toLocaleString()} × {nights} noche{nights>1?"s":""}</span><span className="font-medium text-gray-900 dark:text-gray-100">${base.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-400 mb-3"><span>Tarifa de servicio StayMX (12%)</span><span>${fee.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-50 border-t border-gray-200 dark:border-gray-800 pt-3 mb-4"><span>Total</span><span>${total.toLocaleString()} MXN</span></div>
              
              <button onClick={()=>{ if(isBlocked)return; onReserve({listingId:listing.id,title:listing.title,img:listing.img,location:listing.location,checkIn,checkOut,guests,nights,total,id:Date.now()}); setDone(true) }}
                disabled={isBlocked}
                className={`w-full font-bold py-3 rounded-xl transition-colors ${isBlocked?"bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed":"bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10"}`}>
                Confirmar reservación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PublishForm ─────────────────────────────────────────────────────────────
function PublishForm({ onPublish, onCancel }) {
  const [step, setStep]       = useState(1)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors]   = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title:"", type:"Casa", price:"", guests:"1", beds:"1", baths:"1",
    description:"", address:"", city:"", state:"",
    amenities:[], imgFile:null, imgUrl:""
  })

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const toggleAmenidad = (a) => setForm(p=>({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x=>x!==a) : [...p.amenities,a] }))

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    set("imgFile", file)
    const reader = new FileReader()
    reader.onload = (ev) => { setPreview(ev.target.result); set("imgUrl", ev.target.result) }
    reader.readAsDataURL(file)
  }

  const validateStep = () => {
    const e = {}
    if (step===1) {
      if (!form.title.trim()) e.title = "El título es obligatorio"
      if (!form.price || +form.price<=0) e.price = "Ingresa un precio válido"
      if (!form.type) e.type = "Selecciona un tipo"
    }
    if (step===2) {
      if (!form.address.trim()) e.address = "La dirección es obligatoria"
      if (!form.city.trim()) e.city = "La ciudad es obligatoria"
      if (!form.state.trim()) e.state = "El estado es obligatorio"
    }
    if (step===3) {
      if (!form.imgUrl) e.img = "Agrega una imagen"
      if (!form.description.trim()) e.description = "Agrega una descripción"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if(validateStep()) setStep(s=>s+1) }
  const back = () => { setStep(s=>s-1); setErrors({}) }

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
      state: form.state,
      description: form.description,
      amenities: form.amenities.length > 0 ? form.amenities : ["WiFi"],
      img: form.imgUrl,
    }

    // 1. Guardar en Supabase
    const { data, error } = await createListing(newListingData)

    setLoading(false)

    if (error) {
      console.error("Error al guardar en Supabase:", error.message)
      alert("Hubo un error al publicar el alojamiento: " + error.message)
      return
    }

    // 2. Formatear la respuesta devuelta por Supabase para la interfaz
    if (data && data.length > 0) {
      const item = data[0]
      const formattedListing = {
        id: item.id,
        title: item.title,
        location: `${item.city}, ${item.state}`,
        address: item.address,
        price: item.price_per_night,
        rating: 5.0,
        reviews: 0,
        img: item.image_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
        type: item.property_type,
        guests: item.guests,
        beds: item.beds,
        baths: item.baths,
        tag: "Nuevo",
        tagColor: "bg-rose-500",
        superhost: false,
        amenities: item.amenities || ["WiFi"],
        description: item.description,
        isOwn: true,
      }

      onPublish(formattedListing)
      setSuccess(true)
    }
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🏡</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">¡Tu alojamiento está publicado!</h2>
      <p className="text-gray-500 dark:text-gray-450 text-sm mb-8">Ya aparece guardado en Supabase y en la sección Explorar para que otros viajeros lo encuentren.</p>
      <button onClick={onCancel} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium shadow-md transition-colors">Ver mis publicaciones</button>
    </div>
  )

  const steps = ["Información básica","Ubicación","Fotos y descripción"]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 bg-transparent text-gray-900 dark:text-gray-50">
      <button onClick={onCancel} className="text-sm font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 flex items-center gap-1">← Cancelar y salir</button>
      <h1 className="text-2xl font-bold mb-2">Publica tu espacio en StayMX</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Comparte la comodidad de tu hogar con viajeros de todo el país.</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s,i)=>(
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step>i+1?"bg-emerald-500 text-white":step===i+1?"bg-rose-500 text-white":"bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"}`}>
              {step>i+1?"✓":i+1}
            </div>
            <span className={`text-xs hidden sm:block ${step===i+1?"text-rose-500 font-bold":"text-gray-400"}`}>{s}</span>
            {i<steps.length-1 && <div className={`flex-1 h-0.5 ${step>i+1?"bg-emerald-400":"bg-gray-200 dark:bg-gray-800"}`}/>}
          </div>
        ))}
      </div>

      {step===1 && (
        <div className="flex flex-col gap-5">
          <Field label="Título del alojamiento *" error={errors.title}>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ej. Loft moderno con vista panorámica" className={inputCls}/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de propiedad *" error={errors.type}>
              <select value={form.type} onChange={e=>set("type",e.target.value)} className={inputCls}>
                {tiposOpc.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Precio por noche (MXN) *" error={errors.price}>
              <input type="number" min="1" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="Ej. 1200" className={inputCls}/>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Huéspedes máx.">
              <input type="number" min="1" max="20" value={form.guests} onChange={e=>set("guests",e.target.value)} className={inputCls}/>
            </Field>
            <Field label="Camas">
              <input type="number" min="1" max="10" value={form.beds} onChange={e=>set("beds",e.target.value)} className={inputCls}/>
            </Field>
            <Field label="Baños">
              <input type="number" min="1" max="10" value={form.baths} onChange={e=>set("baths",e.target.value)} className={inputCls}/>
            </Field>
          </div>
          <Field label="Amenidades disponibles">
            <div className="flex flex-wrap gap-2 mt-1">
              {amenidadesOpc.map(a=>(
                <button key={a} type="button" onClick={()=>toggleAmenidad(a)}
                  className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${form.amenities.includes(a)?"bg-rose-500 text-white border-rose-500 shadow-sm":"bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-rose-400"}`}>
                  {a}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step===2 && (
        <div className="flex flex-col gap-5">
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 text-sm text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30">
            📍 La ubicación exacta ayuda a los huéspedes a coordinar sus traslados de manera óptima.
          </div>
          <Field label="Dirección completa *" error={errors.address}>
            <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Ej. Av. Resurgimiento #45" className={inputCls}/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Ciudad (Ej. Campeche)" className={inputCls}/>
            <input value={form.state} onChange={e=>set("state",e.target.value)} placeholder="Estado (Ej. Campeche)" className={inputCls}/>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="flex flex-col gap-5">
          <Field label="Foto principal *" error={errors.img}>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="w-full h-56 object-cover"/>
                  <button onClick={()=>{setPreview(null);set("imgUrl","");set("imgFile",null)}}
                    className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow">✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sube una fotografía de tu espacio</span>
                  <input type="file" accept="image/*" onChange={handleImg} className="hidden"/>
                </label>
              )}
            </div>
          </Field>
          <Field label="Descripción del alojamiento *" error={errors.description}>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)}
              placeholder="Detalla qué hace único tu alojamiento, qué servicios incluyes o qué puntos de interés quedan cerca..."
              rows={5} className={inputCls+" resize-none"}/>
          </Field>
        </div>
      )}

      <div className="flex justify-between mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
        {step>1 ? <button onClick={back} className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Anterior</button> : <div/>}
        {step<3
          ? <button onClick={next} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-rose-500/10 transition-colors">Siguiente</button>
          : <button onClick={handleSubmit} disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-rose-500/10 transition-colors">
              {loading ? "Guardando en Supabase..." : "Publicar ahora 🏡"}
            </button>
        }
      </div>
    </div>
  )
}

// ── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("home")
  const [search, setSearch]           = useState("")
  const [category, setCategory]       = useState("Todos")
  const [selectedListing, setSelectedListing] = useState(null)

  // MODO OSCURO
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("staymx_dark_mode")
      return saved === "true"
    } catch { return false }
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
      localStorage.setItem("staymx_dark_mode", "true")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("staymx_dark_mode", "false")
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(prev => !prev)

  // ESTADO DE ALOJAMIENTOS CON CARGA DE SUPABASE
  const [listings, setListings] = useState(initialListings)

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await getListings()
      
      if (error) {
        console.error('Error al cargar publicaciones de Supabase:', error.message)
      } else if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title,
          location: `${item.city}, ${item.state}`,
          price: item.price_per_night,
          rating: 5.0,
          reviews: 0,
          img: item.image_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
          type: item.property_type,
          guests: item.guests,
          beds: item.beds,
          baths: item.baths,
          tag: "Nuevo",
          tagColor: "bg-rose-500",
          superhost: false,
          amenities: item.amenities || ["WiFi"],
          description: item.description,
          address: item.address
        }))
        
        setListings([...formattedData, ...initialListings])
      }
    }

    fetchListings()
  }, [])
  
  const addListing = (newListing) => {
    setListings(prevListings => [newListing, ...prevListings])
  }

  const [savedIds, setSavedIds] = useState(()=>{ try{const s=localStorage.getItem("staymx_favorites");return s?JSON.parse(s):[]}catch{return[]} })
  useEffect(()=>{ localStorage.setItem("staymx_favorites",JSON.stringify(savedIds)) },[savedIds])
  const toggleSave = (id) => setSavedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const savedListings = listings.filter(l=>savedIds.includes(l.id))

  const [reservations, setReservations] = useState(()=>{ try{const s=localStorage.getItem("staymx_reservations");return s?JSON.parse(s):[]}catch{return[]} })
  useEffect(()=>{ localStorage.setItem("staymx_reservations",JSON.stringify(reservations)) },[reservations])
  const addReservation    = (r) => setReservations(p=>[r,...p])
  const cancelReservation = (id) => setReservations(p=>p.filter(r=>r.id!==id))

  const myListings = listings.filter(l=>l.isOwn)

  const filtered = listings.filter(l=>{
    const ms = !search || normalize(l.title).includes(normalize(search)) || normalize(l.location).includes(normalize(search))
    const mc = category==="Todos" || l.type===category
    return ms && mc
  })

  const goExplore = (term="") => { setSearch(term); setPage("explore") }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans transition-colors duration-300 pb-16 lg:pb-0">
      
      {/* Componente Header reutilizable */}
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        setPage={setPage} 
        page={page} 
      />

      {/* RUTA: FORMULARIO PUBLICAR */}
      {page==="publish" && (
        <PublishForm onPublish={(l)=>{ addListing(l); setPage("my-listings") }} onCancel={()=>setPage("home")}/>
      )}

      {/* RUTA: INICIO (HOME) */}
      {page==="home" && (
        <div>
          {/* Hero Banner Minimalista */}
          <div className="relative bg-gray-900 text-white py-28 px-6 text-center overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{backgroundImage:"url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=60)"}}/>
            <div className="relative max-w-xl mx-auto z-10">
              <p className="text-rose-400 text-xs tracking-widest uppercase mb-3 font-bold">Tu próxima experiencia te espera</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">Descubre espacios únicos<br/>en todo México</h1>
              <p className="text-white/80 text-sm md:text-base mb-8 font-medium">Encuentra cabañas, lofts y villas con la calidez de un hogar.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={()=>goExplore()} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-md shadow-rose-500/10 transition-colors">Comenzar a explorar</button>
                <button onClick={()=>setPage("publish")} className="backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-3 rounded-full font-bold transition-all">Publicar mi espacio</button>
              </div>
            </div>
          </div>
          
          {/* Métricas */}
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[["1,400+","Alojamientos premium"],["38","Destinos validados"],["96%","Reseñas 5 estrellas"],["24/7","Asistencia local"]].map(([n,l])=>(
                <div key={l}><p className="text-xl font-black text-rose-500">{n}</p><p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{l}</p></div>
              ))}
            </div>
          </div>

          {/* Destinos Populares */}
          <div className="max-w-7xl mx-auto px-6 py-14">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-1">Destinos recomendados</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Los rincones más visitados del país</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map(d=>(
                <div key={d.name} onClick={()=>goExplore(d.name)} className="group rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-800 cursor-pointer hover:shadow-md transition-all bg-white dark:bg-gray-900">
                  <div className="h-32 overflow-hidden"><img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"/></div>
                  <div className="p-3"><p className="font-bold text-sm text-gray-900 dark:text-gray-100">{d.name}</p><p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{d.count}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Galería Destacados */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-1">Alojamientos destacados de la semana</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Inspeccionados y aprobados por nuestro equipo</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {listings.slice(0,3).map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}
            </div>
          </div>
        </div>
      )}

      {/* RUTA: EXPLORAR */}
      {page==="explore" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{search?`Resultados en "${search}"`:"Explorar todos los alojamientos"}</h2>
            </div>
            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full">{filtered.length} opciones encontradas</span>
          </div>
          
          {/* Filtro de Categorías */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-3 border-b border-gray-100 dark:border-gray-900 scrollbar-none">
            {categories.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} 
                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${category===c?"bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-950 border-gray-900 dark:border-gray-50":"bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"}`}>
                {c}
              </button>
            ))}
          </div>

          {filtered.length===0 ? (
            <div className="text-center py-20 text-gray-400"><p className="text-5xl mb-3">🏡</p><p className="text-base font-semibold">No se encontraron alojamientos con esos criterios.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filtered.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}
            </div>
          )}
        </div>
      )}

      {/* RUTA: FAVORITOS */}
      {page==="favorites" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Tus favoritos</h2>
            {savedListings.length>0 && <button onClick={()=>setSavedIds([])} className="text-sm font-semibold text-rose-500 hover:text-rose-600">Remover todos</button>}
          </div>
          {savedListings.length===0 ? (
            <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-3">🤍</p><p className="text-base font-semibold mb-4">Aún no has guardado alojamientos.</p><button onClick={()=>goExplore()} className="bg-rose-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow">Explorar listados</button></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {savedListings.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}
            </div>
          )}
        </div>
      )}

      {/* RUTA: VIAJES */}
      {page==="reservations" && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Tus reservaciones de viaje</h2>
          </div>
          {reservations.length===0 ? (
            <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-3">🧳</p><p className="text-base font-semibold mb-4">No tienes viajes agendados de momento.</p><button onClick={()=>goExplore()} className="bg-rose-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow">Buscar hospedaje</button></div>
          ) : (
            <div className="flex flex-col gap-4">
              {reservations.map(r=>(
                <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                  <img src={r.img} alt={r.title} className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"/>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-gray-50 mb-0.5 leading-tight">{r.title}</p>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">{r.location}</p>
                      <div className="flex flex-wrap gap-2">
                        {[["Check-in",fmt(r.checkIn)],["Check-out",fmt(r.checkOut)],["Estancia",`${r.nights} noches`],["Huéspedes",r.guests]].map(([k,v]) => (
                          <div key={k} className="bg-gray-55 dark:bg-gray-800 rounded-xl px-3 py-1.5 text-xs border border-gray-100 dark:border-gray-850"><p className="text-gray-400 dark:text-gray-500 mb-0.5 font-medium">{k}</p><p className="font-bold text-gray-800 dark:text-gray-200">{v}</p></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-850 pt-3">
                      <p className="font-bold text-base text-gray-900 dark:text-gray-50">${r.total.toLocaleString()} <span className="text-xs font-normal text-gray-400">MXN total</span></p>
                      <button onClick={()=>cancelReservation(r.id)} className="text-xs font-bold text-rose-500 hover:text-white border border-rose-200 dark:border-rose-900 hover:bg-rose-500 dark:hover:bg-rose-600 px-4 py-1.5 rounded-full transition-all">Cancelar viaje</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RUTA: MIS PUBLICACIONES */}
      {page==="my-listings" && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tus propiedades en StayMX</h2>
            </div>
            <button onClick={()=>setPage("publish")} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow transition-colors">+ Registrar alojamiento</button>
          </div>
          {myListings.length===0 ? (
            <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-3">🏠</p><p className="text-base font-semibold mb-4">Aún no administras ninguna propiedad listada.</p><button onClick={()=>setPage("publish")} className="bg-rose-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow">Registrar ahora</button></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {myListings.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}
            </div>
          )}
        </div>
      )}

      <Modal listing={selectedListing} onClose={()=>setSelectedListing(null)} onReserve={addReservation} reservations={reservations}/>

      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 text-gray-400 text-center py-10 text-xs transition-colors duration-300 mt-20">
        <p className="text-rose-500 font-bold text-base mb-1">staymx</p>
        <p className="font-medium">© 2026 StayMX Inc. · Ingeniería de Software</p>
      </footer>
    </div>
  )
}