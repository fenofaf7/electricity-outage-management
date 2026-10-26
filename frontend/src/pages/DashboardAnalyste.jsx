import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { statistiqueService } from '../services/statistiqueService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function DashboardAnalyste() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    globales: {},
    topQuartiers: [],
    evolution: { labels: [], nombre: [], duree: [] },
    repartition: { labels: [], data: [] },
    consommation: { total: 0, pic: 0, heurePointe: '' },
    risque: { niveau: 'Modéré', pourcentage: 15 }
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [globales, topQuartiers, evolution, repartition, consommation, risque] = await Promise.all([
        statistiqueService.getGlobales(),
        statistiqueService.getTopQuartiers(10),
        statistiqueService.getEvolution(),
        statistiqueService.getRepartitionParType(),
        statistiqueService.getConsommation(),
        statistiqueService.getRisqueDelestage()
      ]);
      setStats({ globales, topQuartiers, evolution, repartition, consommation, risque });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const evolutionData = {
    labels: stats.evolution.labels.length ? stats.evolution.labels : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    datasets: [
      { label: 'Nombre de coupures', data: stats.evolution.nombre.length ? stats.evolution.nombre : [12, 15, 18, 22, 19, 24, 28, 26], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4 },
      { label: 'Durée (heures)', data: stats.evolution.duree.length ? stats.evolution.duree : [8, 11, 14, 18, 16, 22, 26, 24], borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.05)', fill: true, tension: 0.4 }
    ]
  };

  const causesData = {
    labels: stats.repartition.labels.length ? stats.repartition.labels : ['Programmée', 'Imprévue', 'Délestage'],
    datasets: [{ data: stats.repartition.data.length ? stats.repartition.data : [10, 8, 6], backgroundColor: ['#3b82f6', '#ef4444', '#f97316'], borderWidth: 0 }]
  };

  const topQuartiersData = {
    labels: stats.topQuartiers.map(q => q.nom),
    datasets: [{ label: 'Coupures', data: stats.topQuartiers.map(q => q.nombre), backgroundColor: '#3b82f6', borderRadius: 6 }]
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
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Analyse réseau</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{user?.nom}</p>
        </div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/analyste" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/dashboard/analyste') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-chart-line w-5"></i><span>Analyse</span>
          </Link>
          <Link to="/analyste/predictions" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/analyste/predictions') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-chart-simple w-5"></i><span>Prédictions</span>
          </Link>
          <Link to="/analyste/rapports" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/analyste/rapports') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-file-alt w-5"></i><span>Rapports</span>
          </Link>
          <Link to="/analyste/carte-reseau" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/analyste/carte-reseau') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-map w-5"></i><span>Carte du réseau</span>
          </Link>
          <Link to="/analyste/journal" className={`flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg mx-2 transition ${isActive('/analyste/journal') ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-history w-5"></i><span>Journal d'activités</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.nom || 'Analyste'}</p>
              <p className="text-xs text-green-600">Analyste</p>
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
          <h1 className="text-2xl font-bold text-gray-800">Analyse du réseau</h1>
          <p className="text-gray-500 text-sm">Vue globale et analyses approfondies de l'état du réseau électrique.</p>
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total coupures</p>
            <p className="text-2xl font-bold text-gray-800">{stats.globales.total_coupures || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Durée totale</p>
            <p className="text-2xl font-bold text-gray-800">{stats.globales.duree_totale || '0h'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Quartiers touchés</p>
            <p className="text-2xl font-bold text-gray-800">{stats.globales.quartiers_touches || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Risque délestage</p>
            <p className="text-xl font-bold text-yellow-600">{stats.risque.niveau} ({stats.risque.pourcentage}%)</p>
          </div>
        </div>

        {/* Graphique évolution */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">📈 Évolution des coupures (30 derniers jours)</h2>
          <Line data={evolutionData} options={{ responsive: true, maintainAspectRatio: true }} height={80} />
        </div>

        {/* Graphiques 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🥧 Répartition par type</h2>
            <div className="w-64 h-64 mx-auto">
              <Doughnut data={causesData} options={{ cutout: '60%' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🏆 Top quartiers touchés</h2>
            <Bar data={topQuartiersData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} height={200} />
          </div>
        </div>

        {/* Consommation */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">⚡ Consommation électrique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">Consommation totale</p><p className="text-2xl font-bold text-blue-600">{stats.consommation.total || 0} MW</p></div>
            <div className="bg-orange-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">Pic de consommation</p><p className="text-2xl font-bold text-orange-600">{stats.consommation.pic || 0} MW</p></div>
            <div className="bg-green-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">Heure de pointe</p><p className="text-xl font-bold text-green-600">{stats.consommation.heurePointe || 'N/A'}</p></div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>
    </div>
  );
}

export default DashboardAnalyste;
