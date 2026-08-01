import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import VerifyIdentity from './VerifyIdentity';
import PublishForm from './PublishForm';

export default function HostModeWrapper() {
  const [user, setUser] = useState(null);
  const [isVerifiedHost, setIsVerifiedHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return; // Aquí podrías redirigir al login
      }

      setUser(session.user);

      // Consultar el perfil del usuario para ver su estado
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

  // Callback si el usuario cancela la publicación
  const handleCancel = () => {
    window.location.href = '/'; // Redirige al inicio
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  // Si el usuario no ha iniciado sesión (opcional: mostrar un modal de login)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <h2 className="text-xl font-bold">Por favor, inicia sesión para acceder al Modo Anfitrión.</h2>
      </div>
    );
  }

  // EL EMBUDO: Decide qué componente renderizar
  return isVerifiedHost ? (
    <PublishForm userId={user.id} onCancel={handleCancel} onPublish={handleCancel} />
  ) : (
    <div className="min-h-screen bg-[#0F172A] pt-20">
      {/* Pasamos checkUserStatus para que reevalúe si el admin lo aprueba en tiempo real */}
      <VerifyIdentity userId={user.id} onVerificationPending={checkUserStatus} />
    </div>
  );
}