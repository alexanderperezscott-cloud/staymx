import { useState, useEffect } from "react"

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

// ── Input helper ─────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"

// ── ListingCard ───────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick, savedIds, onToggleSave }) {
  const isSaved = savedIds.includes(listing.id)
  return (
    <div onClick={()=>onClick(listing)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <div className="relative h-48 overflow-hidden">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover"/>
        {listing.tag && <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>{listing.tag}</span>}
        {listing.isOwn && <span className="absolute top-3 right-10 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">Mi publicación</span>}
        <button onClick={e=>{e.stopPropagation();onToggleSave(listing.id)}} className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:scale-110 transition-transform">
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

// ── Modal reservación ─────────────────────────────────────────────────────────
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
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <img src={listing.img} alt={listing.title} className="w-full h-52 object-cover rounded-t-2xl"/>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-lg leading-snug flex-1 pr-4">{listing.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
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
          {listing.description && <p className="text-sm text-gray-500 mb-5 leading-relaxed">{listing.description}</p>}
          {listing.address && <p className="text-xs text-gray-400 mb-5">📍 {listing.address}</p>}

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
                <div><label className="text-xs text-gray-500 block mb-1">Check-in</label>
                  <input type="date" min={addDays(today,1)} value={checkIn} onChange={e=>handleCheckIn(e.target.value)} className={inputCls}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Check-out</label>
                  <input type="date" min={addDays(checkIn,1)} value={checkOut} onChange={e=>{setCheckOut(e.target.value);setDone(false)}} className={inputCls}/></div>
              </div>
              <div className="mb-4"><label className="text-xs text-gray-500 block mb-1">Huéspedes (máx. {listing.guests})</label>
                <input type="number" min="1" max={listing.guests} value={guests} onChange={e=>setGuests(Math.min(listing.guests,Math.max(1,+e.target.value)))} className={inputCls}/></div>
              {isBlocked && <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg px-3 py-2">⚠️ Esas fechas ya están reservadas. Elige otras.</p>}
              {blocked.length>0 && <div className="mb-3"><p className="text-xs text-gray-400 mb-1">Fechas ocupadas:</p>{blocked.map(r=><p key={r.id} className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mb-1">{fmt(r.checkIn)} → {fmt(r.checkOut)}</p>)}</div>}
              <div className="flex justify-between text-sm mb-2"><span>${listing.price.toLocaleString()} × {nights} noche{nights>1?"s":""}</span><span>${base.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-400 mb-3"><span>Tarifa de servicio (12%)</span><span>${fee.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-3 mb-4"><span>Total</span><span>${total.toLocaleString()} MXN</span></div>
              <button onClick={()=>{ if(isBlocked)return; onReserve({listingId:listing.id,title:listing.title,img:listing.img,location:listing.location,checkIn,checkOut,guests,nights,total,id:Date.now()}); setDone(true) }}
                disabled={isBlocked}
                className={`w-full font-semibold py-3 rounded-xl transition-colors ${isBlocked?"bg-gray-200 text-gray-400 cursor-not-allowed":"bg-orange-500 hover:bg-orange-600 text-white"}`}>
                Confirmar reservación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Formulario Publicar ───────────────────────────────────────────────────────
function PublishForm({ onPublish, onCancel }) {
  const [step, setStep]     = useState(1) // 3 pasos
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title:"", type:"Casa", price:"", guests:"1", beds:"1", baths:"1",
    description:"", address:"", city:"", state:"",
    amenities:[], imgFile:null, imgUrl:""
  })

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const toggleAmenidad = (a) => {
    setForm(p=>({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x=>x!==a) : [...p.amenities,a] }))
  }

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
      if (!form.title.trim())       e.title    = "El título es obligatorio"
      if (!form.price || +form.price<=0) e.price = "Ingresa un precio válido"
      if (!form.type)               e.type     = "Selecciona un tipo"
    }
    if (step===2) {
      if (!form.address.trim())     e.address  = "La dirección es obligatoria"
      if (!form.city.trim())        e.city     = "La ciudad es obligatoria"
      if (!form.state.trim())       e.state    = "El estado es obligatorio"
    }
    if (step===3) {
      if (!form.imgUrl)             e.img      = "Agrega una imagen"
      if (!form.description.trim()) e.description = "Agrega una descripción"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if(validateStep()) setStep(s=>s+1) }
  const back = () => { setStep(s=>s-1); setErrors({}) }

  const handleSubmit = () => {
    if (!validateStep()) return
    const newListing = {
      id: Date.now(),
      title: form.title,
      location: `${form.city}, ${form.state}`,
      address: form.address,
      price: +form.price,
      rating: 5.0,
      reviews: 0,
      img: form.imgUrl,
      type: form.type,
      guests: +form.guests,
      beds: +form.beds,
      baths: +form.baths,
      tag: "Nuevo",
      tagColor: "bg-blue-500",
      superhost: false,
      amenities: form.amenities.length>0 ? form.amenities : ["WiFi"],
      description: form.description,
      isOwn: true,
    }
    onPublish(newListing)
    setSuccess(true)
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🏡</p>
      <h2 className="text-2xl font-bold mb-3">¡Tu alojamiento está publicado!</h2>
      <p className="text-gray-500 text-sm mb-8">Ya aparece en la sección Explorar para que otros viajeros lo encuentren.</p>
      <button onClick={onCancel} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">Ver mis publicaciones</button>
    </div>
  )

  const steps = ["Información básica","Ubicación","Fotos y descripción"]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1">← Cancelar</button>
      <h1 className="text-2xl font-bold mb-2">Publica tu alojamiento</h1>
      <p className="text-gray-500 text-sm mb-8">Comparte tu espacio con viajeros de toda la república</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s,i)=>(
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step>i+1?"bg-green-500 text-white":step===i+1?"bg-orange-500 text-white":"bg-gray-200 text-gray-400"}`}>
              {step>i+1?"✓":i+1}
            </div>
            <span className={`text-xs hidden sm:block ${step===i+1?"text-orange-500 font-medium":"text-gray-400"}`}>{s}</span>
            {i<steps.length-1 && <div className={`flex-1 h-0.5 ${step>i+1?"bg-green-400":"bg-gray-200"}`}/>}
          </div>
        ))}
      </div>

      {/* PASO 1 — Información básica */}
      {step===1 && (
        <div className="flex flex-col gap-5">
          <Field label="Título del alojamiento *" error={errors.title}>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Ej. Casa colonial con jardín en el centro" className={inputCls}/>
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
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.amenities.includes(a)?"bg-orange-500 text-white border-orange-500":"bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}>
                  {a}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* PASO 2 — Ubicación */}
      {step===2 && (
        <div className="flex flex-col gap-5">
          <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-700">
            📍 La ubicación ayuda a los viajeros a encontrar tu alojamiento más fácilmente.
          </div>

          <Field label="Dirección completa *" error={errors.address}>
            <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Ej. Calle 59 #12, Centro Histórico" className={inputCls}/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ciudad *" error={errors.city}>
              <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Ej. Campeche" className={inputCls}/>
            </Field>
            <Field label="Estado *" error={errors.state}>
              <input value={form.state} onChange={e=>set("state",e.target.value)} placeholder="Ej. Campeche" className={inputCls}/>
            </Field>
          </div>

          {/* Vista previa de ubicación */}
          {form.city && form.state && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="font-medium text-sm">{form.city}, {form.state}</p>
                {form.address && <p className="text-xs text-gray-400 mt-0.5">{form.address}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — Fotos y descripción */}
      {step===3 && (
        <div className="flex flex-col gap-5">
          <Field label="Foto principal *" error={errors.img}>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="w-full h-56 object-cover"/>
                  <button onClick={()=>{setPreview(null);set("imgUrl","");set("imgFile",null)}}
                    className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-50">✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-4xl mb-3">📷</span>
                  <span className="text-sm font-medium text-gray-600">Haz clic para subir una foto</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP · máx. 10MB</span>
                  <input type="file" accept="image/*" onChange={handleImg} className="hidden"/>
                </label>
              )}
            </div>
          </Field>

          <Field label="Descripción del alojamiento *" error={errors.description}>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)}
              placeholder="Describe tu espacio: ambiente, características especiales, qué hace único a tu alojamiento, qué hay cerca..."
              rows={5} className={inputCls+" resize-none"}/>
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} caracteres</p>
          </Field>

          {/* Resumen final */}
          {form.title && form.price && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-medium text-orange-700 mb-2">Resumen de tu publicación</p>
              <p className="font-semibold text-sm">{form.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{form.city && form.state ? `${form.city}, ${form.state}` : ""} · {form.type}</p>
              <p className="text-sm font-bold text-orange-500 mt-1">${(+form.price).toLocaleString()} MXN/noche</p>
            </div>
          )}
        </div>
      )}

      {/* Botones navegación */}
      <div className="flex justify-between mt-8">
        {step>1
          ? <button onClick={back} className="px-6 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">← Anterior</button>
          : <div/>
        }
        {step<3
          ? <button onClick={next} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-medium transition-colors">Siguiente →</button>
          : <button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-medium transition-colors">Publicar alojamiento 🏡</button>
        }
      </div>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]               = useState("home")
  const [search, setSearch]           = useState("")
  const [category, setCategory]       = useState("Todos")
  const [selectedListing, setSelectedListing] = useState(null)

  // Listings (iniciales + publicados por el usuario)
  const [listings, setListings] = useState(()=>{
    try { const s=localStorage.getItem("staymx_listings"); return s?[...initialListings,...JSON.parse(s)]:initialListings } catch{return initialListings}
  })
  const addListing = (l) => {
    const owned = listings.filter(x=>x.isOwn)
    const updated = [...owned, l]
    localStorage.setItem("staymx_listings", JSON.stringify(updated))
    setListings([...initialListings, ...updated])
  }

  // Favoritos
  const [savedIds, setSavedIds] = useState(()=>{ try{const s=localStorage.getItem("staymx_favorites");return s?JSON.parse(s):[]}catch{return[]} })
  useEffect(()=>{ localStorage.setItem("staymx_favorites",JSON.stringify(savedIds)) },[savedIds])
  const toggleSave = (id) => setSavedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const savedListings = listings.filter(l=>savedIds.includes(l.id))

  // Reservaciones
  const [reservations, setReservations] = useState(()=>{ try{const s=localStorage.getItem("staymx_reservations");return s?JSON.parse(s):[]}catch{return[]} })
  useEffect(()=>{ localStorage.setItem("staymx_reservations",JSON.stringify(reservations)) },[reservations])
  const addReservation    = (r) => setReservations(p=>[r,...p])
  const cancelReservation = (id) => setReservations(p=>p.filter(r=>r.id!==id))

  // Mis publicaciones
  const myListings = listings.filter(l=>l.isOwn)

  // Filtros
  const filtered = listings.filter(l=>{
    const ms = !search || normalize(l.title).includes(normalize(search)) || normalize(l.location).includes(normalize(search))
    const mc = category==="Todos" || l.type===category
    return ms && mc
  })

  const goExplore = (term="") => { setSearch(term); setPage("explore") }

  if (page==="publish") return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 h-16 flex items-center">
        <div onClick={()=>setPage("home")} className="flex items-center gap-2 cursor-pointer">
          <span className="text-orange-500 text-xl">📍</span>
          <span className="text-orange-500 font-bold text-xl">StayMX</span>
        </div>
      </nav>
      <PublishForm onPublish={(l)=>{ addListing(l); setPage("my-listings") }} onCancel={()=>setPage("home")}/>
    </div>
  )

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
            {[["home","Inicio"],["explore","Explorar"],["favorites","Favoritos"],["reservations","Mis viajes"],["my-listings","Mis publicaciones"]].map(([p,label])=>(
              <button key={p} onClick={()=>p==="explore"?goExplore():setPage(p)}
                className={`relative text-sm px-3 py-2 rounded-lg transition-colors ${page===p?"text-orange-500 font-medium":"text-gray-500 hover:bg-gray-100"}`}>
                {label}
                {p==="favorites" && savedIds.length>0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{savedIds.length}</span>}
                {p==="reservations" && reservations.length>0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{reservations.length}</span>}
                {p==="my-listings" && myListings.length>0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{myListings.length}</span>}
              </button>
            ))}
            <button onClick={()=>setPage("publish")} className="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">+ Publicar</button>
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
                <button onClick={()=>setPage("publish")} className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full transition-colors">Publicar mi espacio</button>
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
            <button onClick={()=>setPage("publish")} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">Comenzar a publicar</button>
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
            {categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${category===c?"bg-gray-900 text-white border-gray-900":"bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{c}</button>)}
          </div>
          {filtered.length===0
            ? <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-4">🏡</p><p className="text-lg mb-2">No encontramos resultados</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}</div>
          }
        </div>
      )}

      {/* FAVORITES */}
      {page==="favorites" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold">Mis favoritos</h2>
            {savedListings.length>0 && <button onClick={()=>setSavedIds([])} className="text-sm text-red-400 hover:text-red-600">Borrar todos</button>}
          </div>
          {savedListings.length===0
            ? <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🤍</p><p className="text-lg mb-2">Aún no tienes favoritos</p><button onClick={()=>goExplore()} className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full text-sm">Explorar</button></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{savedListings.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}</div>
          }
        </div>
      )}

      {/* RESERVACIONES */}
      {page==="reservations" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold">Mis viajes</h2><span className="text-sm text-gray-400">{reservations.length} reservación{reservations.length!==1?"es":""}</span></div>
          {reservations.length===0
            ? <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🧳</p><p className="text-lg mb-2">No tienes reservaciones aún</p><button onClick={()=>goExplore()} className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full text-sm">Explorar</button></div>
            : <div className="flex flex-col gap-4">{reservations.map(r=>(
                <div key={r.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
                  <img src={r.img} alt={r.title} className="w-full sm:w-40 h-40 sm:h-auto object-cover shrink-0"/>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div><p className="font-semibold text-base mb-1">{r.title}</p><p className="text-sm text-gray-500 mb-3">{r.location}</p>
                      <div className="flex flex-wrap gap-3">
                        {[["Check-in",fmt(r.checkIn)],["Check-out",fmt(r.checkOut)],["Noches",r.nights],["Huéspedes",r.guests]].map(([k,v])=>(
                          <div key={k} className="bg-orange-50 rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-0.5">{k}</p><p className="font-semibold text-gray-700">{v}</p></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">${r.total.toLocaleString()} <span className="text-xs font-normal text-gray-400">MXN</span></p>
                      <button onClick={()=>cancelReservation(r.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-full">Cancelar</button>
                    </div>
                  </div>
                </div>
              ))}</div>
          }
        </div>
      )}

      {/* MIS PUBLICACIONES */}
      {page==="my-listings" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Mis publicaciones</h2>
            <button onClick={()=>setPage("publish")} className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2.5 rounded-full transition-colors">+ Nueva publicación</button>
          </div>
          {myListings.length===0
            ? <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🏠</p><p className="text-lg mb-2">Aún no has publicado ningún alojamiento</p><button onClick={()=>setPage("publish")} className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full text-sm">Publicar ahora</button></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{myListings.map(l=><ListingCard key={l.id} listing={l} onClick={setSelectedListing} savedIds={savedIds} onToggleSave={toggleSave}/>)}</div>
          }
        </div>
      )}

      <Modal listing={selectedListing} onClose={()=>setSelectedListing(null)} onReserve={addReservation} reservations={reservations}/>

      <footer className="bg-gray-900 text-white/40 text-center py-8 text-xs">
        <p className="text-white font-bold text-lg mb-1">StayMX</p>
        <p>Proyecto Alpha — SPA con React + Tailwind · Plenaria de Sistemas 2025</p>
      </footer>
    </div>
  )
}
