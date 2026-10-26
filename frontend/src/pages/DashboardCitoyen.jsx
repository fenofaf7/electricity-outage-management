import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import CarteCitoyen from './CarteCitoyen';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DashboardCitoyen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accueil');
  const [coupuresEnCours, setCoupuresEnCours] = useState([]);
  const [coupuresPlanifiees, setCoupuresPlanifiees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [signalement, setSignalement] = useState({
    id_quartier: '',
    description: '',
    type_anomalie: 'coupure_totale'
  });
  const [quartiers, setQuartiers] = useState([]);
  const [showSignalementModal, setShowSignalementModal] = useState(false);
  const [showCarteModal, setShowCarteModal] = useState(false);
  const [stats, setStats] = useState({
    notifications_non_lues: 0,
    coupures_impactees: 0
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      const quartiersRes = await api.get('/quartiers/', headers);
      const quartiersList = quartiersRes.data || [];
      setQuartiers(quartiersList);

      const quartierMap = {};
      quartiersList.forEach(q => { quartierMap[q.id_quartier] = q.nom_quartier; });

      const coupuresRes = await api.get('/coupures/', headers);
      const allCoupures = coupuresRes.data || [];

      const enCours = allCoupures.filter(c => c.statut === 'en_cours').map(c => ({
        ...c,
        quartier_nom: quartierMap[c.id_quartier] || 'Inconnu'
      }));

      const planifiees = allCoupures.filter(c => c.type_coupure === 'programmee' && c.statut !== 'termine').map(c => ({
        ...c,
        quartier_nom: quartierMap[c.id_quartier] || 'Inconnu'
      }));

      setCoupuresEnCours(enCours);
      setCoupuresPlanifiees(planifiees);

      let notifsData = [];
      try {
        const notifsRes = await api.get('/notifications/', headers);
        notifsData = notifsRes.data || [];
        const mesNotifs = notifsData.filter(n => n.id_citoyen === user?.id);
        setNotifications(mesNotifs);
      } catch (e) {}

      const nonLues = notifsData.filter(n => n.id_citoyen === user?.id && n.statut !== 'lu').length;

      setStats({
        notifications_non_lues: nonLues,
        coupures_impactees: enCours.length
      });

    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignaler = async () => {
    if (!signalement.id_quartier || !signalement.description) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const headers = getAuthHeaders();
      await api.post('/signalements/', {
        id_quartier: parseInt(signalement.id_quartier),
        description: `[${signalement.type_anomalie}] ${signalement.description}`,
        id_citoyen: user?.id,
        statut: 'en_attente'
      }, headers);
      toast.success('Signalement envoyé');
      setShowSignalementModal(false);
      setSignalement({ id_quartier: '', description: '', type_anomalie: 'coupure_totale' });
      chargerDonnees();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleMarquerLu = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/lire`, {}, getAuthHeaders());
      toast.success('Marquée comme lue');
      chargerDonnees();
    } catch (error) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const evolutionData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Coupures',
      data: [2, 3, 1, 4, 2, 1, 0],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } },
      tooltip: { bodyFont: { size: 11 } }
    },
    scales: {
      y: {
        ticks: { font: { size: 10 }, stepSize: 1 },
        title: { display: false }
      },
      x: {
        ticks: { font: { size: 10 } }
      }
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-100 flex">
    {/* Sidebar */}
    <aside className="w-60 bg-white shadow-lg flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <i className="fas fa-home text-blue-600 text-lg"></i>
          <span className="font-bold text-gray-800 text-sm">Espace Citoyen</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{user?.nom}</p>
      </div>
      <nav className="flex-1 py-3">
        <button onClick={() => setActiveTab('accueil')} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition ${activeTab === 'accueil' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
          <i className="fas fa-home w-5"></i><span>Accueil</span>
        </button>
        <button onClick={() => setActiveTab('coupures')} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition ${activeTab === 'coupures' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
          <i className="fas fa-bolt w-5"></i><span>Coupures</span>
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
          <i className="fas fa-bell w-5"></i>
          <span>Notifications</span>
          {stats.notifications_non_lues > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{stats.notifications_non_lues}</span>
          )}
        </button>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <i className="fas fa-user-circle text-blue-600 text-2xl"></i>
          <div className="flex-1">
            <p className="text-sm font-semibold">{user?.nom || 'Citoyen'}</p>
            <p className="text-xs text-blue-600">Citoyen</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>

    {/* Main content */}
    <main className="flex-1 overflow-y-auto p-4">

      {/* En-tête */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-800">Tableau de bord citoyen</h1>
        <p className="text-xs text-gray-500">Suivez les coupures et signalez les pannes</p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-2.5 text-center border-l-4 border-red-500">
          <p className="text-xs text-gray-500">En cours</p>
          <p className="text-xl font-bold text-red-600">{coupuresEnCours.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 text-center border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Prévues</p>
          <p className="text-xl font-bold text-yellow-600">{coupuresPlanifiees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2.5 text-center border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Notif.</p>
          <p className="text-xl font-bold text-blue-600">{stats.notifications_non_lues}</p>
        </div>
      </div>

      {/* Onglet Accueil */}
      {activeTab === 'accueil' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h2 className="text-xs font-semibold text-gray-800 mb-2">📈 Évolution des coupures</h2>
            <div className="h-32">
              <Line data={evolutionData} options={chartOptions} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowSignalementModal(true)} className="bg-blue-600 rounded-lg py-2.5 text-white text-center hover:bg-blue-700">
              <i className="fas fa-exclamation-triangle text-sm"></i>
              <p className="text-xs font-medium mt-1">Signaler une panne</p>
            </button>
            <button onClick={() => setShowCarteModal(true)} className="bg-green-600 rounded-lg py-2.5 text-white text-center hover:bg-green-700">
              <i className="fas fa-map-marked-alt text-sm"></i>
              <p className="text-xs font-medium mt-1">Carte des coupures</p>
            </button>
          </div>
        </div>
      )}

      {/* Onglet Coupures */}
      {activeTab === 'coupures' && (
        <div className="space-y-3">
          {coupuresEnCours.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-red-50">
                <p className="text-xs font-semibold text-red-600">⚠️ En cours ({coupuresEnCours.length})</p>
              </div>
              <div className="divide-y">
                {coupuresEnCours.slice(0, 5).map((c) => (
                  <div key={c.id_coupure} className="px-3 py-2 text-xs flex justify-between">
                    <span className="font-medium text-red-600">{c.quartier_nom}</span>
                    <span className="text-gray-500">{c.cause}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {coupuresPlanifiees.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-yellow-50">
                <p className="text-xs font-semibold text-yellow-600">📅 Prévues ({coupuresPlanifiees.length})</p>
              </div>
              <div className="divide-y">
                {coupuresPlanifiees.slice(0, 5).map((c) => (
                  <div key={c.id_coupure} className="px-3 py-2 text-xs flex justify-between">
                    <span className="font-medium text-yellow-600">{c.quartier_nom}</span>
                    <span className="text-gray-500">{c.cause}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-semibold">🔔 Mes notifications ({notifications.length})</p>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">Aucune notification</div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id_notification} className="px-3 py-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${n.statut === 'lu' ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                        <span className="text-xs font-medium">
                          {n.type === 'delestage' ? '⚡ Délestage' : n.type === 'maintenance' ? '🔧 Maintenance' : 'ℹ️ Information'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(n.date_envoi).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 text-xs">{n.message}</p>
                    </div>
                    {n.statut !== 'lu' && (
                      <button onClick={() => handleMarquerLu(n.id_notification)} className="ml-2 text-blue-500 text-xs hover:underline">
                        Lire
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-400 pt-3 mt-3 border-t">
        © 2026 Gestion coupures - Madagascar
      </div>
    </main>

    {/* Modal Carte */}
    {showCarteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
            <h2 className="text-lg font-bold">🗺️ Carte des coupures</h2>
            <button onClick={() => setShowCarteModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div className="p-3">
            <CarteCitoyen />
          </div>
        </div>
      </div>
    )}

    {/* Modal Signalement */}
    {showSignalementModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg w-full max-w-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold">Signaler une panne</h2>
            <button onClick={() => setShowSignalementModal(false)} className="text-gray-400">✕</button>
          </div>
          <div className="space-y-2">
            <select value={signalement.id_quartier} onChange={(e) => setSignalement({...signalement, id_quartier: e.target.value})} className="w-full p-2 border rounded-lg text-xs">
              <option value="">Quartier</option>
              {quartiers.map(q => <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>)}
            </select>
            <select value={signalement.type_anomalie} onChange={(e) => setSignalement({...signalement, type_anomalie: e.target.value})} className="w-full p-2 border rounded-lg text-xs">
              <option value="coupure_totale">Coupure totale</option>
              <option value="coupure_intermittente">Intermittente</option>
              <option value="baisse_tension">Baisse tension</option>
              <option value="autre">Autre</option>
            </select>
            <textarea rows={2} value={signalement.description} onChange={(e) => setSignalement({...signalement, description: e.target.value})} className="w-full p-2 border rounded-lg text-xs" placeholder="Description..." />
            <button onClick={handleSignaler} className="w-full bg-red-600 text-white py-2 rounded-lg text-xs">Envoyer</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

export default DashboardCitoyen;
