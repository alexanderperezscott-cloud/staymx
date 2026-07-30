// src/data/initialData.js

export const initialListings = [
  { id:"d64d7323-dfe7-4212-80a4-9c1ec3513", title:"Cabaña en la selva con cenote privado", location:"Valladolid, Yucatán", price:2400, rating:4.99, reviews:57, img:"https://images.unsplash.com/photo-1439130490301-25e322d88054?w=600&q=80", type:"Cabaña", guests:4, beds:2, baths:1, superhost:false, amenities:["WiFi","Cenote","Desayuno","Tours"] },
  { id:"11111111-1111-1111-1111-111111111111", title:"Casa colonial en el centro histórico", location:"Campeche, Campeche", price:850, rating:4.97, reviews:184, img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", type:"Casa", guests:6, beds:3, baths:2, superhost:true, amenities:["WiFi","Cocina","A/C","Estacionamiento"] },
  { id:"22222222-2222-2222-2222-222222222222", title:"Loft moderno con vista al mar", location:"Mérida, Yucatán", price:1200, rating:4.92, reviews:93, img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", type:"Loft", guests:2, beds:1, baths:1, superhost:true, amenities:["WiFi","Alberca","Gym","Balcón"] },
  { id:"44444444-4444-4444-4444-444444444444", title:"Departamento minimalista en Polanco", location:"Ciudad de México, CDMX", price:1800, rating:4.85, reviews:221, img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", type:"Departamento", guests:4, beds:2, baths:2, superhost:true, amenities:["WiFi","A/C","Cocina","Netflix"] },
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