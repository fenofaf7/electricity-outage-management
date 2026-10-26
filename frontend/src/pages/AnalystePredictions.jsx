import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexts/services/api';
import toast from 'react-hot-toast';
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
import { Bar } from 'react-chartjs-2';

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

function AnalystePredictions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quartiers, setQuartiers] = useState([]);
  const [predictionsHistory, setPredictionsHistory] = useState([]);
  const [algoPrediction, setAlgoPrediction] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [priorites, setPriorites] = useState([]);
  const [activeTab, setActiveTab] = useState('predictions');
  const [newPrediction, setNewPrediction] = useState({
    id_quartier: '',
    consommation: 70,
    historique_pannes: 3,
    heure: 19
  });

  useEffect(() => {
    chargerQuartiers();
    chargerScenarios();
    chargerPriorites();
    chargerHistoriquePredictions();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { 'Authorization': `Bearer ${token}` }
    };
  };

  const chargerQuartiers = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/quartiers/', headers);
      setQuartiers(response.data || []);
    } catch (error) {
      console.error('Erreur chargement quartiers:', error);
    }
  };

  const chargerScenarios = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/test/scenarios', headers);
      setScenarios(response.data || []);
    } catch (error) {
      console.error('Erreur chargement scenarios:', error);
    }
  };

  const chargerPriorites = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/test/priorite-quartier', headers);
      setPriorites(response.data || []);
    } catch (error) {
      console.error('Erreur chargement priorites:', error);
    }
  };

  const chargerHistoriquePredictions = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/test/predictions-multiples', headers);
      setPredictionsHistory(response.data || []);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const handleCalculerRisque = async () => {
    if (!newPrediction.id_quartier) {
      toast.error('Sélectionnez un quartier');
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const quartier = quartiers.find(q => q.id_quartier === parseInt(newPrediction.id_quartier));

      const response = await api.get(
        `/test/prediction/${newPrediction.consommation}/${newPrediction.historique_pannes}/${newPrediction.heure}`,
        headers
      );

      setAlgoPrediction({
        ...response.data,
        quartier: quartier,
        quartier_id: newPrediction.id_quartier
      });
      toast.success('Risque calculé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du calcul');
    } finally {
      setLoading(false);
    }
  };

  const handleSauvegarderPrediction = async () => {
    if (!algoPrediction) {
      toast.error('Calculez d\'abord le risque');
      return;
    }

    try {
      // Sauvegarder localement (car pas d'API de sauvegarde)
      const newEntry = {
        id_prediction: Date.now(),
        id_quartier: parseInt(newPrediction.id_quartier),
        nom_quartier: algoPrediction.quartier?.nom_quartier,
        probabilite: algoPrediction.risque,
        niveau_risque: algoPrediction.niveau,
        date_prediction: new Date().toISOString(),
        horizon: '24h'
      };

      setPredictionsHistory(prev => [newEntry, ...prev]);
      toast.success('Prédiction sauvegardée localement');

      // Réinitialiser
      setAlgoPrediction(null);
      setNewPrediction({
        id_quartier: '',
        consommation: 70,
        historique_pannes: 3,
        heure: 19
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getNiveauRisque = (prob) => {
    if (prob >= 70) return { text: 'Élevé', color: 'red', bg: 'bg-red-100 text-red-700' };
    if (prob >= 50) return { text: 'Moyen', color: 'orange', bg: 'bg-orange-100 text-orange-700' };
    return { text: 'Faible', color: 'green', bg: 'bg-green-100 text-green-700' };
  };

  const chartData = {
    labels: predictionsHistory.slice(0, 10).map(p => p.nom_quartier || `Q${p.id_quartier}`),
    datasets: [{
      label: 'Probabilité de risque (%)',
      data: predictionsHistory.slice(0, 10).map(p => p.probabilite),
      backgroundColor: predictionsHistory.slice(0, 10).map(p =>
        p.probabilite >= 70 ? '#ef4444' : p.probabilite >= 50 ? '#f97316' : '#22c55e'
      ),
      borderRadius: 8
    }]
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && quartiers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Analyse réseau</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/analyste" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-chart-line w-5"></i><span>Analyse</span>
          </Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm font-medium bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg">
            <i className="fas fa-chart-simple w-5"></i><span>Prédictions</span>
          </div>
          <Link to="/analyste/rapports" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-file-alt w-5"></i><span>Rapports</span>
          </Link>
          <Link to="/analyste/carte-reseau" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-map w-5"></i><span>Carte du réseau</span>
          </Link>
          <Link to="/analyste/journal" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-history w-5"></i><span>Journal d'activités</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.nom || 'Analyste'}</p>
              <p className="text-xs text-green-600">Analyste</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => setActiveTab('predictions')} className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'predictions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            📊 Prédictions
          </button>
          <button onClick={() => setActiveTab('scenarios')} className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'scenarios' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            🎯 Scénarios
          </button>
          <button onClick={() => setActiveTab('priorites')} className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'priorites' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            📋 Priorités
          </button>
        </div>

        {/* Onglet Prédictions */}
        {activeTab === 'predictions' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Prédictions</h1>
              <p className="text-gray-500">Anticipez les risques de coupure avec l'algorithme d'arbre de décision</p>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4">🌳 Arbre de décision</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quartier</label>
                  <select
                    value={newPrediction.id_quartier}
                    onChange={(e) => setNewPrediction({...newPrediction, id_quartier: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Sélectionner</option>
                    {quartiers.map(q => <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consommation (MW)</label>
                  <input
                    type="number"
                    value={newPrediction.consommation}
                    onChange={(e) => setNewPrediction({...newPrediction, consommation: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Historique pannes (30j)</label>
                  <input
                    type="number"
                    value={newPrediction.historique_pannes}
                    onChange={(e) => setNewPrediction({...newPrediction, historique_pannes: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heure</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newPrediction.heure}
                    onChange={(e) => setNewPrediction({...newPrediction, heure: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleCalculerRisque}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Calculer le risque
                </button>
                {algoPrediction && (
                  <button
                    onClick={handleSauvegarderPrediction}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Sauvegarder la prédiction
                  </button>
                )}
              </div>
            </div>

            {/* Résultat */}
            {algoPrediction && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">🎯 Résultat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">Quartier</p>
                    <p className="text-xl font-bold">{algoPrediction.quartier?.nom_quartier}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Consommation:</span>
                      <span>{algoPrediction.consommation} MW</span>
                      <span className="text-gray-500">Historique pannes:</span>
                      <span>{algoPrediction.historique_pannes}</span>
                      <span className="text-gray-500">Heure:</span>
                      <span>{algoPrediction.heure}h</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Risque de coupure</p>
                    <p className={`text-5xl font-bold ${algoPrediction.risque >= 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {algoPrediction.risque}%
                    </p>
                    <p className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      algoPrediction.niveau === 'eleve' ? 'bg-red-100 text-red-700' :
                      algoPrediction.niveau === 'moyen' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Niveau {algoPrediction.niveau === 'eleve' ? 'Élevé' : algoPrediction.niveau === 'moyen' ? 'Moyen' : 'Faible'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Graphique historique */}
            {predictionsHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">📊 Historique des prédictions</h2>
                <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} height={250} />
              </div>
            )}

            {/* Liste historique */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <h2 className="font-semibold text-gray-800 px-6 py-4 border-b">📋 Dernières prédictions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Quartier</th>
                      <th className="px-6 py-3">Risque</th>
                      <th className="px-6 py-3">Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionsHistory.slice(0, 10).map(p => {
                      const risque = getNiveauRisque(p.probabilite);
                      return (
                        <tr key={p.id_prediction} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm">{new Date(p.date_prediction).toLocaleString()}</td>
                          <td className="px-6 py-3 text-sm font-medium">{p.nom_quartier}</td>
                          <td className="px-6 py-3 text-sm font-bold">{p.probabilite}%</td>
                          <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs ${risque.bg}`}>{risque.text}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Onglet Scénarios */}
        {activeTab === 'scenarios' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Scénarios de prédiction</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((s, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-bold text-lg mb-2">{s.scenario}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <span className="text-gray-500">Consommation:</span>
                    <span>{s.consommation} MW</span>
                    <span className="text-gray-500">Pannes:</span>
                    <span>{s.pannes}</span>
                    <span className="text-gray-500">Heure:</span>
                    <span>{s.heure}h</span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-500">Risque:</span>
                    <span className={`text-2xl font-bold ml-2 ${s.risque >= 50 ? 'text-red-600' : 'text-green-600'}`}>{s.risque}%</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${s.niveau === 'eleve' ? 'bg-red-100 text-red-700' : s.niveau === 'moyen' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {s.niveau === 'eleve' ? 'Élevé' : s.niveau === 'moyen' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Priorités */}
        {activeTab === 'priorites' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Priorité des quartiers</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Quartier</th>
                    <th className="px-6 py-3">Priorité</th>
                    <th className="px-6 py-3">Signification</th>
                  </tr>
                </thead>
                <tbody>
                  {priorites.map((p) => (
                    <tr key={p.id_quartier} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{p.id_quartier}</td>
                      <td className="px-6 py-3 font-medium">{p.nom_quartier}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.priorite <= 2 ? 'bg-red-100 text-red-700' :
                          p.priorite >= 4 ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.priorite}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{p.signification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AnalystePredictions;
