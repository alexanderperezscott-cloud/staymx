// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

// Usamos el nombre exacto de tus variables en .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Funciones Auxiliares de Autenticación ---

// 1. Iniciar sesión / Registro con Correo
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// 2. Iniciar sesión con Google OAuth
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  return { data, error }
}

// 3. Cerrar sesión
export async function logout() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Obtener todos los alojamientos de la base de datos
export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Crear un nuevo alojamiento en la base de datos
export async function createListing(newListing) {
  // Obtener usuario autenticado si existe
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id ?? null

  const { data, error } = await supabase
    .from('listings')
    .insert([
      {
        host_id: userId,
        title: newListing.title,
        property_type: newListing.type,
        price_per_night: newListing.price,
        address: newListing.address || 'Sin dirección',
        city: newListing.city || 'Desconocido',
        state: newListing.state || 'México',
        guests: newListing.guests || 1,
        beds: newListing.beds || 1,
        baths: newListing.baths || 1,
        description: newListing.description,
        amenities: newListing.amenities || [],
        image_url: newListing.img
      }
    ])
    .select()

  return { data, error }
}