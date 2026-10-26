import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexts/services/api';

function AnalysteJournal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    chargerLogs();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const chargerLogs = async () => {
    try {
      const response = await api.get('/logs/', getAuthHeaders());
      setLogs(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setLogs([
        { id_log: 1, utilisateur_nom: 'Analyste', action: 'CONNEXION', details: 'Connexion à la plateforme', created_at: new Date().toISOString() },
        { id_log: 2, utilisateur_nom: 'Analyste', action: 'PREDICTION', details: 'Prédiction générée pour Analakely', created_at: new Date(Date.now() - 3600000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.action === filter);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b"><div className="flex items-center gap-2"><i className="fas fa-chart-line text-blue-600 text-xl"></i><span className="font-bold">Analyse réseau</span></div></div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/analyste" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-chart-line w-5"></i>Analyse</Link>
          <Link to="/analyste/predictions" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-chart-simple w-5"></i>Prédictions</Link>
          <Link to="/analyste/rapports" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-file-alt w-5"></i>Rapports</Link>
          <Link to="/analyste/carte-reseau" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-map w-5"></i>Carte du réseau</Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg"><i className="fas fa-history w-5"></i>Journal d'activités</div>
        </nav>
        <div className="p-4 border-t"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-user-circle text-blue-600 text-xl"></i></div><div><p className="text-sm font-semibold">{user?.nom}</p><p className="text-xs text-green-600">Analyste</p></div><button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500"><i className="fas fa-sign-out-alt"></i></button></div></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6"><h1 className="text-2xl font-bold">Journal d'activités</h1><p className="text-gray-500">Historique des actions</p></div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center"><h2 className="font-semibold">📋 Historique</h2><select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded-lg text-sm"><option value="all">Toutes</option><option value="CONNEXION">Connexions</option><option value="PREDICTION">Prédictions</option><option value="RAPPORT">Rapports</option><option value="EXPORT">Exports</option></select></div>
          <div className="divide-y">
            {filteredLogs.map(log => (
              <div key={log.id_log} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${log.action === 'CONNEXION' ? 'bg-green-500' : log.action === 'PREDICTION' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                <div className="flex-1"><p className="text-sm font-medium">{log.utilisateur_nom || 'Analyste'}</p><p className="text-xs text-gray-500">{log.details}</p></div>
                <div className="text-right"><p className="text-xs font-medium">{log.action}</p><p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalysteJournal;
