// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'
import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../../config/supabase'
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