import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'all', 'hosts', 'pending'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Obtenemos TODOS los perfiles para calcular los números reales y buscar
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. CÁLCULO DE NÚMEROS REALES (KPIs)
  const stats = {
    total: users.length,
    hosts: users.filter(u => u.is_host).length,
    pending: users.filter(u => u.verification_status === 'pending').length
  };

  // 2. LÓGICA DE BÚSQUEDA Y FILTRADO
  const filteredUsers = users.filter(user => {
    // Filtro por texto
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por pestaña
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'hosts' ? user.is_host === true :
      activeTab === 'pending' ? user.verification_status === 'pending' : true;

    return matchesSearch && matchesTab;
  });

  // 3. ACCIONES DE ADMINISTRADOR
  const handleApprove = async (userId) => {
    if (!window.confirm('¿Aprobar a este usuario como Anfitrión?')) return;
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: 'approved', is_host: true })
      .eq('id', userId);
    if (!error) fetchUsers();
  };

  const handleReject = async (userId) => {
    if (!window.confirm('¿Rechazar esta identificación?')) return;
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: 'rejected', is_host: false })
      .eq('id', userId);
    if (!error) fetchUsers();
  };

  const handleRevokeHost = async (userId) => {
    if (!window.confirm('¿SEGURO QUE DESEAS ELIMINAR LOS PRIVILEGIOS DE ANFITRIÓN DE ESTE USUARIO? Sus propiedades podrían dejar de mostrarse.')) return;
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: 'unverified', is_host: false })
      .eq('id', userId);
    if (!error) fetchUsers();
  };

  const viewDocument = async (userId) => {
    const { data, error } = await supabase.storage
      .from('kyc_documents')
      .createSignedUrl(`${userId}/${userId}-ine-front.jpg`, 60);
    if (error) alert('Documento no encontrado o no ha sido subido.');
    else window.open(data.signedUrl, '_blank');
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a202c] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de la plataforma StayMX</p>
        </header>

        {/* KPIs Reales */}
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

        {/* Tabla y Filtros */}
        <div className="bg-white dark:bg-[#222b3a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Controles de la Tabla */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Pestañas (Tabs) */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'pending' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                Pendientes
              </button>
              <button onClick={() => setActiveTab('hosts')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'hosts' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                Anfitriones
              </button>
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                Todos
              </button>
            </div>
            
            {/* Buscador Universal */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF385C] outline-none"
              />
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
                  <th className="p-4 font-medium">Documentos</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron usuarios en esta categoría.
                    </td>
                  </tr>
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
                      <td className="p-4">
                        {(user.verification_status === 'pending' || user.verification_status === 'approved') && (
                          <button onClick={() => viewDocument(user.id)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                            Ver INE 📄
                          </button>
                        )}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        {user.verification_status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(user.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">Aprobar</button>
                            <button onClick={() => handleReject(user.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Rechazar</button>
                          </>
                        )}
                        
                        {/* Botón para revocar el rol de un anfitrión existente */}
                        {user.is_host && (
                          <button onClick={() => handleRevokeHost(user.id)} className="px-3 py-1.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition">
                            Revocar Anfitrión
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}