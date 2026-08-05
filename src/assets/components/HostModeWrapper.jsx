// src/assets/components/HostModeWrapper.jsx
import React, { useState, useEffect } from 'react';
import { supabase, deleteListing } from '../../config/supabase';
import VerifyIdentity from './VerifyIdentity';
import PublishForm from './PublishForm';
import toast from 'react-hot-toast';

export default function HostModeWrapper({ onPublish, onCancel, userId, user, initialView = 'list', onOpenChat }) {
  const [isVerifiedHost, setIsVerifiedHost] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Control de Vistas y Datos
  const [view, setView] = useState(initialView); 
  const [myListings, setMyListings] = useState([]);
  const [hostReservations, setHostReservations] = useState([]); // Estado para las reservaciones de tus huéspedes

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return; 
      }

      // 1. CARGAMOS TUS ALOJAMIENTOS EN RENTA (Y SUS RESERVACIONES)
      fetchMyListings(session.user.id);

      // 2. VERIFICAMOS TU ESTATUS PARA CUANDO QUIERAS PUBLICAR NUEVO
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_host, verification_status')
        .eq('id', session.user.id)
        .single();

      if (profile && profile.verification_status === 'approved' && profile.is_host) {
        setIsVerifiedHost(true);
      }
    } catch (error) {
      console.error("Error al verificar estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async (hostId) => {
    // Buscar propiedades del host
    const { data: listingsData } = await supabase.from('listings').select('*').eq('host_id', hostId);
    
    if (listingsData) {
      setMyListings(listingsData);
      
      // Buscar las reservaciones vinculadas a esas propiedades
      const listingIds = listingsData.map(l => l.id);
      if (listingIds.length > 0) {
        const { data: resData } = await supabase.from('reservations').select('*').in('listing_id', listingIds);
        if (resData) {
          // Ordenamos para ver las más recientes primero
          const sortedRes = resData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setHostReservations(sortedRes);
        }
      }
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este lugar? Se borrará permanentemente de la plataforma.")) return;
    
    const { error } = await deleteListing(id); 
    if (error) {
      toast.error("Error al eliminar la propiedad");
    } else {
      setMyListings(prev => prev.filter(l => l.id !== id));
      toast.success("Propiedad eliminada con éxito");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold">Por favor, inicia sesión para acceder a tu panel.</h2>
      </div>
    );
  }

  // --- VISTA 1: TUS PROPIEDADES Y RESERVACIONES DE HUÉSPEDES ---
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white p-6 pt-10 pb-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Tus propiedades en renta</h1>
            <button 
              onClick={() => setView('publish')}
              className="bg-[#ff385c] hover:bg-[#e03150] text-white px-6 py-3 rounded-full font-bold transition shadow-lg flex items-center gap-2"
            >
              <span>➕</span> Publicar Nuevo Lugar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myListings.length === 0 ? (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-3xl">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium text-lg">No tienes propiedades publicadas actualmente.</p>
                <button onClick={() => setView('publish')} className="text-[#ff385c] font-bold hover:underline text-base">
                  Empieza a hospedar ahora
                </button>
              </div>
            ) : (
              myListings.map(lugar => (
                <div key={lugar.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img src={lugar.image_url || lugar.img || lugar.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400'} alt="img" className="w-full sm:w-28 sm:h-28 rounded-xl object-cover" />
                  
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold line-clamp-1">{lugar.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lugar.city}, {lugar.state}</p>
                    <p className="text-[#ff385c] font-black mt-2">${lugar.price_per_night || lugar.price} MXN <span className="text-xs font-normal text-gray-500">/ noche</span></p>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteProperty(lugar.id)}
                    className="w-full sm:w-auto bg-rose-50 dark:bg-slate-700/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white px-4 py-3 sm:p-3 rounded-xl transition-colors font-bold text-sm"
                    title="Eliminar publicación"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>

          {/* --- NUEVA SECCIÓN: RESERVACIONES DE TUS HUÉSPEDES --- */}
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-t border-gray-200 dark:border-gray-800 pt-8">
              Reservaciones de tus huéspedes
            </h2>
            
            {hostReservations.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400">Aún no tienes reservaciones en tus propiedades.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostReservations.map(res => {
                  const lugar = myListings.find(l => l.id === res.listing_id);
                  const isCancelled = res.status === 'cancelled';

                  return (
                    <div key={res.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                      
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                          {lugar?.title || 'Propiedad'}
                        </h4>
                        <p className="text-sm font-bold text-rose-500 mt-1">
                          Fechas: {res.check_in} al {res.check_out}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Huéspedes: {res.guests_count || res.guests || 1} · ID Huésped: {res.guest_id?.substring(0,6)}...
                        </p>
                        
                        <span className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${
                          isCancelled 
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        }`}>
                          {isCancelled ? '❌ Cancelada por huésped' : '✅ Reservación Activa'}
                        </span>
                      </div>

                      {!isCancelled && (
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                          <button 
                            onClick={() => onOpenChat && onOpenChat(res, lugar)}
                            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white py-2.5 rounded-xl font-bold text-sm transition flex justify-center items-center gap-2"
                          >
                            💬 Mensajes con Huésped
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- VISTA 2: FORMULARIO DE PUBLICAR NUEVO (SÍ PIDE INE) ---
  if (view === 'publish') {
    if (isVerifiedHost) {
      return (
        <PublishForm 
          userId={user.id} 
          onCancel={() => { setView('list'); onCancel(); }} 
          onPublish={() => { fetchMyListings(user.id); setView('list'); onPublish && onPublish(); }} 
        />
      );
    } else {
      return (
        <div className="min-h-screen bg-white dark:bg-[#0F172A] pt-20">
          <VerifyIdentity userId={user.id} onVerificationPending={checkUserStatus} />
        </div>
      );
    }
  }

  return null;
}