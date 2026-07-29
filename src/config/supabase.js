// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

// 🎯 URL oficial de tu proyecto activo
const FALLBACK_URL = "https://hvrehrrebhgoqjibdszs.supabase.co"

// 🔑 Obtención limpia de las variables de entorno
const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_PUBLIC_SUPABASE_URL

// Valida que la URL exista y comience obligatoriamente con http:// o https://
const supabaseUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http')) 
  ? rawUrl 
  : FALLBACK_URL

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Variable global para mantener la referencia a la ventana flotante
let googlePopupRef = null

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

// 🗓️ Reservaciones
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
        guest_id: session.user.id,
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests_count: reservation.guests,
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

export async function loginWithEmail(email, password) {
  return await signInUser(email, password)
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// 🌐 Iniciar Sesión con Google (Ventana Emergente / Popup Flotante)
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
      skipBrowserRedirect: true, // Evita redirección completa de la página actual
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) return { data: null, error }

  if (data?.url) {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // Guarda la referencia de la ventana emergente
    googlePopupRef = window.open(
      data.url,
      'GoogleLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    )

    if (googlePopupRef) googlePopupRef.focus()
  }

  return { data, error: null }
}

// Función auxiliar para cerrar la ventana emergente flotante de Google
export function closeGooglePopup() {
  if (googlePopupRef && !googlePopupRef.closed) {
    googlePopupRef.close()
    googlePopupRef = null
  }
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