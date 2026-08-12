// src/assets/components/ReservationModal.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { createReservationWithPayment } from '../../config/supabase'
import ReviewsSection from './ReviewsSection' 
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { sanitizeText, sanitizePhone } from '../../utils/security'

// Funciones para manejar fechas fácilmente
const today = new Date();
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}
const getNextWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d;
}

// Convertimos las fechas a String (YYYY-MM-DD) para mandarlas a Supabase
const formatDateForDB = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Custom Hook adaptado para Objetos Date
function useReservationPricing(checkInDate, checkOutDate, pricePerNight, rateType) {
  // Calculamos diferencia en días
  const diffTime = checkOutDate && checkInDate ? Math.abs(checkOutDate - checkInDate) : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const nights = Math.max(1, diffDays || 1);
  const basePrice = pricePerNight * nights;
  const discount = Math.round(basePrice * 0.07);
  const taxes = Math.round((basePrice - discount) * 0.16);
  const rateMultiplier = rateType === 'refundable' ? 1.10 : 1.0;
  const total = Math.round((basePrice - discount + taxes) * rateMultiplier);
  
  return { nights, basePrice, discount, taxes, total };
}

export default function ReservationModal({ listing, onClose, onReserve, reservations, user, openAuth, activeReservationsCount = 0 }) {
  // Checkout Step State
  const [step, setStep] = useState('details')

  // Fechas ahora son Objetos Date para react-datepicker
  const [checkIn, setCheckIn] = useState(getTomorrow())
  const [checkOut, setCheckOut] = useState(getNextWeek())

  useEffect(() => {
    if (!listing) {
      document.body.style.overflow = ''
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [listing])

  // STAYMX CHANGE: Eliminamos el useState(1) para que no se quede trabado en 1.
  // Ahora lee directamente la cantidad máxima que pusiste en la base de datos (Modo Anfitrión).
  const guests = listing?.guests || 1;

  const [rateType, setRateType] = useState('non_refundable') 
  const [paymentOption, setPaymentOption] = useState('full')
  const [paymentMethod, setPaymentMethod] = useState('card')

  // Tarjeta de pago
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const handleCardNumber = (e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
  const handleCvv = (e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4); 
    }
    setCardExpiry(val);
  }

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // ----- LÓGICA DE FECHAS BLOQUEADAS (Calendario Oscuro) -----
  const activeBookings = useMemo(() => {
    const listingId = listing?.id ?? null
    return (reservations || []).filter(
      r => (r.listing_id === listingId || r.listingId === listingId) && r.status !== 'cancelled'
    )
  }, [reservations, listing?.id]);

  // Convertimos las reservas activas en intervalos bloqueados para react-datepicker
  const excludedIntervals = useMemo(() => {
    return activeBookings.map(r => ({
      start: new Date(r.check_in || r.checkIn),
      end: new Date(r.check_out || r.checkOut)
    }));
  }, [activeBookings]);

  // Verificar si la selección actual choca con alguna reserva
  const isBlocked = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return activeBookings.some(r => {
      const resIn = new Date(r.check_in || r.checkIn);
      const resOut = new Date(r.check_out || r.checkOut);
      return checkIn < resOut && checkOut > resIn;
    });
  }, [checkIn, checkOut, activeBookings]);

  // --- LÍMITE DE RESERVACIONES ---
  const hasReachedLimit = activeReservationsCount >= 3;

  // NUEVO: Verificar si la reserva es para dentro de menos de 1 día (24 hrs)
  const isLessThan24Hours = useMemo(() => {
    if (!checkIn) return false;
    const timeDiff = checkIn.getTime() - today.getTime();
    return timeDiff <= (1000 * 3600 * 24);
  }, [checkIn]);

  // NUEVO: Forzar tarifa no reembolsable si falta menos de 1 día
  useEffect(() => {
    if (isLessThan24Hours && rateType === 'refundable') {
      setRateType('non_refundable');
    }
  }, [isLessThan24Hours, rateType]);

  // NUEVO: Lógica para saber si el alojamiento ya "expiró" para este usuario y solo puede reseñar
  const canOnlyReview = useMemo(() => {
    if (!user || !reservations) return false;
    // Aquí puedes conectar esto a tu backend que verifica si ya se hospedó y no ha comentado.
    // Retorna true si quieres que el panel de reserva desaparezca y solo pida reseña.
    return false; // Cambia esto por tu lógica real de base de datos
  }, [user, reservations]);

  // Precios
  const pricePerNight = Number(listing?.price || listing?.price_per_night || 0);
  const { nights, basePrice, discount, taxes, total } = useReservationPricing(checkIn, checkOut, pricePerNight, rateType);

  const images = Array.isArray(listing?.images) && listing.images.length > 0
    ? listing.images
    : [listing?.img || listing?.image_url || listing?.image].filter(Boolean)

  if (!listing) return null

  const handleConfirmReservation = async (e) => {
    if (e) e.preventDefault(); 
    if (!user) {
      openAuth()
      return
    }

    if (isBlocked || hasReachedLimit || canOnlyReview) return // Bloqueamos si solo puede reseñar

    const cleanPhone = sanitizePhone(cardNumber)
    const cleanCvv = sanitizeText(cardCvv, 4)

    if (paymentMethod === 'card' && (cleanPhone.length < 12 || cleanCvv.length < 3)) {
      alert('Ingresa una tarjeta válida antes de confirmar.')
      return
    }

    setLoading(true)
    const { data, error } = await createReservationWithPayment({
      listingId: listing.id,
      checkIn: formatDateForDB(checkIn),
      checkOut: formatDateForDB(checkOut),
      guests, // Envía el número configurado por el anfitrión
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

      {done ? (
        <div className="max-w-md mx-auto my-20 p-8 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-center shadow-xl">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mb-2">¡Reservación Confirmada!</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-6">
            Tu lugar en <strong>{listing.title}</strong> ha quedado reservado del <strong>{formatDateForDB(checkIn)}</strong> al <strong>{formatDateForDB(checkOut)}</strong>.
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
          >
            Aceptar y Volver
          </button>
        </div>
      ) : step === 'details' ? (

        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Gelería Dinámica */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-8">
              <div>
                
                {/* --- NUEVO MARCADOR DE LÍMITE DE ALOJAMIENTOS --- */}
                {user && (
                  <div className={`mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border ${
                    hasReachedLimit 
                      ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900' 
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900'
                  }`}>
                    <span>{hasReachedLimit ? '⚠️' : '✅'}</span>
                    <span>Alojamientos en curso: {activeReservationsCount} / 3</span>
                    {hasReachedLimit && <span className="ml-2 border-l border-rose-300 dark:border-rose-700 pl-2">Límite alcanzado</span>}
                  </div>
                )}
                {/* ----------------------------------------------- */}

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

              <ReviewsSection listingId={listing.id} />
            </div>

            {/* CUADRO DE RESERVACIÓN / RESEÑA */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-6">
                
                {/* Lógica: Si el usuario solo puede reseñar (expirado), ocultamos el formulario de reserva */}
                {canOnlyReview ? (
                  <div className="space-y-4 text-center py-4">
                    <p className="text-5xl mb-2">⭐</p>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Alojamiento finalizado</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Ya has completado tu estancia en este lugar. ¿Te gustaría dejar una reseña para compartir tu experiencia?
                    </p>
                    <button 
                      onClick={() => {
                        // Desplazar suavemente a la sección de reseñas (requiere id en ReviewsSection)
                        document.querySelector('#reviews-section-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition"
                    >
                      Danos tu opinión ★
                    </button>
                    <p className="text-center text-xs text-gray-400 font-medium">Solo puedes dejar una reseña por estancia</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-gray-900 dark:text-gray-50">
                          ${total.toLocaleString()} MXN
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">total</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">O 3x ${(total / 3).toFixed(0)} MXN sin intereses</p>
                    </div>

                    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl">
                      <div className="grid grid-cols-2 border-b border-gray-300 dark:border-gray-700">
                        
                        <div className="p-2.5 border-r border-gray-300 dark:border-gray-700 relative">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Check-in</label>
                          <DatePicker
                            selected={checkIn}
                            onChange={(date) => setCheckIn(date)}
                            selectsStart
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={today}
                            excludeDateIntervals={excludedIntervals}
                            dateFormat="yyyy-MM-dd"
                            wrapperClassName="w-full"
                            className="w-full min-w-0 text-xs font-semibold bg-transparent focus:outline-none dark:text-white cursor-pointer"
                            popperClassName="z-[100]" 
                          />
                        </div>
                        
                        <div className="p-2.5 relative">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Checkout</label>
                          <DatePicker
                            selected={checkOut}
                            onChange={(date) => setCheckOut(date)}
                            selectsEnd
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={checkIn || today}
                            excludeDateIntervals={excludedIntervals}
                            dateFormat="yyyy-MM-dd"
                            wrapperClassName="w-full"
                            className="w-full min-w-0 text-xs font-semibold bg-transparent focus:outline-none dark:text-white cursor-pointer"
                            popperClassName="z-[100]"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 relative">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Huéspedes</label>
                        {/* CAMBIO: Se removió el <select>, ahora es texto de solo lectura dinámico */}
                        <div className="w-full text-xs font-semibold text-gray-900 dark:text-white py-1">
                          {guests} huésped{guests > 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>

                    {/* MENSAJES DE RESTRICCIÓN */}
                    {hasReachedLimit ? (
                      <p className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-xl">
                        ⚠️ Has alcanzado el límite de 3 reservaciones activas. Disfruta tus viajes actuales antes de reservar de nuevo.
                      </p>
                    ) : isBlocked ? (
                      <p className="p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-xl">
                        ⚠️ Estas fechas ya están ocupadas por otro huésped. Por favor, selecciona otras fechas en el calendario.
                      </p>
                    ) : null}

                    {/* TARIFAS */}
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

                      <label className={`block p-4 rounded-2xl border transition ${
                        isLessThan24Hours ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800' 
                        : rateType === 'refundable' 
                          ? 'cursor-pointer border-rose-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white ring-2 ring-rose-500/20' 
                          : 'cursor-pointer border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                              Reembolsable · <span className="font-extrabold text-rose-500">${total.toLocaleString()} MXN</span>
                            </p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                              Cancelación flexible hasta 1 día antes del Check-in.
                            </p>
                            {/* Mensaje de restricción de menos de 1 día */}
                            {isLessThan24Hours && (
                              <p className="text-[10px] text-rose-500 font-bold mt-1">
                                No disponible: La reserva es en menos de 24 hrs.
                              </p>
                            )}
                          </div>
                          <input 
                            type="radio" 
                            name="rateType" 
                            disabled={isLessThan24Hours} // Bloquear input
                            checked={rateType === 'refundable'} 
                            onChange={() => setRateType('refundable')}
                            className="mt-1 accent-rose-500 h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) openAuth()
                        else setStep('checkout')
                      }}
                      disabled={isBlocked || hasReachedLimit}
                      className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition"
                    >
                      {!user ? 'Inicia sesión para reservar' : hasReachedLimit ? 'Límite alcanzado' : 'Reservar'}
                    </button>

                    <p className="text-center text-xs text-gray-400 font-medium">Aún no se te cobrará nada</p>
                  </>
                )}
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
            <button type="button" onClick={() => setStep('details')} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">←</button>
            Confirmar y pagar
          </h1>

          <form onSubmit={handleConfirmReservation} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <h3 className="font-bold text-lg">1. Elige cómo pagar</h3>

                {/* --- AQUI SE ARREGLAN LOS COLORES DE LAS OPCIONES DE PAGO --- */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${
                  paymentOption === 'full' 
                    ? 'border-transparent bg-white shadow-md ring-2 ring-rose-500' // Blanco puro al seleccionar
                    : 'border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-bold ${paymentOption === 'full' ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
                        1 pago de ${total.toLocaleString()} MXN
                      </p>
                      <p className={`text-xs mt-0.5 ${paymentOption === 'full' ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        Paga el total ahora y queda todo listo.
                      </p>
                    </div>
                    <input type="radio" name="payOption" checked={paymentOption === 'full'} onChange={() => setPaymentOption('full')} className="accent-rose-500 w-5 h-5"/>
                  </div>
                </label>

                <label className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${
                  paymentOption === 'installments' 
                    ? 'border-transparent bg-white shadow-md ring-2 ring-rose-500' // Blanco puro al seleccionar
                    : 'border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-bold ${paymentOption === 'installments' ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
                        3 pagos de ${(total / 3).toFixed(2)} MXN
                      </p>
                      <p className={`text-xs mt-0.5 font-semibold ${paymentOption === 'installments' ? 'text-emerald-600' : 'text-emerald-500'}`}>
                        Sin intereses
                      </p>
                    </div>
                    <input type="radio" name="payOption" checked={paymentOption === 'installments'} onChange={() => setPaymentOption('installments')} className="accent-rose-500 w-5 h-5"/>
                  </div>
                </label>
                {/* ------------------------------------------------------------- */}

              </div>

              <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <h3 className="font-bold text-lg">2. Método de pago</h3>

                <div className="space-y-4">
                  <label className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-transparent bg-gray-100 dark:bg-white ring-2 ring-rose-500 shadow-md' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold flex items-center gap-2 ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>💳 Tarjeta de Crédito o Débito</span>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-rose-500 w-5 h-5"/>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-3 text-gray-900">
                        <input type="text" inputMode="numeric" value={cardNumber} onChange={handleCardNumber} placeholder="Número de tarjeta" maxLength="16" required className="w-full p-3 border border-gray-300 rounded-xl bg-white text-black focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" />
                        <div className="flex gap-4">
                          <input type="text" inputMode="numeric" value={cardExpiry} onChange={handleExpiry} placeholder="MM/AA" maxLength="5" required className="w-1/2 p-3 border border-gray-300 rounded-xl bg-white text-black focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" />
                          <input type="text" inputMode="numeric" value={cardCvv} onChange={handleCvv} placeholder="CVV" maxLength="4" required className="w-1/2 p-3 border border-gray-300 rounded-xl bg-white text-black focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" />
                        </div>
                      </div>
                    )}
                  </label>

                  <label className={`block p-4 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-transparent bg-gray-100 dark:bg-white ring-2 ring-rose-500 shadow-md' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold flex items-center gap-2 ${paymentMethod === 'paypal' ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>🌐 PayPal</span>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-rose-500 w-5 h-5"/>
                    </div>
                    {paymentMethod === 'paypal' && (
                      <div className="mt-4">
                        <input type="email" placeholder="Correo de PayPal" required className="w-full p-3 border border-gray-300 rounded-xl bg-white text-black focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" />
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
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
                      <p className="text-gray-500">{formatDateForDB(checkIn)} al {formatDateForDB(checkOut)}</p>
                    </div>
                    <button type="button" onClick={() => setStep('details')} className="font-bold text-rose-500 underline">Cambiar</button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Huéspedes</p>
                      <p className="text-gray-500">{guests} huésped{guests > 1 ? 'es' : ''}</p>
                    </div>
                    <button type="button" onClick={() => setStep('details')} className="font-bold text-rose-500 underline">Cambiar</button>
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

          </form>
        </div>

      )}

    </div>
  )
}