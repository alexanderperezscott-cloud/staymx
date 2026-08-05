import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function ReservationChat({ isOpen, onClose, reservation, listingInfo, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // 1. Identificar roles (Crucial para el esquema de Supabase)
  const isHost = currentUser?.id === listingInfo?.host_id;
  const title = isHost ? 'Chat con el Huésped' : 'Chat con el Anfitrión';
  const receiverId = isHost ? reservation?.guest_id : listingInfo?.host_id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !reservation) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('reservation_id', reservation.id)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${reservation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `reservation_id=eq.${reservation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      setMessages([]);
      setNewMessage('');
    };
  }, [isOpen, reservation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.trim();
    setNewMessage(''); // Limpia la caja inmediatamente

    const { error } = await supabase.from('messages').insert([
      {
        reservation_id: reservation.id,
        sender_id: currentUser.id,
        receiver_id: receiverId, // AÑADIDO: Basado en tu esquema de Supabase
        content: textToSend,
      }
    ]);

    if (error) {
      toast.error("Error al enviar el mensaje");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    // AÑADIDO: z-[60] para asegurar que esté por encima del panel de Anfitrión
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] border border-gray-200 dark:border-gray-800 relative">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#111827] z-10">
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 truncate max-w-[250px]">{listingInfo?.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0B0F19]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-70">
              <span className="text-4xl mb-2">💬</span>
              <p className="text-sm">Envía el primer mensaje.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-rose-500 text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:text-white transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}