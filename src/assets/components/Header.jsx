// src/assets/components/Header.jsx
import React, { useState, useEffect } from 'react'
import { supabase, logout } from '../../config/supabase'
import LoginModal from './LoginModal'

export default function Header({ isDarkMode, toggleDarkMode }) {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-rose-500 hidden sm:inline">staymx</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-sm text-slate-300 w-72 justify-between">
          <span>¿A dónde quieres ir?</span>
          <div className="bg-rose-500 p-1.5 rounded-full text-white">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation & Auth Controls */}
        <div className="flex items-center gap-3">
          <button className="hidden lg:block text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-900 transition">
            + Modo Anfitrión
          </button>

          {/* Theme Toggle Button */}
          {toggleDarkMode && (
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800 transition"
            >
              ☀️
            </button>
          )}

          {/* LOGIN / SIGN UP / USER PROFILE BUTTON */}
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full pl-3 pr-1.5 py-1">
              <span className="text-xs text-slate-300 font-mono max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-full transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm px-4 py-2 rounded-full transition shadow-lg shadow-rose-500/20"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal Popup */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}