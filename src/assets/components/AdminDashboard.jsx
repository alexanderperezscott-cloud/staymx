// src/assets/components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminDashboard() {
  // Pestaña Principal (Users vs Listings)
  const [mainView, setMainView] = useState('users'); 

  // Estados de Usuarios
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'all', 'hosts', 'pending'
  
  // Estados de Alojamientos
  const [listings, setListings] = useState([]);
  const [searchListing, setSearchListing] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Usuarios
      const { data: usersData, error: errU } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!errU) setUsers(usersData || []);

      // 2. Cargar Alojamientos
      const { data: listingsData, error: errL } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (!errL) setListings(listingsData || []);

    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  // ----- LÓGICA DE USUARIOS -----
  const stats = {
    total: users.length,
    hosts: users.filter(u => u.is_host).length,
    pending: users.filter(u => u.verification_status === 'pending').length
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchUser.toLowerCase()) || user.email?.toLowerCase().includes(searchUser.toLowerCase());
    const matchesTab = activeTab === 'all' ? true : activeTab === 'hosts' ? user.is_host === true : activeTab === 'pending' ? user.verification_status === 'pending' : true;
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (userId) => {
    if (!window.confirm('¿Aprobar a este usuario como Anfitrión?')) return;
    await supabase.from('profiles').update({ verification_status: 'approved', is_host: true }).eq('id', userId);
    fetchAdminData();
  };

  const handleReject = async (userId) => {
    if (!window.confirm('¿Rechazar esta identificación?')) return;
    await supabase.from('profiles').update({ verification_status: 'rejected', is_host: false }).eq('id', userId);
    fetchAdminData();
  };

  const handleRevokeHost = async (userId) => {
    if (!window.confirm('¿SEGURO QUE DESEAS ELIMINAR LOS PRIVILEGIOS DE ANFITRIÓN DE ESTE USUARIO?')) return;
    await supabase.from('profiles').update({ verification_status: 'unverified', is_host: false }).eq('id', userId);
    fetchAdminData();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('🚨 ALERTA ROJA: ¿Seguro que deseas ELIMINAR este usuario permanentemente?')) return;
    await supabase.from('profiles').delete().eq('id', userId);
    fetchAdminData();
  };

  const viewDocument = async (userId) => {
    const { data, error } = await supabase.storage.from('kyc_documents').createSignedUrl(`${userId}/${userId}-ine-front.jpg`, 60);
    if (error) alert('Documento no encontrado o no ha sido subido.');
    else window.open(data.signedUrl, '_blank');
  };

  // ----- LÓGICA DE ALOJAMIENTOS -----
  const filteredListings = listings.filter(l => 
    l.title?.toLowerCase().includes(searchListing.toLowerCase()) || 
    l.city?.toLowerCase().includes(searchListing.toLowerCase()) ||
    l.type?.toLowerCase().includes(searchListing.toLowerCase())
  );

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('🚨 ¿Seguro que deseas ELIMINAR esta propiedad de la plataforma? Esta acción no se puede deshacer.')) return;
    await supabase.from('listings').delete().eq('id', listingId);
    fetchAdminData();
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a202c] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de la plataforma StayMX</p>
          </div>

          {/* Menú Principal de Vistas */}
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1.5 rounded-xl shadow-inner">
            <button onClick={() => setMainView('users')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${mainView === 'users' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              👥 Usuarios
            </button>
            <button onClick={() => setMainView('listings')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${mainView === 'listings' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              🏡 Alojamientos
            </button>
          </div>
        </header>

        {/* ---------------- VISTA 1: USUARIOS ---------------- */}
        {mainView === 'users' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-[#222b3a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Usuarios Totales</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-[#222b3a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Anfitriones Activos</h3>
                <p className="text-4xl font-bold text-[#FF385C] mt-2">{stats.hosts}</p>
              </div>
              <div className="bg-white dark:bg-[#222b3a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Verificaciones Pendientes</h3>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-500 mt-2">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#222b3a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'pending' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Pendientes</button>
                  <button onClick={() => setActiveTab('hosts')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'hosts' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Anfitriones</button>
                  <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Todos</button>
                </div>
                <div className="relative w-full md:w-80">
                  <input type="text" placeholder="Buscar por nombre o correo..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF385C] outline-none" />
                  <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 font-medium">Usuario</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Estado</th>
                      <th className="p-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                          <td className="p-4 font-medium text-gray-900 dark:text-white">{user.full_name || 'Sin nombre'}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{user.email}</td>
                          <td className="p-4">
                            {user.is_host ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">Anfitrión</span>
                            ) : user.verification_status === 'pending' ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-semibold">Pendiente</span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">Normal</span>
                            )}
                          </td>
                          <td className="p-4 flex gap-2 justify-end items-center">
                            {(user.verification_status === 'pending' || user.verification_status === 'approved') && (
                              <button onClick={() => viewDocument(user.id)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mr-2">Ver INE</button>
                            )}
                            {user.verification_status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(user.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">Aprobar</button>
                                <button onClick={() => handleReject(user.id)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium">Rechazar</button>
                              </>
                            )}
                            {user.is_host && (
                              <button onClick={() => handleRevokeHost(user.id)} className="px-3 py-1.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition">Revocar</button>
                            )}
                            <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-1 shadow-sm">🗑️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------------- VISTA 2: ALOJAMIENTOS ---------------- */}
        {mainView === 'listings' && (
          <div className="bg-white dark:bg-[#222b3a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Propiedades en Plataforma ({listings.length})</h2>
              <div className="relative w-full md:w-80">
                <input type="text" placeholder="Buscar por título, ciudad o tipo..." value={searchListing} onChange={(e) => setSearchListing(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF385C] outline-none" />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-medium">Propiedad</th>
                    <th className="p-4 font-medium">Ubicación</th>
                    <th className="p-4 font-medium">Precio / Noche</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron alojamientos.</td></tr>
                  ) : (
                    filteredListings.map((lugar) => (
                      <tr key={lugar.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                        <td className="p-4 flex gap-4 items-center">
                          <img src={lugar.image_url || lugar.img || (lugar.images && lugar.images[0]) || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562'} className="w-14 h-14 rounded-lg object-cover shadow-sm" alt="propiedad" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{lugar.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{lugar.type || lugar.property_type || 'Alojamiento'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{lugar.city}, {lugar.state}</td>
                        <td className="p-4 font-black text-rose-500">${lugar.price_per_night || lugar.price}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteListing(lugar.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm transition">
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}