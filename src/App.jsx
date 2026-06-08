import { useState } from "react"

const listings = [
  {
    id: 1,
    title: "Casa colonial en el centro histórico",
    location: "Campeche, Campeche",
    price: 850,
    rating: 4.97,
    reviews: 184,
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    type: "Casa",
    guests: 6,
    beds: 3,
    baths: 2,
    tag: "Popular",
    tagColor: "bg-orange-500",
    superhost: true,
    amenities: ["WiFi", "Cocina", "A/C", "Estacionamiento"],
  },
  {
    id: 2,
    title: "Loft moderno con vista al mar",
    location: "Mérida, Yucatán",
    price: 1200,
    rating: 4.92,
    reviews: 93,
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    type: "Loft",
    guests: 2,
    beds: 1,
    baths: 1,
    tag: "Superhost",
    tagColor: "bg-green-600",
    superhost: true,
    amenities: ["WiFi", "Alberca", "Gym", "Balcón"],
  },
  {
    id: 3,
    title: "Cabaña en la selva con cenote privado",
    location: "Valladolid, Yucatán",
    price: 2400,
    rating: 4.99,
    reviews: 57,
    img: "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80",
    type: "Cabaña",
    guests: 4,
    beds: 2,
    baths: 1,
    tag: "Nuevo",
    tagColor: "bg-indigo-500",
    superhost: false,
    amenities: ["WiFi", "Cenote", "Desayuno", "Tours"],
  },
  {
    id: 4,
    title: "Departamento minimalista en Polanco",
    location: "Ciudad de México, CDMX",
    price: 1800,
    rating: 4.85,
    reviews: 221,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    type: "Departamento",
    guests: 4,
    beds: 2,
    baths: 2,
    tag: "",
    tagColor: "",
    superhost: true,
    amenities: ["WiFi", "A/C", "Cocina", "Netflix"],
  },
  {
    id: 5,
    title: "Villa de lujo con alberca infinita",
    location: "Los Cabos, BCS",
    price: 5500,
    rating: 5.0,
    reviews: 38,
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
    type: "Villa",
    guests: 8,
    beds: 4,
    baths: 3,
    tag: "Lujo",
    tagColor: "bg-yellow-600",
    superhost: true,
    amenities: ["WiFi", "Alberca", "Chef", "Spa"],
  },
  {
    id: 6,
    title: "Estudio acogedor cerca de la playa",
    location: "Puerto Vallarta, JAL",
    price: 680,
    rating: 4.78,
    reviews: 145,
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    type: "Estudio",
    guests: 2,
    beds: 1,
    baths: 1,
    tag: "Económico",
    tagColor: "bg-teal-600",
    superhost: false,
    amenities: ["WiFi", "Cocina", "A/C", "Playa cerca"],
  },
]

const destinations = [
  { name: "Campeche", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&q=80", count: "42 alojamientos" },
  { name: "Mérida", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80", count: "128 alojamientos" },
  { name: "Cancún", img: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400&q=80", count: "315 alojamientos" },
  { name: "CDMX", img: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&q=80", count: "872 alojamientos" },
]

const categories = ["Todos", "Casa", "Loft", "Cabaña", "Departamento", "Villa", "Estudio"]

// ── Componente: tarjeta de alojamiento ──────────────────────────────────────
function ListingCard({ listing, onClick }) {
  const [saved, setSaved] = useState(false)

  return (
    <div
      onClick={() => onClick(listing)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={listing.img} alt={listing.title} className="w-full h-full object-cover" />
        {listing.tag && (
          <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
            {listing.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setSaved((s) => !s) }}
          className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:scale-110 transition-transform"
        >
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1 gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{listing.title}</p>
          <span className="text-xs flex items-center gap-1 shrink-0">⭐ {listing.rating}</span>
        </div>
        <p className="text-xs text-gray-500 mb-1">{listing.location} · {listing.type}</p>
        <p className="text-xs text-gray-400 mb-3">{listing.beds} cama{listing.beds > 1 ? "s" : ""} · {listing.baths} baño{listing.baths > 1 ? "s" : ""} · {listing.guests} huéspedes</p>
        <div className="flex justify-between items-center">
          <p className="text-sm">
            <strong className="text-base">${listing.price.toLocaleString()}</strong>
            <span className="text-gray-400 text-xs"> MXN/noche</span>
          </p>
          <p className="text-xs text-gray-400">{listing.reviews} reseñas</p>
        </div>
      </div>
    </div>
  )
}

// ── Componente: modal de reserva ────────────────────────────────────────────
function Modal({ listing, onClose }) {
  const [nights, setNights] = useState(3)
  const [guests, setGuests] = useState(2)

  if (!listing) return null

  const base = listing.price * nights
  const fee = Math.round(base * 0.12)
  const total = base + fee

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
      >
        <img src={listing.img} alt={listing.title} className="w-full h-56 object-cover rounded-t-2xl" />

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-lg leading-snug flex-1 pr-4">{listing.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
          </div>

          <p className="text-sm text-gray-500 mb-2">{listing.location} · {listing.type} · hasta {listing.guests} huéspedes</p>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold">⭐ {listing.rating}</span>
            <span className="text-xs text-gray-400">({listing.reviews} reseñas)</span>
            {listing.superhost && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">Superhost</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {listing.amenities.map((a) => (
              <span key={a} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">{a}</span>
            ))}
          </div>

          {/* Calculadora */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-sm mb-3">Calcular tu estadía</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Noches</label>
                <input
                  type="number" min="1" max="30" value={nights}
                  onChange={(e) => setNights(Math.max(1, +e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Huéspedes</label>
                <input
                  type="number" min="1" max={listing.guests} value={guests}
                  onChange={(e) => setGuests(Math.min(listing.guests, Math.max(1, +e.target.value)))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>${listing.price.toLocaleString()} × {nights} noches</span>
              <span>${base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-3">
              <span>Tarifa de servicio</span>
              <span>${fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-3">
              <span>Total</span>
              <span>${total.toLocaleString()} MXN</span>
            </div>
          </div>

          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
            Reservar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [selectedListing, setSelectedListing] = useState(null)

  const filtered = listings.filter((l) => {
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
const matchSearch = !search || normalize(l.title).includes(normalize(search)) || normalize(l.location).includes(normalize(search))
    const matchCat = category === "Todos" || l.type === category
    return matchSearch && matchCat
  })

  const goExplore = (searchTerm = "") => {
    setSearch(searchTerm)
    setPage("explore")
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div
            onClick={() => { setPage("home"); setSearch(""); setCategory("Todos") }}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-orange-500 text-xl">📍</span>
            <span className="text-orange-500 font-bold text-xl">StayMX</span>
          </div>

          {/* Buscador */}
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage("explore") }}
              placeholder="Buscar destino..."
              className="bg-transparent flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setPage("home")} className={`text-sm px-3 py-2 rounded-lg transition-colors ${page === "home" ? "text-orange-500 font-medium" : "text-gray-500 hover:bg-gray-100"}`}>
              Inicio
            </button>
            <button onClick={() => goExplore()} className={`text-sm px-3 py-2 rounded-lg transition-colors ${page === "explore" ? "text-orange-500 font-medium" : "text-gray-500 hover:bg-gray-100"}`}>
              Explorar
            </button>
            <button onClick={() => setPage("about")} className={`text-sm px-3 py-2 rounded-lg transition-colors ${page === "about" ? "text-orange-500 font-medium" : "text-gray-500 hover:bg-gray-100"}`}>
              Nosotros
            </button>
            <button className="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
              Publicar
            </button>
          </div>
        </div>
      </nav>

      {/* ══ PÁGINA: HOME ══════════════════════════════════════════════════════ */}
      {page === "home" && (
        <div>
          {/* Hero */}
          <div className="relative bg-gray-900 text-white py-20 px-4 text-center overflow-hidden min-h-72 flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-25 bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=60)" }}
            />
            <div className="relative max-w-xl mx-auto">
              <p className="text-orange-400 text-xs tracking-widest uppercase mb-4 font-medium">Tu próxima aventura te espera</p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Descubre México<br />
                <em className="text-orange-400 not-italic">como nunca antes</em>
              </h1>
              <p className="text-white/60 text-base mb-8 leading-relaxed">
                Más de 1,400 alojamientos únicos en toda la república.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => goExplore()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
                  Explorar alojamientos
                </button>
                <button onClick={() => goExplore()} className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full transition-colors">
                  Ver destinos
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-orange-50 border-b border-orange-100">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[["1,400+", "Alojamientos"], ["38", "Ciudades"], ["96%", "Satisfacción"], ["24/7", "Soporte"]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-orange-500">{n}</p>
                  <p className="text-xs text-gray-500 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Destinos populares */}
          <div className="max-w-6xl mx-auto px-4 py-14">
            <h2 className="text-2xl font-bold mb-2">Destinos populares</h2>
            <p className="text-gray-500 text-sm mb-8">Los lugares más buscados por nuestros viajeros</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map((d) => (
                <div
                  key={d.name}
                  onClick={() => goExplore(d.name)}
                  className="rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all bg-white"
                >
                  <img src={d.img} alt={d.name} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <p className="font-semibold text-sm">{d.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destacados */}
          <div className="bg-orange-50 py-14 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">Destacados esta semana</h2>
              <p className="text-gray-500 text-sm mb-8">Seleccionados por nuestro equipo editorial</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((l) => (
                  <ListingCard key={l.id} listing={l} onClick={setSelectedListing} />
                ))}
              </div>
              <div className="text-center mt-10">
                <button onClick={() => goExplore()} className="border border-gray-300 hover:bg-gray-100 px-8 py-3 rounded-full text-sm transition-colors">
                  Ver todos los alojamientos →
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gray-900 text-white py-16 px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">¿Tienes un espacio para compartir?</h2>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">Únete a más de 3,200 anfitriones que ya generan ingresos con su propiedad.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
              Comenzar a publicar
            </button>
          </div>
        </div>
      )}

      {/* ══ PÁGINA: EXPLORE ═══════════════════════════════════════════════════ */}
      {page === "explore" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">
              {search ? `Resultados para "${search}"` : "Explorar alojamientos"}
            </h2>
            <span className="text-sm text-gray-400">{filtered.length} alojamiento{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all ${
                  category === c
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">🏡</p>
              <p className="text-lg mb-2">No encontramos resultados</p>
              <p className="text-sm">Intenta con otra búsqueda o categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} onClick={setSelectedListing} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ PÁGINA: ABOUT ═════════════════════════════════════════════════════ */}
      {page === "about" && (
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Sobre StayMX</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            StayMX nació con la misión de conectar a viajeros mexicanos y extranjeros con los alojamientos más auténticos de México. Desde la arquitectura colonial de Campeche hasta las playas cristalinas de Los Cabos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {["Verificación de anfitriones", "Pagos 100% seguros", "Soporte 24/7", "Cancelación flexible"].map((v) => (
              <div key={v} className="flex items-center gap-3 bg-orange-50 rounded-xl p-4">
                <span className="text-orange-500 font-bold">✓</span>
                <span className="text-sm font-medium">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Esta aplicación fue construida como proyecto SPA en React + Tailwind CSS para la Plenaria de Sistemas. Utiliza componentes reutilizables, props dinámicos y arreglos de datos estructurados.
          </p>
        </div>
      )}

      {/* Modal */}
      <Modal listing={selectedListing} onClose={() => setSelectedListing(null)} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white/40 text-center py-8 text-xs">
        <p className="text-white font-bold text-lg mb-1">StayMX</p>
        <p>Proyecto Alpha — SPA con React + Tailwind · Plenaria de Sistemas 2025</p>
      </footer>
    </div>
  )
}
