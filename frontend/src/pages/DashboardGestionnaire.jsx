import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import SignalementsTab from './gestionnaire/SignalementsTab';
import CoupuresTab from './gestionnaire/CoupuresTab';
import NotificationsTab from './gestionnaire/NotificationsTab';
import StatistiquesTab from './gestionnaire/StatistiquesTab';

function DashboardGestionnaire() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('signalements');
  const [signalementsEnAttente, setSignalementsEnAttente] = useState([]);
  const [coupuresEnCours, setCoupuresEnCours] = useState([]);
  const [coupuresResolues, setCoupuresResolues] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total_signalements: 0,
    en_attente: 0,
    valides: 0,
    rejetes: 0,
    total_coupures: 0,
    coupures_planifiees: 0,
    coupures_en_cours: 0,
    coupures_resolues: 0,
    notifications_envoyees: 0,
    notifications_lues: 0,
    notifications_non_lues: 0
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

      // Quartiers
      const quartiersRes = await api.get('/quartiers/', headers);
      const quartiersList = quartiersRes.data || [];
      setQuartiers(quartiersList);

      const quartierMap = {};
      quartiersList.forEach(q => { quartierMap[q.id_quartier] = q.nom_quartier; });

      // Signalements
      const signalementsRes = await api.get('/signalements/', headers);
      const allSignalements = signalementsRes.data || [];

      console.log('Signalements reçus:', allSignalements);
      console.log('Premier signalement:', allSignalements[0]);

      // ✅ UNE SEULE déclaration de enAttente (pas deux)
      const enAttente = allSignalements
        .filter(s => s.statut === 'en_attente')
        .map(s => ({
          id_signalement: s.id_signalement || s.id,
          id_quartier: s.id_quartier,
          quartier_nom: quartierMap[s.id_quartier] || `Quartier #${s.id_quartier}`,
          description: s.description,
          date_signalement: s.date_signalement,
          statut: s.statut
        }));

      setSignalementsEnAttente(enAttente);
      console.log('Signalements en attente formatés:', enAttente);

      // Coupures
      const coupuresRes = await api.get('/coupures/', headers);
      const allCoupures = coupuresRes.data || [];

      const enCours = allCoupures
        .filter(c => c.statut === 'en_cours')
        .map(c => ({
          ...c,
          quartier_nom: quartierMap[c.id_quartier] || `Quartier #${c.id_quartier}`
        }));

      const resolues = allCoupures
        .filter(c => c.statut === 'termine')
        .map(c => ({
          ...c,
          quartier_nom: quartierMap[c.id_quartier] || `Quartier #${c.id_quartier}`
        }));

      setCoupuresEnCours(enCours);
      setCoupuresResolues(resolues);

      // Notifications
      let notificationsData = [];
      try {
        const notifsRes = await api.get('/notifications/', headers);
        notificationsData = notifsRes.data || [];
        setNotifications(notificationsData);
      } catch (e) {
        console.log('Erreur notifications:', e);
      }

      const valides = allSignalements.filter(s => s.statut === 'confirme').length;
      const rejetes = allSignalements.filter(s => s.statut === 'rejete').length;
      const planifiees = allCoupures.filter(c => c.type_coupure === 'programmee' && c.statut !== 'termine').length;
      const notifsEnvoyees = notificationsData.length;
      const notifsLues = notificationsData.filter(n => n.est_lu === true).length;
      const notifsNonLues = notificationsData.filter(n => n.est_lu === false).length;

      setStats({
        total_signalements: allSignalements.length,
        en_attente: enAttente.length,
        valides: valides,
        rejetes: rejetes,
        total_coupures: allCoupures.length,
        coupures_planifiees: planifiees,
        coupures_en_cours: enCours.length,
        coupures_resolues: resolues.length,
        notifications_envoyees: notifsEnvoyees,
        notifications_lues: notifsLues,
        notifications_non_lues: notifsNonLues
      });

    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée');
        logout();
        navigate('/login');
      } else {
        toast.error('Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  // Ajoute cette fonction dans le composant DashboardGestionnaire, avant les fonctions existantes

  const handleCreerCoupure = async (newCoupure) => {
    if (!newCoupure.quartier_id || !newCoupure.date_debut || !newCoupure.cause) {
      toast.error('Champs obligatoires');
      return;
    }

    try {
      const headers = getAuthHeaders();
      await api.post('/coupures/', {
        id_quartier: parseInt(newCoupure.quartier_id),
        date_debut: newCoupure.date_debut,
        date_fin: newCoupure.date_fin || null,
        type_coupure: newCoupure.type_coupure,
        cause: newCoupure.cause,
        statut: 'planifie'
      }, headers);
      toast.success('Coupure créée');
      chargerDonnees(); // Recharge les données
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
  };
  // Ajoute cette fonction à côté des autres (après handleCreerCoupure par exemple)

  const handleResoudreCoupure = async (id) => {
    if (!id) {
      toast.error('ID de coupure invalide');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await api.put(`/coupures/${id}/resoudre`, {
        statut: 'termine',
        date_fin: new Date().toISOString()
      }, headers);

      console.log('Réponse résolution:', response.data);
      toast.success('Coupure résolue');
      chargerDonnees(); // Recharge les données
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la résolution');
    }
  };

  const handleValider = async (id) => {
    try {
      const response = await api.put(`/signalements/${id}/valider`, {}, getAuthHeaders());
      console.log('Réponse validation:', response.data);
      toast.success('Signalement validé et coupure créée');
      chargerDonnees(); // Recharge les données
    } catch (error) {
      console.error('Erreur validation:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la validation');
    }
  };


  const handleRejeter = async (id) => {
    try {
      const response = await api.put(`/signalements/${id}/rejeter`, {}, getAuthHeaders());
      console.log('Réponse rejet:', response.data);
      toast.success('Signalement rejeté');
      chargerDonnees(); // Recharge les données
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du rejet');
    }
  };

  const handleMarquerLu = async (notificationId) => {
    try {
      const headers = getAuthHeaders();
      await api.put(`/notifications/${notificationId}/lire`, {}, headers);
      toast.success('Notification marquée comme lue');
      chargerDonnees(); // Recharge les données
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-bolt text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Gestion Coupures</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <button onClick={() => setActiveTab('signalements')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'signalements' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-clipboard-list w-5"></i><span>Signalements</span>
          </button>
          <button onClick={() => setActiveTab('coupures')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'coupures' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-bolt w-5"></i><span>Coupures</span>
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-bell w-5"></i><span>Notifications</span>
          </button>
          <button onClick={() => setActiveTab('statistiques')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'statistiques' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-chart-line w-5"></i><span>Statistiques</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.nom || 'Gestionnaire'}</p>
              <p className="text-xs text-orange-600">Gestionnaire</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des coupures et signalements</h1>
          <p className="text-gray-500 text-sm">Gérez les signalements citoyens, planifiez les coupures et envoyez des notifications.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Signalements</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_signalements}</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-4 text-center border-l-4 border-orange-500">
            <p className="text-orange-600 text-sm">En attente</p>
            <p className="text-2xl font-bold text-orange-600">{stats.en_attente}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500">
            <p className="text-red-600 text-sm">Coupures en cours</p>
            <p className="text-2xl font-bold text-red-600">{stats.coupures_en_cours}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
            <p className="text-green-600 text-sm">Coupures résolues</p>
            <p className="text-2xl font-bold text-green-600">{stats.coupures_resolues}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
            <p className="text-blue-600 text-sm">Notifications</p>
            <p className="text-2xl font-bold text-blue-600">{stats.notifications_envoyees}</p>
          </div>
        </div>

        {/* Onglets séparés */}
        {activeTab === 'signalements' && (
          <SignalementsTab
            signalements={signalementsEnAttente}
            onValider={handleValider}
            onRejeter={handleRejeter}
          />
        )}

        {activeTab === 'coupures' && (
          <CoupuresTab
            coupuresEnCours={coupuresEnCours}
            coupuresResolues={coupuresResolues}
            quartiers={quartiers}
            onCreerCoupure={handleCreerCoupure}
            onResoudreCoupure={handleResoudreCoupure}
            getAuthHeaders={getAuthHeaders}
            chargerDonnees={chargerDonnees}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            stats={stats}
            quartiers={quartiers}
            notifications={notifications}
            onEnvoyerNotification={async (data) => {
              await api.post('/notifications/', {
                id_quartier: parseInt(data.quartier_id),
                titre: data.titre,
                message: data.message,
                type: data.type
              }, getAuthHeaders());
              toast.success('Notification envoyée');
              chargerDonnees();
            }}
            onMarquerLu={handleMarquerLu}
            getAuthHeaders={getAuthHeaders}
            chargerDonnees={chargerDonnees}
          />
        )}

        {activeTab === 'statistiques' && (
          <StatistiquesTab stats={stats} />
        )}

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>
    </div>
  );
}

export default DashboardGestionnaire;
