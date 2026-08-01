import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function VerifyIdentity({ userId, onVerificationPending }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading', 'unverified', 'pending', 'approved', 'rejected'

  // 1. Obtener el estado actual del usuario al cargar el componente
  useEffect(() => {
    async function checkStatus() {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setStatus(data.verification_status || 'unverified');
      } catch (error) {
        console.error("Error al obtener estado:", error);
        setStatus('unverified');
      }
    }
    checkStatus();
  }, [userId]);

  // 2. Manejar la selección del archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validar que sea imagen
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen (JPG, PNG).');
      return;
    }

    setFile(selectedFile);
    
    // Crear URL temporal para la vista previa
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  // 3. Subir el INE a Supabase Storage y actualizar perfil
  const uploadINE = async () => {
    if (!file || !userId) {
      toast.error('Falta seleccionar un archivo o iniciar sesión.');
      return;
    }
    
    setUploading(true);
    const toastId = toast.loading('Subiendo documento de identidad...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-ine-front.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // A. Subir imagen al bucket privado
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // B. Actualizar el perfil del usuario a "pending"
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', userId);

      if (updateError) throw updateError;

      setStatus('pending');
      toast.success('¡Documento enviado con éxito! Tu perfil está en revisión.', { id: toastId });
      
      // Si recibes una función por props para cambiar la vista padre, la ejecutas
      if (onVerificationPending) onVerificationPending();
      
    } catch (error) {
      console.error('Error al subir INE:', error);
      toast.error('Hubo un error al subir el documento. Intenta de nuevo.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Renderizados condicionales según el estado
  if (status === 'loading') {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-3xl border border-yellow-200 dark:border-yellow-900 shadow-sm text-center">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">En revisión</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Nuestro equipo está verificando tu identidad. Este proceso puede tardar hasta 24 horas. Te notificaremos cuando puedas empezar a hospedar.
        </p>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-3xl border border-green-200 dark:border-green-900 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Identidad Verificada!</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Ya tienes acceso total al Modo Anfitrión.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 dark:bg-rose-950/50 rounded-full text-xs font-bold mb-3">Seguridad StayMX</span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Verifica tu identidad</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Para mantener la confianza en nuestra comunidad, requerimos una foto clara de la parte frontal de tu INE o Pasaporte vigente.
        </p>
      </div>

      {status === 'rejected' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          Tu última solicitud fue rechazada. Por favor, asegúrate de subir una imagen clara, sin reflejos y que los datos sean legibles.
        </div>
      )}

      <div className="flex flex-col gap-5">
        <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${
          preview ? 'border-[#FF385C] bg-rose-50 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
        }`}>
          {preview ? (
            <>
              <img src={preview} alt="INE Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="relative z-10 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm font-semibold">
                Cambiar imagen
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <span className="text-3xl mb-2">📸</span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toca para seleccionar tu documento</p>
              <p className="text-xs text-gray-500 mt-1">Soporta JPG o PNG (Max 5MB)</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>

        <button
          onClick={uploadINE}
          disabled={!file || uploading}
          className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {uploading ? 'Procesando...' : 'Enviar documento para revisión'}
        </button>
      </div>
    </div>
  );
}