// src/assets/components/HostDashboard.jsx
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Función auxiliar para calcular el tiempo restante de cancelación
const getCancellationStatus = (checkInDate) => {
  const checkIn = new Date(checkInDate);
  // La fecha límite es 1 día antes del check-in a la misma hora
  const deadline = new Date(checkIn);
  deadline.setDate(deadline.getDate() - 1);
  
  const now = new Date();
  const diffMs = deadline - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return { status: 'secured', text: 'Cancelación bloqueada (Ingreso seguro)', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400' };
  } else if (diffHours < 24) {
    return { status: 'warning', text: `Límite en ${diffHours} horas`, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400' };
  } else {
    return { status: 'open', text: `Cancelable por ${diffDays} días más`, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400' };
  }
};

export default function HostDashboard({ listings, reservations, onBlockDates }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [blockData, setBlockData] = useState({ listingId: '', startDate: '', endDate: '' });

  // 1. LÓGICA DEL GRÁFICO: Agrupar ganancias por mes
  const monthlyEarnings = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data = months.map(month => ({ name: month, total: 0 }));

    reservations.forEach(res => {
      if (res.status !== 'cancelled') {
        const date = new Date(res.check_in);
        const monthIndex = date.getMonth();
        // Sumamos el precio total al mes correspondiente
        data[monthIndex].total += Number(res.total_price || 0);
      }
    });

    return data;
  }, [reservations]);

  // 2. LÓGICA DE PRÓXIMAS RESERVAS
  const upcomingReservations = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations
      .filter(res => res.status !== 'cancelled' && res.check_in >= today)
      .sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
  }, [reservations]);

  const handleBlockSubmit = (e) => {
    e.preventDefault();
    if (!blockData.listingId || !blockData.startDate || !blockData.endDate) {
      alert("Por favor completa todos los campos para bloquear las fechas.");
      return;
    }
    // Aquí llamarías a tu función de Supabase para guardar un bloqueo
    // Puedes tratar el bloqueo como una reservación especial con status 'maintenance'
    alert(`Fechas bloqueadas del ${blockData.startDate} al ${blockData.endDate} por mantenimiento.`);
    setBlockData({ listingId: '', startDate: '', endDate: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-gray-900 dark:text-gray-100">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2">Panel de Anfitrión</h1>
          <p className="text-sm text-gray-500">Gestiona tus ingresos, bloquea fechas y revisa tus políticas de cancelación.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 shadow-sm text-rose-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Resumen Financiero
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white dark:bg-gray-700 shadow-sm text-rose-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Mantenimiento y Agenda
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* TARJETAS DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-1">Ingresos Totales (Este año)</p>
              <h3 className="text-3xl font-black text-emerald-500">
                ${monthlyEarnings.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()} MXN
              </h3>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-1">Alojamientos Activos</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{listings.length}</h3>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-1">Próximas Reservas</p>
              <h3 className="text-3xl font-black text-rose-500">{upcomingReservations.length}</h3>
            </div>
          </div>

          {/* GRÁFICO DE GANANCIAS */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Flujo de Ganancias</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEarnings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`$${value} MXN`, 'Ingresos']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MARCADOR DE CANCELACIÓN (PRÓXIMAS RESERVAS) */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Estado de Políticas de Cancelación</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                    <th className="pb-3 font-semibold">Alojamiento</th>
                    <th className="pb-3 font-semibold">Check-in</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Estado de Cancelación (1 día antes)</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingReservations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">No hay reservas próximas.</td>
                    </tr>
                  ) : (
                    upcomingReservations.map(res => {
                      const listing = listings.find(l => l.id === res.listing_id);
                      const status = getCancellationStatus(res.check_in);
                      
                      return (
                        <tr key={res.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-none">
                          <td className="py-4 font-semibold">{listing?.title || 'Alojamiento'}</td>
                          <td className="py-4 text-sm">{res.check_in}</td>
                          <td className="py-4 text-sm font-black">${res.total_price?.toLocaleString()} MXN</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="animate-fadeIn max-w-2xl">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-6">
              🛠️
            </div>
            <h3 className="font-black text-2xl mb-2">Bloquear fechas manualmente</h3>
            <p className="text-sm text-gray-500 mb-8">
              Utiliza esta herramienta si necesitas realizar reparaciones, limpieza profunda o si vas a utilizar el alojamiento para uso personal. Nadie podrá reservar en estos días.
            </p>

            <form onSubmit={handleBlockSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selecciona el alojamiento</label>
                <select 
                  value={blockData.listingId}
                  onChange={(e) => setBlockData({...blockData, listingId: e.target.value})}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-shadow"
                  required
                >
                  <option value="">-- Elige una propiedad --</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de inicio</label>
                  <input 
                    type="date" 
                    value={blockData.startDate}
                    onChange={(e) => setBlockData({...blockData, startDate: e.target.value})}
                    className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de fin</label>
                  <input 
                    type="date" 
                    value={blockData.endDate}
                    onChange={(e) => setBlockData({...blockData, endDate: e.target.value})}
                    min={blockData.startDate}
                    className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl shadow-lg hover:opacity-90 transition"
              >
                Bloquear Calendario
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}