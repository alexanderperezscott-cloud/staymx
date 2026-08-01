import React, { useState, useEffect, useRef } from 'react';
import { supabase, getMessages, sendMessage } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function ReservationChat({ isOpen, onClose, reservation, currentUser, listingInfo }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Determinar con quién estamos hablando
  // Si el usuario actual es el host de la propiedad, el receptor es el guest. Y viceversa.
  const isHost = currentUser?.id === listingInfo?.host_id;
  const receiverId = isHost ? reservation.guest_id : listingInfo?.host_id;

  useEffect(() => {
    if (isOpen && reservation) {
      fetchChat();
      
      // ¡FACTOR WOW! 🚀 Suscripción a mensajes en Tiempo Real
      const channel = supabase
        .channel('realtime-messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `reservation_id=eq.${reservation.id}` }, 
          (payload) => {
            // Cuando llega un mensaje nuevo, lo agregamos al estado
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, reservation]);

  // Hacer scroll automático hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChat = async () => {
    setLoading(true);
    const { data, error } = await getMessages(reservation.id);
    if (error) {
      toast.error('Error al cargar los mensajes');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(''); // Limpiamos el input de inmediato para mejor UX

    try {
      const { error } = await sendMessage(reservation.id, receiverId, content);
      if (error) throw error;
      // No necesitamos hacer push al array `messages` aquí porque el canal de Tiempo Real lo detectará y lo agregará automáticamente.
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
        
        {/* Encabezado del Chat */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Chat con el {isHost ? 'Huésped' : 'Anfitrión'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-48">{listingInfo?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
            ✕
          </button>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-6 w-6 border-b-2 border-rose-500 rounded-full"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 my-auto">
              <p className="text-4xl mb-2">👋</p>
              <p className="text-sm">Envía el primer mensaje para saludar.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    isMine 
                      ? 'bg-rose-500 text-white rounded-br-sm' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Envío */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600 transition disabled:opacity-50 flex-shrink-0"
          >
            ➤
          </button>
        </form>

      </div>
    </div>
  );
}