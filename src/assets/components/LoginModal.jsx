import React, { useState, useEffect } from 'react'
import { 
  supabase, 
  loginWithEmail, 
  signUpWithEmail, 
  loginWithGoogle, 
  closeGooglePopup 
} from '../../config/supabase'

export default function LoginModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  // NUEVO ESTADO: Control de Términos y Condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        closeGooglePopup()
        setGoogleLoading(false)
        onClose()
      }
    })

    return () => {
      document.body.style.overflow = previousOverflow
      subscription.unsubscribe()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    // NUEVA VALIDACIÓN: Solo para el registro
    if (isSignUp && !acceptedTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones para continuar.')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        setErrorMessage(error.message)
      } else {
        alert('¡Registro exitoso! Revisa tu correo de confirmación.')
        onClose()
      }
    } else {
      const { error } = await loginWithEmail(email, password)
      if (error) {
        setErrorMessage(error.message)
      } else {
        onClose()
      }
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    setErrorMessage('')
    setGoogleLoading(true)
    
    const { error } = await loginWithGoogle()
    if (error) {
      setErrorMessage(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-5 sm:space-y-6 shadow-2xl relative text-slate-100">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? 'Crear Cuenta en StayMX' : 'Iniciar Sesión en StayMX'}
        </h2>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleGoogleAuth}
          type="button"
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 py-3 px-4 rounded-xl border border-slate-700 transition duration-200 text-sm font-medium disabled:opacity-50 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          {googleLoading ? (
            <span className="text-xs text-slate-400">Conectando con Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs text-slate-500 font-mono">O CON CORREO</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-mono text-slate-400 mb-1">
              Correo Electrónico
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 text-sm focus:outline-none focus:border-rose-500 transition duration-150 min-h-[48px]"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-mono text-slate-400 mb-1">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 text-sm focus:outline-none focus:border-rose-500 transition duration-150 min-h-[48px]"
              placeholder="••••••••"
            />
          </div>

          {/* NUEVO: CHECKBOX DE TÉRMINOS SOLO VISIBLE SI ES REGISTRO */}
          {isSignUp && (
            <div className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-rose-500 w-4 h-4 rounded cursor-pointer shrink-0 border-slate-700 bg-slate-900"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer select-none">
                Confirmo que soy mayor de 18 años y acepto los <button type="button" className="text-rose-400 font-medium hover:underline underline-offset-2">Términos de Servicio</button> y la <button type="button" className="text-rose-400 font-medium hover:underline underline-offset-2">Política de Privacidad</button> de StayMX para el tratamiento de datos.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignUp && !acceptedTerms)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta aun?'}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setAcceptedTerms(false) // Limpiar el checkbox al cambiar
              setErrorMessage('')
            }}
            className="text-rose-400 hover:underline font-medium"
          >
            {isSignUp ? 'Inicia Sesión' : 'Regístrate aquí'}
          </button>
        </p>

      </div>
    </div>
  )
}