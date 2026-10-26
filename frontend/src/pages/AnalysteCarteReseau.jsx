import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AnalysteCarteReseau() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coupures, setCoupures] = useState([]);
  const [quartiers, setQuartiers] = useState([]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const chargerDonnees = async () => {
    try {
      const [coupuresRes, quartiersRes] = await Promise.all([
        api.get('/coupures/', getAuthHeaders()),
        api.get('/quartiers/', getAuthHeaders())
      ]);
      setCoupures(coupuresRes.data || []);
      setQuartiers(quartiersRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b"><div className="flex items-center gap-2"><i className="fas fa-chart-line text-blue-600 text-xl"></i><span className="font-bold">Analyse réseau</span></div></div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/analyste" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-chart-line w-5"></i>Analyse</Link>
          <Link to="/analyste/predictions" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-chart-simple w-5"></i>Prédictions</Link>
          <Link to="/analyste/rapports" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-file-alt w-5"></i>Rapports</Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg"><i className="fas fa-map w-5"></i>Carte du réseau</div>
          <Link to="/analyste/journal" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 rounded-lg mx-2 hover:bg-gray-100"><i className="fas fa-history w-5"></i>Journal d'activités</Link>
        </nav>
        <div className="p-4 border-t"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-user-circle text-blue-600 text-xl"></i></div><div><p className="text-sm font-semibold">{user?.nom}</p><p className="text-xs text-green-600">Analyste</p></div><button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500"><i className="fas fa-sign-out-alt"></i></button></div></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6"><h1 className="text-2xl font-bold">Carte du réseau électrique</h1><p className="text-gray-500">Visualisation du réseau et des zones sensibles</p></div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">📊 Statistiques du réseau</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{quartiers.length}</p><p className="text-xs">Quartiers</p></div>
            <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-red-600">{coupures.filter(c => c.statut === 'en_cours').length}</p><p className="text-xs">Coupures actives</p></div>
            <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-orange-600">{coupures.filter(c => c.statut === 'planifie').length}</p><p className="text-xs">Planifiées</p></div>
            <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{coupures.filter(c => c.statut === 'termine').length}</p><p className="text-xs">Résolues</p></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b"><h2 className="font-semibold">🗺️ Zones du réseau</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {quartiers.map(q => {
              const coupuresQuartier = coupures.filter(c => c.id_quartier === q.id_quartier);
              const enCours = coupuresQuartier.filter(c => c.statut === 'en_cours').length;
              return (
                <div key={q.id_quartier} className={`border rounded-lg p-4 ${enCours > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                  <div className="flex justify-between items-center"><h3 className="font-semibold">{q.nom_quartier}</h3>{enCours > 0 && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">{enCours} coupure(s)</span>}</div>
                  <p className="text-xs text-gray-500 mt-2">Ville: {q.ville_nom || 'Antananarivo'}</p>
                  {coupuresQuartier.length > 0 && <div className="mt-2 text-xs"><p className="font-medium">Dernière coupure:</p><p className="text-gray-500">{coupuresQuartier[0]?.cause || 'Non spécifiée'}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalysteCarteReseau;
