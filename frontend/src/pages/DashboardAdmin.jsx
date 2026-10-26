import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../contexts/services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_utilisateurs: 0,
    citoyens: 0,
    gestionnaires: 0,
    analystes: 0,
    admins: 0,
    actifs: 0,
    suspendus: 0,
    total_coupures: 0,
    coupures_terminees: 0,
    coupures_en_cours: 0,
    coupures_planifiees: 0,
    duree_totale: '0h',
    total_signalements: 0,
    signalements_attend: 0,
    signalements_valides: 0,
    signalements_rejetes: 0,
    total_rapports: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Aucun token trouvé');
      return {};
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const getRoleName = (utilisateur) => {
    // Si le rôle est directement une chaîne
    if (typeof utilisateur.role === 'string' && utilisateur.role !== '') {
      return utilisateur.role.toLowerCase();
    }
    // Si le rôle est un objet avec nom_role
    if (utilisateur.role && utilisateur.role.nom_role) {
      return utilisateur.role.nom_role.toLowerCase();
    }
    // Si id_role existe (nombre)
    if (utilisateur.id_role) {
      const roleMapping = {
        62: 'citoyen',
        63: 'administrateur',
        64: 'gestionnaire_coupure',
        65: 'analyste'
      };
      return roleMapping[utilisateur.id_role] || 'inconnu';
    }
    // Si user.role est un nombre
    if (typeof utilisateur.role === 'number') {
      const roleMapping = {
        62: 'citoyen',
        63: 'administrateur',
        64: 'gestionnaire_coupure',
        65: 'analyste'
      };
      return roleMapping[utilisateur.role] || 'inconnu';
    }
    return 'citoyen';
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      console.log('Chargement des utilisateurs...');

      const usersRes = await api.get('/utilisateurs/', headers);
      let utilisateurs = usersRes.data || [];
      console.log('Utilisateurs reçus:', utilisateurs.length);

      let citoyens = 0;
      let gestionnaires = 0;
      let analystes = 0;
      let admins = 0;

      utilisateurs.forEach(utilisateur => {
        const roleName = getRoleName(utilisateur);
        if (roleName === 'citoyen') citoyens++;
        else if (roleName === 'gestionnaire_coupure') gestionnaires++;
        else if (roleName === 'analyste') analystes++;
        else if (roleName === 'administrateur') admins++;
      });

      const actifs = utilisateurs.filter(u => u.est_actif === true).length;

      // Coupures
      let coupures = [];
      try {
        const coupuresRes = await api.get('/coupures/', headers);
        coupures = coupuresRes.data || [];
        console.log('Coupures reçues:', coupures.length);
      } catch (e) {
        console.log('Erreur coupures:', e);
      }

      const terminees = coupures.filter(c => c.statut === 'termine').length;
      const enCours = coupures.filter(c => c.statut === 'en_cours').length;
      const planifiees = coupures.filter(c => c.statut === 'planifie').length;
      const dureeTotale = coupures.reduce((sum, c) => sum + (c.duree_minutes || 0), 0);

      // Signalements
      let signalements = [];
      try {
        const signalementsRes = await api.get('/signalements/', headers);
        signalements = signalementsRes.data || [];
        console.log('Signalements reçus:', signalements.length);
      } catch (e) {
        console.log('Erreur signalements:', e);
      }

      const enAttente = signalements.filter(s => s.statut === 'en_attente').length;
      const valides = signalements.filter(s => s.statut === 'confirme').length;
      const rejetes = signalements.filter(s => s.statut === 'rejete').length;

      // Rapports
      let rapports = [];
      try {
        const rapportsRes = await api.get('/rapports/', headers);
        rapports = rapportsRes.data || [];
        console.log('Rapports reçus:', rapports.length);
      } catch (e) {
        console.log('Erreur rapports:', e);
      }

      setStats({
        total_utilisateurs: utilisateurs.length,
        citoyens,
        gestionnaires,
        analystes,
        admins,
        actifs,
        suspendus: utilisateurs.length - actifs,
        total_coupures: coupures.length,
        coupures_terminees: terminees,
        coupures_en_cours: enCours,
        coupures_planifiees: planifiees,
        duree_totale: dureeTotale === 0 ? '0h' : `${Math.floor(dureeTotale / 60)}h ${dureeTotale % 60}m`,
        total_signalements: signalements.length,
        signalements_attend: enAttente,
        signalements_valides: valides,
        signalements_rejetes: rejetes,
        total_rapports: rapports.length
      });

    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data);

      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée');
        logout();
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Accès non autorisé. Vous devez être administrateur.');
        toast.error('Accès non autorisé');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est lancé (port 8000).');
        toast.error('Backend inaccessible');
      } else {
        setError('Erreur lors du chargement des données: ' + (error.response?.data?.detail || error.message));
        toast.error('Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const usersChartData = {
    labels: ['Citoyens', 'Gestionnaires', 'Analystes', 'Administrateurs'],
    datasets: [{
      label: 'Nombre',
      data: [stats.citoyens, stats.gestionnaires, stats.analystes, stats.admins],
      backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#8b5cf6'],
      borderRadius: 8
    }]
  };

  const coupuresChartData = {
    labels: ['Terminées', 'En cours', 'Planifiées'],
    datasets: [{
      label: 'Nombre',
      data: [stats.coupures_terminees, stats.coupures_en_cours, stats.coupures_planifiees],
      backgroundColor: ['#22c55e', '#f97316', '#3b82f6'],
      borderRadius: 8
    }]
  };

  const signalementsChartData = {
    labels: ['Validés', 'En attente', 'Rejetés'],
    datasets: [{
      data: [stats.signalements_valides, stats.signalements_attend, stats.signalements_rejetes],
      backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
      borderWidth: 0
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } },
    plugins: { legend: { position: 'top' } }
  };

  const doughnutOptions = { cutout: '60%', plugins: { legend: { position: 'bottom' } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Tableau de bord</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/admin" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/dashboard/admin') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-chart-line w-5"></i><span>Analyse</span>
          </Link>
          <Link to="/admin/utilisateurs" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/admin/utilisateurs') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-users w-5"></i><span>Utilisateurs</span>
          </Link>
          <Link to="/admin/logs" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/admin/logs') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-history w-5"></i><span>Journal d'activités</span>
          </Link>
          <Link to="/admin/parametres" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/admin/parametres') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-cog w-5"></i><span>Paramètres</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.nom || 'Admin'}</p>
              <p className="text-xs text-purple-600">Administrateur</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Administration du système</h1>
          <p className="text-gray-500 text-sm">Supervision et statistiques globales.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total utilisateurs</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_utilisateurs}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-blue-600 text-sm">Citoyens</p>
            <p className="text-2xl font-bold text-blue-600">{stats.citoyens}</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-orange-600 text-sm">Gestionnaires</p>
            <p className="text-2xl font-bold text-orange-600">{stats.gestionnaires}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-green-600 text-sm">Analystes</p>
            <p className="text-2xl font-bold text-green-600">{stats.analystes}</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-purple-600 text-sm">Administrateurs</p>
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Total coupures</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_coupures}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-green-600 text-sm">Résolues</p>
            <p className="text-2xl font-bold text-green-600">{stats.coupures_terminees}</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-orange-600 text-sm">En cours</p>
            <p className="text-2xl font-bold text-orange-600">{stats.coupures_en_cours}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4 text-center">
            <p className="text-blue-600 text-sm">Durée totale</p>
            <p className="text-xl font-bold text-blue-600">{stats.duree_totale}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div><p className="text-gray-500 text-xs">Signalements</p><p className="text-xl font-bold">{stats.total_signalements}</p></div>
              <div><p className="text-green-600 text-xs">Validés</p><p className="text-lg font-bold text-green-600">{stats.signalements_valides}</p></div>
              <div><p className="text-orange-600 text-xs">En attente</p><p className="text-lg font-bold text-orange-600">{stats.signalements_attend}</p></div>
              <div><p className="text-red-600 text-xs">Rejetés</p><p className="text-lg font-bold text-red-600">{stats.signalements_rejetes}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-gray-500 text-sm">📄 Rapports générés</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_rapports}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">📊 Utilisateurs par rôle</h3>
            <Bar data={usersChartData} options={barOptions} height={200} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">⚡ Statut des coupures</h3>
            <Bar data={coupuresChartData} options={barOptions} height={200} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm w-full">📋 Signalements</h3>
            <div className="w-40 h-40"><Doughnut data={signalementsChartData} options={doughnutOptions} /></div>
            <div className="flex gap-3 mt-3 text-xs">
              <div><span className="text-green-600">●</span> Validés {stats.signalements_valides}</div>
              <div><span className="text-orange-600">●</span> Attente {stats.signalements_attend}</div>
              <div><span className="text-red-600">●</span> Rejetés {stats.signalements_rejetes}</div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;
