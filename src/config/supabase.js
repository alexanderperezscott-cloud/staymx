// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

// 🎯 URL oficial de tu proyecto Supabase activo
const REAL_SUPABASE_URL = "https://hvrehrrebhgoqjibdszs.supabase.co"

// 🔑 Lee las variables de entorno; si Vercel tiene inyectado el proyecto viejo, usa REAL_SUPABASE_URL por defecto
const envUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_PUBLIC_SUPABASE_URL

const supabaseUrl = (envUrl && !envUrl.includes("xyycalculmlpwwvdwouuk"))
  ? envUrl 
  : REAL_SUPABASE_URL

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 📥 Cargar alojamientos
export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// 📤 Crear alojamiento
export async function createListing(newListing) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { data: null, error: { message: "Debes iniciar sesión para publicar un alojamiento." } }
  }

  const { data, error } = await supabase
    .from('listings')
    .insert([
      {
        host_id: session.user.id,
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

// 🗓️ Reservaciones (Usando guest_id y guests_count de tu BD)
export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
  return { data, error }
}

export async function createReservation(reservation) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Debes iniciar sesión para realizar una reservación." } }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        listing_id: reservation.listingId,
        guest_id: session.user.id,        // 👈 Nombre exacto de la columna en tu BD
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests_count: reservation.guests,  // 👈 Nombre exacto de la columna en tu BD
        total_price: reservation.total
      }
    ])
    .select()

  return { data, error }
}

// 👑 Perfil y Admin
export async function getUserProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

export async function deleteListing(listingId) {
  const { data, error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .select()

  return { data, error }
}

// 🔐 --- FUNCIONES DE AUTENTICACIÓN ---

export async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  return { data, error }
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Alias de compatibilidad
export async function loginWithEmail(email, password) {
  return await signInUser(email, password)
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  return { data, error }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function logout() {
  return await signOutUser()
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}