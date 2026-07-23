// src/components/Header.jsx
import React, { useState, useEffect } from 'react'
import { supabase, logout } from '../config/supabase'
import LoginModal from './LoginModal'

export default function Header() {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 2. Listen for auth state changes (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-teal-400 tracking-tight">StayMX</span>
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 font-mono">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-teal-500/10"
          >
            Log In / Sign Up
          </button>
        )}
      </div>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )