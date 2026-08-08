// src/assets/components/TermsModal.jsx
import React from 'react';

export default function TermsModal({ isOpen, onAccept, onDecline }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>📄</span> Términos y Condiciones
          </h2>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-600 dark:text-gray-300 space-y-5 custom-scrollbar">
          <p>
            Bienvenido a <strong>StayMX</strong>. Al utilizar nuestra plataforma, aceptas los siguientes términos y condiciones que rigen el uso de nuestros servicios de intermediación de alojamientos en México.
          </p>

          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">1. Uso de la Plataforma</h3>
            <p>StayMX funciona como un intermediario tecnológico entre anfitriones y huéspedes. Los usuarios deben proporcionar información verídica al crear su cuenta y mantenerla actualizada.</p>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">2. Límite de Reservaciones</h3>
            <p>Para garantizar una distribución justa de los espacios y evitar el acaparamiento, <strong>cada huésped tiene un límite máximo de tres (3) reservaciones activas simultáneas</strong>. No podrás realizar nuevas reservas hasta que concluyas o canceles tus viajes actuales.</p>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">3. Política Estricta de Cancelación</h3>
            <p>Las cancelaciones por parte de los huéspedes están sujetas a una regla de 24 horas. <strong>Podrás cancelar tu reserva sin penalización siempre y cuando falte más de un (1) día (24 horas) para la fecha de check-in</strong>. Una vez superado este límite, el sistema bloqueará la opción de cancelación y el pago será procesado en su totalidad.</p>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">4. Responsabilidades del Anfitrión y Huésped</h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Anfitriones:</strong> Se comprometen a mantener la disponibilidad real de sus calendarios, bloquear fechas por mantenimiento cuando sea necesario y garantizar que las fotografías coincidan con la realidad.</li>
              <li><strong>Huéspedes:</strong> Se comprometen a cuidar las instalaciones, respetar la capacidad máxima de personas indicada en la publicación y utilizar el chat de la plataforma de manera respetuosa.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">5. Pagos y Reembolsos</h3>
            <p>Los pagos se procesan a través de proveedores seguros de terceros. StayMX no almacena directamente tu información bancaria. Los reembolsos por cancelaciones válidas se emitirán al método de pago original.</p>
          </div>

          <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            Última actualización: Agosto de 2026. Al hacer clic en "Aceptar", confirmas que has leído y comprendido estos términos.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button 
            onClick={onDecline}
            className="px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full sm:w-auto"
          >
            Rechazar y Salir
          </button>
          <button 
            onClick={onAccept}
            className="px-8 py-3 rounded-xl font-black text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition w-full sm:w-auto"
          >
            Aceptar Términos
          </button>
        </div>

      </div>
    </div>
  );
}