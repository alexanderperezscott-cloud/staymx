// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = "https://hvrehrrebhgoqjibdszs.supabase.co"

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_PUBLIC_SUPABASE_URL

const supabaseUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http')) 
  ? rawUrl 
  : FALLBACK_URL

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==========================================
// 📥 ALOJAMIENTOS (LISTINGS) & MODO ANFITRIÓN
// ==========================================

export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

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
        image_url: newListing.img,
        phone: newListing.phone,          // <-- Agregado para validación de teléfono
        latitude: newListing.latitude,    // <-- Agregado para Mapbox
        longitude: newListing.longitude   // <-- Agregado para Mapbox
      }
    ])
    .select()

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

// ==========================================
// 🗓️ RESERVACIONES Y CANCELACIÓN
// ==========================================

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
  return { data, error }
}

export async function getListingBookedDates(listingId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('check_in, check_out')
    .eq('listing_id', listingId)
    .neq('status', 'cancelled')
  return { data, error }
}

export async function createReservation(reservation) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Debes iniciar sesión para realizar una reservación." } }
  }

  const targetListingId = reservation.listingId || reservation.listing_id

  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        listing_id: targetListingId,
        guest_id: session.user.id,
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests_count: reservation.guests,
        total_price: reservation.total,
        status: 'confirmed'
      }
    ])
    .select()

  return { data, error }
}

export async function createReservationWithPayment(reservation) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Debes iniciar sesión para realizar una reservación." } }
  }

  const targetListingId = reservation.listingId || reservation.listing_id

  const { data: existingBookings } = await getListingBookedDates(targetListingId)
  
  if (existingBookings && existingBookings.length > 0) {
    const newIn = new Date(reservation.checkIn).getTime()
    const newOut = new Date(reservation.checkOut).getTime()

    const isOverlap = existingBookings.some(b => {
      const existIn = new Date(b.check_in).getTime()
      const existOut = new Date(b.check_out).getTime()
      return (newIn < existOut && newOut > existIn)
    })

    if (isOverlap) {
      return { 
        data: null, 
        error: { message: "Las fechas seleccionadas ya han sido reservadas por otro usuario." } 
      }
    }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        listing_id: targetListingId,
        guest_id: session.user.id,
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests_count: reservation.guests,
        total_price: reservation.total,
        payment_method: reservation.paymentMethod || 'card',
        status: 'confirmed'
      }
    ])
    .select()

  return { data, error }
}

// Cancela una reservación cambiando su estado a 'cancelled'
export async function cancelReservation(reservationId) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId)
    .select()

  return { data, error }
}

// ==========================================
// 👑 PERFIL Y FOTO DE PERFIL (AVATAR)
// ==========================================

export async function getUserProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

export async function uploadAvatar(file, userId) {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const publicUrl = data.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    return { publicUrl, error: null }
  } catch (error) {
    return { publicUrl: null, error }
  }
}

// ==========================================
// 🔐 AUTENTICACIÓN
// ==========================================

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

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  return { data, error }
}

export function closeGooglePopup() {
  if (window.opener && !window.opener.closed) {
    window.close()
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

// ==========================================
// ❤️ FAVORITOS (WISHLIST) - NUEVO
// ==========================================

export async function getUserFavorites() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { data: [] }

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', session.user.id)
  
  return { data, error }
}

export async function toggleFavorite(listingId, isFavorite) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error("Debes iniciar sesión para guardar en favoritos")

  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: session.user.id, listing_id: listingId })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: session.user.id, listing_id: listingId }])
    if (error) throw error
  }
}

// ==========================================
// 💬 MENSAJES ENTRE HUÉSPED Y ANFITRIÓN
// ==========================================

export async function sendMessage(reservationId, receiverId, content) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error("Debes iniciar sesión para enviar mensajes.")

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      reservation_id: reservationId,
      sender_id: session.user.id,
      receiver_id: receiverId,
      content: content
    }])
    .select()

  return { data, error }
}

export async function getMessages(reservationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: true }) // Orden cronológico
  
  return { data, error }
}

// ==========================================
// ⭐ RESEÑAS Y CALIFICACIONES (REVIEWS)
// ==========================================

// Obtener todas las reseñas de una propiedad (incluyendo el nombre del autor)
export async function getReviews(listingId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (full_name, avatar_url)
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Validar si el usuario ya se hospedó y no ha comentado aún
export async function checkReviewEligibility(listingId) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return false

  // 1. Verificamos si tiene una reservación confirmada que ya terminó
  const today = new Date().toISOString().split('T')[0]
  const { data: pastReservations } = await supabase
    .from('reservations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('guest_id', session.user.id)
    .eq('status', 'confirmed')
    .lt('check_out', today) // check_out debe ser menor a hoy
    .limit(1)

  if (!pastReservations || pastReservations.length === 0) return false

  // 2. Verificamos que no haya dejado una reseña antes
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', session.user.id)
    .maybeSingle()

  return !existingReview // Es elegible solo si NO existe una reseña previa
}

// Subir la reseña a la base de datos
export async function submitReview(listingId, rating, comment) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error("Inicia sesión para calificar.")

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ 
      listing_id: listingId, 
      user_id: session.user.id, 
      rating, 
      comment 
    }])
    .select()

  return { data, error }
}