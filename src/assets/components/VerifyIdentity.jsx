import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase (idealmente impórtalo de tu archivo config)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function VerifyIdentity({ userId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('unverified');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadINE = async () => {
    if (!file || !userId) return alert('Por favor selecciona un archivo.');
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-ine-front.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    try {
      // 1. Subir la imagen al bucket privado 'kyc_documents'
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Actualizar el estado del usuario en la tabla profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', userId);

      if (updateError) throw updateError;

      setStatus('pending');
      alert('¡Documento enviado con éxito! Tu perfil está en revisión.');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al subir el documento.');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-200">
        <h3 className="font-bold text-lg">En revisión ⏳</h3>
        <p>Estamos revisando tu identidad. Esto puede tardar hasta 24 horas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Verificación para Anfitriones</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Para mantener nuestra comunidad segura, requerimos una foto frontal de tu INE oficial vigente.
      </p>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {file ? file.name : 'Toca para seleccionar tu INE'}
          </span>
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
          className="w-full py-3 px-4 bg-[#FF385C] hover:bg-[#D90B38] text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Enviando documento...' : 'Enviar INE para revisión'}
        </button>
      </div>
    </div>
  );
}