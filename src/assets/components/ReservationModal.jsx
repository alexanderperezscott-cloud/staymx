// src/assets/components/ReservationModal.jsx
import React, { useState } from 'react'
import { createReservationWithPayment } from '../../config/supabase'
import { addDays, diffDays, today } from '../../data/initialData'
import ReviewsSection from './ReviewsSection' 

export default function ReservationModal({ listing, onClose, onReserve, reservations, user, openAuth }) {
  if (!listing) return null

  // Checkout Step State: 'details' -> 'checkout'
  const [step, setStep] = useState('details')

  // Reservation inputs
  const [checkIn, setCheckIn] = useState(addDays(today, 1))
  const [checkOut, setCheckOut] = useState(addDays(today, 4))
  const [guests, setGuests] = useState(1)
  const [rateType, setRateType] = useState('non_refundable') // 'non_refundable' | 'refundable'
  const [paymentOption, setPaymentOption] = useState('full')
  const [paymentMethod, setPaymentMethod] = useState('card')

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Active bookings for date availability
  const activeBookings = (reservations || []).filter(
    r => (r.listing_id === listing.id || r.listingId === listing.id) && r.status !== 'cancelled'
  )

  const isBlocked = activeBookings.some(r => {
    const resIn = r.check_in || r.checkIn
    const resOut = r.check_out || r.checkOut
    return checkIn < resOut && checkOut > resIn
  })

  // Calculations
  const nights = Math.max(1, diffDays(checkIn, checkOut))
  const pricePerNight = Number(listing.price || listing.price_per_night || 0)
  const basePrice = pricePerNight * nights
  const discount = Math.round(basePrice * 0.07)
  const taxes = Math.round((basePrice - discount) * 0.16)
  const rateMultiplier = rateType === 'refundable' ? 1.10 : 1.0
  const total = Math.round((basePrice - discount + taxes) * rateMultiplier)

  // STRICT REAL IMAGES (No random stock photo fallbacks)
  const images = Array.isArray(listing.images) && listing.images.length > 0
    ? listing.images
    : [listing.img || listing.image_url || listing.image].filter(Boolean)

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
    <div className="fixed inset-0 bg-white dark:bg-gray-950 z-50 overflow-y-auto font-sans animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* TOP STICKY BAR */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={step === 'checkout' ? () => setStep('details') : onClose}
          className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-850 px-3 py-1.5 rounded-full transition"
        >
          ← {step === 'checkout' ? 'Volver a detalles' : 'Cerrar'}
        </button>

        <span className="text-xl font-black text-rose-500 tracking-tight">staymx</span>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {done ? (
        <div className="max-w-md mx-auto my-20 p-8 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-center shadow-xl">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mb-2">¡Reservación Confirmada!</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-6">
            Tu lugar en <strong>{listing.title}</strong> ha quedado reservado del <strong>{checkIn}</strong> al <strong>{checkOut}</strong>.
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
          >
            Aceptar y Volver
          </button>
        </div>
      ) : step === 'details' ? (

        /* ================================================================= */
        /* 📍 VIEW 1: DETAILS & DYNAMIC GALLERY                              */
        /* ================================================================= */
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Dynamic Gallery - Layout adjusts based on exact image count */}
          {images.length === 1 ? (
            <div className="rounded-3xl overflow-hidden mb-8 h-[400px]">
              <img src={images[0]} alt={listing.title} className="w-full h-full object-cover"/>
            </div>
          ) : images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2 rounded-3xl overflow-hidden mb-8 h-[380px]">
              <img src={images[0]} alt={listing.title} className="w-full h-full object-cover"/>
              <img src={images[1]} alt={`${listing.title} 2`} className="w-full h-full object-cover"/>
            </div>
          ) : images.length === 3 ? (
            <div className="grid grid-cols-3 gap-2 rounded-3xl overflow-hidden mb-8 h-[380px]">
              <img src={images[0]} alt={listing.title} className="col-span-2 w-full h-full object-cover"/>
              <div className="grid grid-rows-2 gap-2 h-full">
                <img src={images[1]} alt={`${listing.title} 2`} className="w-full h-full object-cover"/>
                <img src={images[2]} alt={`${listing.title} 3`} className="w-full h-full object-cover"/>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden mb-8 h-[380px]">
              <div className="md:col-span-2 h-full">
                <img src={images[0]} alt={listing.title} className="w-full h-full object-cover"/>
              </div>
              <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                <img src={images[1]} alt="Gallery 1" className="w-full h-full object-cover"/>
                <img src={images[2]} alt="Gallery 2" className="w-full h-full object-cover"/>
              </div>
              <div className="hidden md:block relative h-full">
                <img src={images[3]} alt="Gallery 3" className="w-full h-full object-cover"/>
                {images.length > 4 && (
                  <button className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
                    📷 Ver todas ({images.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Details & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-50 mb-2">
                  {listing.title}
                </h1>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {guests} huéspedes · {listing.beds || 2} habitaciones · {listing.beds || 2} camas · {listing.baths || 1} baños
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                  <span>★ {listing.rating ? listing.rating.toFixed(2) : '5.00'}</span>
                  <span className="text-gray-400">·</span>
                  <u className="cursor-pointer">{listing.reviews || 0} evaluaciones</u>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800"/>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white font-bold text-lg flex items-center justify-center">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Anfitrión StayMX</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Superhost · Verificado</p>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800"/>

              <div>
                <h3 className="font-bold text-lg mb-2">Acerca de este espacio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {listing.description || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* AQUI SE INTEGRA LA SECCIÓN DE RESEÑAS */}
              <ReviewsSection listingId={listing.id} />

            </div>

            {/* Right Column: Reservation Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-6">
                
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-gray-900 dark:text-gray-50">
                      ${total.toLocaleString()} MXN
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">total</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">O 3x ${(total / 3).toFixed(0)} MXN sin intereses</p>
                </div>

                {/* Date Inputs */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-gray-300 dark:border-gray-700">
                    <div className="p-2.5 border-r border-gray-300 dark:border-gray-700">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Check-in</label>
                      <input 
                        type="date" 
                        value={checkIn}
                        min={addDays(today, 1)}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="p-2.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Checkout</label>
                      <input 
                        type="date" 
                        value={checkOut}
                        min={addDays(checkIn, 1)}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Huéspedes</label>
                    <select 
                      value={guests} 
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none dark:text-white cursor-pointer"
                    >
                      <option value={1} className="dark:bg-gray-900">1 huésped</option>
                      <option value={2} className="dark:bg-gray-900">2 huéspedes</option>
                      <option value={3} className="dark:bg-gray-900">3 huéspedes</option>
                      <option value={4} className="dark:bg-gray-900">4 huéspedes</option>
                    </select>
                  </div>
                </div>

                {/* 🎯 FIXED CONTRAST CARDS: Explicit high-contrast text */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500">TARIFAS</p>

                  <label className={`block p-4 rounded-2xl border cursor-pointer transition ${
                    rateType === 'non_refundable' 
                      ? 'border-rose-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white ring-2 ring-rose-500/20' 
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          No reembolsable · <span className="font-extrabold text-rose-500">${total.toLocaleString()} MXN</span>
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                          Cancelación gratuita durante 24 horas. Después no es reembolsable.
                        </p>
                      </div>
                      <input 
                        type="radio" 
                        name="rateType" 
                        checked={rateType === 'non_refundable'} 
                        onChange={() => setRateType('non_refundable')}
                        className="mt-1 accent-rose-500 h-4 w-4 shrink-0"
                      />
                    </div>
                  </label>

                  <label className={`block p-4 rounded-2xl border cursor-pointer transition ${
                    rateType === 'refundable' 
                      ? 'border-rose-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white ring-2 ring-rose-500/20' 
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          Reembolsable · <span className="font-extrabold text-rose-500">${total.toLocaleString()} MXN</span>
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                          Cancelación flexible hasta 1 día antes del Check-in.
                        </p>
                      </div>
                      <input 
                        type="radio" 
                        name="rateType" 
                        checked={rateType === 'refundable'} 
                        onChange={() => setRateType('refundable')}
                        className="mt-1 accent-rose-500 h-4 w-4 shrink-0"
                      />
                    </div>
                  </label>
                </div>

                {isBlocked && (
                  <p className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-xl">
                    ⚠️ Estas fechas no están disponibles porque ya se encuentra reservado.
                  </p>
                )}

                <button
                  onClick={() => {
                    if (!user) openAuth()
                    else setStep('checkout')
                  }}
                  disabled={isBlocked}
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition"
                >
                  {!user ? 'Inicia sesión para reservar' : 'Reservar'}
                </button>

                <p className="text-center text-xs text-gray-400 font-medium">Aún no se te cobrará nada</p>
              </div>
            </div>

          </div>
        </div>

      ) : (

        /* ================================================================= */
        /* 📍 VIEW 2: CONFIRM AND PAY                                        */
        /* ================================================================= */
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 mb-8 flex items-center gap-3">
            <button onClick={() => setStep('details')} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">←</button>
            Confirmar y pagar
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <h3 className="font-bold text-lg">1. Elige cómo pagar</h3>

                <label className={`block p-4 rounded-2xl border cursor-pointer transition ${paymentOption === 'full' ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-850' : 'border-gray-200 dark:border-gray-800'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">1 pago de ${total.toLocaleString()} MXN</p>
                      <p className="text-xs text-gray-500">Paga el total ahora y queda todo listo.</p>
                    </div>
                    <input type="radio" name="payOption" checked={paymentOption === 'full'} onChange={() => setPaymentOption('full')} className="accent-rose-500"/>
                  </div>
                </label>

                <label className={`block p-4 rounded-2xl border cursor-pointer transition ${paymentOption === 'installments' ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-850' : 'border-gray-200 dark:border-gray-800'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">3 pagos de ${(total / 3).toFixed(2)} MXN</p>
                      <p className="text-xs text-emerald-600 font-semibold">Sin intereses</p>
                    </div>
                    <input type="radio" name="payOption" checked={paymentOption === 'installments'} onChange={() => setPaymentOption('installments')} className="accent-rose-500"/>
                  </div>
                </label>
              </div>

              <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <h3 className="font-bold text-lg">2. Método de pago</h3>

                <div className="space-y-3">
                  <label className={`block p-4 rounded-2xl border cursor-pointer transition ${paymentMethod === 'card' ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-850' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold flex items-center gap-2">💳 Tarjeta de Crédito o Débito</span>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-rose-500"/>
                    </div>
                  </label>

                  <label className={`block p-4 rounded-2xl border cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-850' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold flex items-center gap-2">🌐 PayPal</span>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-rose-500"/>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleConfirmReservation}
                disabled={loading}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-base rounded-2xl shadow-xl shadow-rose-500/25 transition disabled:opacity-50"
              >
                {loading ? 'Confirmando reservación...' : 'Confirmar y pagar'}
              </button>

            </div>

            <div className="lg:col-span-1">
              <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-5 sticky top-28">
                
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span>🏷️</span> Descuento de ${discount.toLocaleString()} MXN aplicado
                </div>

                <div className="flex gap-4 items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                  <img src={images[0]} alt={listing.title} className="w-20 h-20 rounded-2xl object-cover shrink-0"/>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{listing.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">★ {listing.rating ? listing.rating.toFixed(2) : '5.00'}</p>
                  </div>
                </div>

                <div className="space-y-3 border-b border-gray-200 dark:border-gray-800 pb-4 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Fechas</p>
                      <p className="text-gray-500">{checkIn} al {checkOut}</p>
                    </div>
                    <button onClick={() => setStep('details')} className="font-bold text-rose-500 underline">Cambiar</button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Huéspedes</p>
                      <p className="text-gray-500">{guests} huésped{guests > 1 ? 'es' : ''}</p>
                    </div>
                    <button onClick={() => setStep('details')} className="font-bold text-rose-500 underline">Cambiar</button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>{nights} noches x ${pricePerNight.toLocaleString()} MXN</span>
                    <span>${basePrice.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento por estancia</span>
                    <span>-${discount.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (IVA)</span>
                    <span>${taxes.toLocaleString()} MXN</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-black text-gray-900 dark:text-gray-50">
                    <span>Total (MXN)</span>
                    <span className="text-rose-500">${total.toLocaleString()} MXN</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      )}

    </div>
  )
}