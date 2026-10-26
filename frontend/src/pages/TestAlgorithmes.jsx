import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { algorithmeService } from '../services/algorithmeService';
import toast from 'react-hot-toast';

function TestAlgorithmes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prediction');
  const [prediction, setPrediction] = useState(null);
  const [chemins, setChemins] = useState(null);
  const [delestage, setDelestage] = useState(null);
  const [priorites, setPriorites] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [source, setSource] = useState('86');
  const [destination, setDestination] = useState('100');
  const [puissance, setPuissance] = useState('150');

  useEffect(() => {
    chargerScenarios();
    chargerPriorites();
  }, []);

  const chargerScenarios = async () => {
    const data = await algorithmeService.getScenarios();
    if (data) setScenarios(data);
  };

  const chargerPriorites = async () => {
    const data = await algorithmeService.getPrioriteQuartiers();
    if (data) setPriorites(data);
  };

  const handlePrediction = async () => {
    setLoading(true);
    const data = await algorithmeService.getPrediction(85, 6, 19);
    setPrediction(data);
    setLoading(false);
  };

  const handleChemin = async () => {
    setLoading(true);
    const data = await algorithmeService.getCheminOptimal(parseInt(source), parseInt(destination));
    setChemins(data);
    setLoading(false);
  };

  const handleDelestage = async () => {
    setLoading(true);
    const data = await algorithmeService.planifierDelestage(parseFloat(puissance));
    setDelestage(data);
    setLoading(false);
  };

  const handleAllTests = async () => {
    setLoading(true);
    const data = await algorithmeService.getAllTests();
    console.log('Tous les tests:', data);
    toast.success('Tests exécutés - Voir console');
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-microchip text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Test Algorithmes</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <button onClick={() => setActiveTab('prediction')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'prediction' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-chart-line w-5"></i><span>Prédiction</span>
          </button>
          <button onClick={() => setActiveTab('dijkstra')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'dijkstra' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-road w-5"></i><span>Dijkstra</span>
          </button>
          <button onClick={() => setActiveTab('glouton')} className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition ${activeTab === 'glouton' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            <i className="fas fa-cut w-5"></i><span>Glouton</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.nom || 'Admin'}</p>
              <p className="text-xs text-purple-600">Tests</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-red-500">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Onglet Prédiction */}
        {activeTab === 'prediction' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Test Prédiction</h1>
              <p className="text-gray-500 text-sm">Algorithme d'arbre de décision</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <button onClick={handlePrediction} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Tester la prédiction (85 MW, 6 pannes, 19h)
              </button>
            </div>

            {prediction && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Résultat</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500">Consommation:</span> <span className="font-bold">{prediction.consommation} MW</span></div>
                  <div><span className="text-gray-500">Historique pannes:</span> <span className="font-bold">{prediction.historique_pannes}</span></div>
                  <div><span className="text-gray-500">Heure:</span> <span className="font-bold">{prediction.heure}h</span></div>
                  <div><span className="text-gray-500">Risque:</span> <span className={`font-bold text-2xl ${prediction.risque >= 50 ? 'text-red-600' : 'text-green-600'}`}>{prediction.risque}%</span></div>
                  <div><span className="text-gray-500">Niveau:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${prediction.niveau === 'eleve' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{prediction.niveau}</span></div>
                </div>
              </div>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Scénarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((s, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h3 className="font-bold">{s.scenario}</h3>
                    <div className="text-sm text-gray-500">Consommation: {s.consommation} MW | Pannes: {s.pannes} | Heure: {s.heure}h</div>
                    <div className="mt-2"><span className="font-bold">Risque:</span> <span className={s.risque >= 50 ? 'text-red-600' : 'text-green-600'}>{s.risque}%</span></div>
                    <div><span className="font-bold">Niveau:</span> {s.niveau}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Dijkstra */}
        {activeTab === 'dijkstra' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Test Dijkstra</h1>
              <p className="text-gray-500 text-sm">Recherche du chemin optimal dans le réseau</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quartier source</label>
                  <input type="number" value={source} onChange={(e) => setSource(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quartier destination</label>
                  <input type="number" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="flex items-end">
                  <button onClick={handleChemin} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Trouver le chemin</button>
                </div>
              </div>
            </div>

            {chemins && chemins.chemin_noms && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Résultat</h2>
                <div className="mb-4">
                  <span className="text-gray-500">De:</span> <span className="font-bold">{chemins.source_nom} ({chemins.source})</span>
                  <span className="mx-2">→</span>
                  <span className="text-gray-500">À:</span> <span className="font-bold">{chemins.destination_nom} ({chemins.destination})</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium mb-2">Chemin optimal:</p>
                  <div className="flex flex-wrap gap-2">
                    {chemins.chemin_noms.map((nom, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {nom}
                        {idx < chemins.chemin_noms.length - 1 && <span className="mx-1">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500">Distance:</span> <span className="font-bold">{chemins.distance_km} km</span></div>
                  <div><span className="text-gray-500">Étapes:</span> <span className="font-bold">{chemins.nb_etapes}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Glouton */}
        {activeTab === 'glouton' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Test Glouton</h1>
              <p className="text-gray-500 text-sm">Optimisation du délestage</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Puissance disponible (MW)</label>
                  <input type="number" value={puissance} onChange={(e) => setPuissance(e.target.value)} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="flex items-end">
                  <button onClick={handleDelestage} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Planifier délestage</button>
                </div>
              </div>
            </div>

            {delestage && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">Résultat</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div><span className="text-gray-500">Puissance disponible:</span> <span className="font-bold">{delestage.puissance_disponible} MW</span></div>
                  <div><span className="text-gray-500">Puissance coupée:</span> <span className="font-bold text-red-600">{delestage.puissance_coupee} MW</span></div>
                  <div><span className="text-gray-500">Pourcentage coupé:</span> <span className="font-bold">{delestage.pourcentage_coupe}%</span></div>
                </div>
                {delestage.quartiers_a_couper && delestage.quartiers_a_couper.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Quartiers à délester:</p>
                    <div className="space-y-2">
                      {delestage.quartiers_a_couper.map((q, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
                          <span className="font-medium">{q.nom_quartier}</span>
                          <span className="text-sm">Consommation: {q.consommation} MW</span>
                          <span className="text-sm">Priorité: {q.priorite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Priorités des quartiers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Priorité des quartiers</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Quartier</th>
                      <th className="px-4 py-2">Priorité</th>
                      <th className="px-4 py-2">Signification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorites.map((p) => (
                      <tr key={p.id_quartier} className="border-b">
                        <td className="px-4 py-2">{p.id_quartier}</td>
                        <td className="px-4 py-2">{p.nom_quartier}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.priorite <= 2 ? 'bg-red-100 text-red-700' : p.priorite >= 4 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.priorite}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{p.signification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bouton test complet */}
        <div className="mt-6 text-center">
          <button onClick={handleAllTests} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Exécuter tous les tests
          </button>
        </div>
      </main>
    </div>
  );
}

export default TestAlgorithmes;
