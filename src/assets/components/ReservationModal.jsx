// src/assets/components/ReservationModal.jsx
import React, { useState } from 'react'
import { createReservationWithPayment } from '../../config/supabase'
import { addDays, diffDays, today } from '../../data/initialData'

const inputCls = "w-full border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"

export default function ReservationModal({ listing, onClose, onReserve, reservations, user, openAuth }) {
  const [checkIn, setCheckIn]        = useState(addDays(today, 1))
  const [checkOut, setCheckOut]      = useState(addDays(today, 4))
  const [guests, setGuests]          = useState(1)
  const [paymentMethod, setPayment] = useState('card')
  const [done, setDone]              = useState(false)
  const [loading, setLoading]        = useState(false)

  if (!listing) return null

  const activeBookings = (reservations || []).filter(
    r => (r.listing_id === listing.id || r.listingId === listing.id) && r.status !== 'cancelled'
  )

  const isBlocked = activeBookings.some(r => {
    const resIn = r.check_in || r.checkIn
    const resOut = r.check_out || r.checkOut
    return checkIn < resOut && checkOut > resIn
  })

  const nights = Math.max(1, diffDays(checkIn, checkOut))
  const base   = (listing.price || listing.price_per_night || 0) * nights
  const fee    = Math.round(base * 0.12)
  const total  = base + fee

  const handleConfirmReservation = async () => {
    if (!user) {
      openAuth()
      return
    }

    if (isBlocked) return

    setLoading(true)
    const { data, error } = await createReservationWithPayment({
      listingId: listing.id,
      checkIn,
      checkOut,
      guests,
      total,
      paymentMethod
    })

    setLoading(false)

    if (error) {
      alert("Error al guardar la reservación: " + error.message)
      return
    }

    onReserve()
    setDone(true)
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl transition-all duration-300">
        <div className="relative h-56">
          <img src={listing.img || listing.image} alt={listing.title} className="w-full h-full object-cover"/>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 dark:bg-gray-850/90 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
        </div>
        <div className="p-6">
          <h2 className="font-bold text-xl text-gray-900 dark:text-gray-50 mb-1">{listing.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{listing.location} · {listing.type}</p>

          {activeBookings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <strong>Fechas ya reservadas en este espacio:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                {activeBookings.map((b, idx) => (
                  <li key={idx}>Del <strong>{b.check_in || b.checkIn}</strong> al <strong>{b.check_out || b.checkOut}</strong></li>
                ))}
              </ul>
            </div>
          )}

          {done ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">¡Reservación y Pago Confirmados!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300">Las fechas han quedado bloqueadas para otros usuarios.</p>
              <button onClick={onClose} className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold mt-4">Listo</button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Check-in</label>
                  <input type="date" min={addDays(today,1)} value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Check-out</label>
                  <input type="date" min={addDays(checkIn,1)} value={checkOut} onChange={e => setCheckOut(e.target.value)} className={inputCls}/>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Método de pago</label>
                <select value={paymentMethod} onChange={e => setPayment(e.target.value)} className={inputCls}>
                  <option value="card">💳 Tarjeta de Crédito / Débito</option>
                  <option value="paypal">🌐 PayPal</option>
                </select>
              </div>

              {isBlocked && (
                <p className="text-rose-600 text-xs font-medium mb-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">
                  ⚠️ Estas fechas no están disponibles porque ya se encuentra reservado.
                </p>
              )}

              <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-800 pt-3 mb-4">
                <span>Total</span><span>${total.toLocaleString()} MXN</span>
              </div>
              
              <button 
                onClick={handleConfirmReservation} 
                disabled={isBlocked || loading}
                className={`w-full font-bold py-3 rounded-xl transition-colors ${
                  isBlocked ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                }`}
              >
                {!user ? "Inicia sesión para reservar" : loading ? "Guardando..." : "Confirmar y pagar reservación"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}