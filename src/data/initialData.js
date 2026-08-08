// src/data/initialData.js

// 🎯 Coincidencia exacta con las filas actuales de tu tabla 'listings' en Supabase
export const initialListings = [
  { 
    id: "153ab7ed-2db4-4b72-8404-0b9c59ffe8d0", 
    title: "Loft moderno con vista al mar", 
    location: "Mérida, Yucatán", 
    price: 1800, 
    rating: 5.0, 
    reviews: 0, 
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", 
    type: "Loft", 
    guests: 2, 
    beds: 1, 
    baths: 1, 
    superhost: false, 
    amenities: ["WiFi", "Vista al Mar", "Alberca"], 
    description: "Increíble loft totalmente equipado frente al mar con terraza y alberca." 
  },
  { 
    // CORRECCIÓN: Se completó el UUID para que tenga 36 caracteres y sea válido en Supabase
    id: "d64d7323-dfe7-4212-80a4-9c1ec3513000", 
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
    superhost: false, 
    amenities: ["WiFi", "Cenote", "Desayuno", "Tours"], 
    description: "Hermosa cabaña rústica rodeada de naturaleza con acceso directo a un cenote privado." 
  },
  { 
    id: "ff2374b7-4d24-4429-b2a5-ec765a3f1234", 
    title: "Cabaña en la selva con cenote privado (Económica)", 
    location: "Valladolid, Yucatán", 
    price: 1200, 
    rating: 5.0, 
    reviews: 0, 
    img: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80", 
    type: "Cabaña", 
    guests: 4, 
    beds: 2, 
    baths: 1, 
    superhost: false, 
    amenities: ["WiFi", "Cenote"], 
    description: "Hermosa cabaña inmersa en la naturaleza con acceso directo a cenote privado." 
  }
]

export const mexicoLocations = {
  "Campeche": ["Campeche Centro", "Ciudad del Carmen", "Champotón", "Calakmul"],
  "Yucatán": ["Mérida", "Valladolid", "Progreso", "Izamal"],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum", "Cozumel", "Holbox"],
  "CDMX": ["Polanco", "Condesa", "Roma Norte", "Coyoacán", "Centro Histórico"],
  "Jalisco": ["Puerto Vallarta", "Guadalajara", "Tequila", "Zapopan"],
  "Baja California Sur": ["Los Cabos", "La Paz", "Todos Santos"]
}

export const tiposOpc = ["Casa","Loft","Cabaña","Departamento","Villa","Estudio"]
export const amenidadesOpc = ["WiFi", "Cocina", "Aire Acondicionado", "Alberca", "Estacionamiento", "Gym", "Balcón", "Pet Friendly", "Parrilla", "Vista al Mar"]

export const addDays = (iso, n) => { 
  const d = new Date(iso); 
  d.setDate(d.getDate() + n); 
  return d.toISOString().split("T")[0] 
}

export const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24))
export const today = new Date().toISOString().split("T")[0]

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(String(email).toLowerCase())
}