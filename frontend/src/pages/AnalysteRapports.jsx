import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexts/services/api';
import toast from 'react-hot-toast';

function AnalysteRapports() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rapports, setRapports] = useState([]);
  const [coupures, setCoupures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRapport, setNewRapport] = useState({
    titre: '',
    contenu: '',
    type_rapport: 'analyse',
    id_coupure: ''
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [rapportsRes, coupuresRes] = await Promise.all([
        api.get('/rapports/', getAuthHeaders()),
        api.get('/coupures/', getAuthHeaders())
      ]);
      setRapports(rapportsRes.data || []);
      setCoupures(coupuresRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenererRapport = async () => {
    if (!newRapport.titre || !newRapport.contenu) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const data = {
        titre: newRapport.titre,
        contenu: newRapport.contenu,
        type_rapport: newRapport.type_rapport,
        id_coupure: newRapport.id_coupure ? parseInt(newRapport.id_coupure) : null
      };

      await api.post('/rapports/', data, getAuthHeaders());
      toast.success('Rapport généré avec succès');
      setShowModal(false);
      setNewRapport({ titre: '', contenu: '', type_rapport: 'analyse', id_coupure: '' });
      chargerDonnees();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handlePublier = async (id) => {
    try {
      const response = await api.put(`/rapports/${id}/publier`, {}, getAuthHeaders());
      console.log('Réponse publication:', response.data);

      if (response.data.statut === 'publie') {
        toast.success('Rapport publié avec succès');
        // Mettre à jour localement le statut
        setRapports(rapports.map(r =>
          r.id_rapport === id ? { ...r, statut: 'publie' } : r
        ));
      } else {
        toast.success('Rapport publié');
      }
      chargerDonnees(); // Recharger pour être sûr
    } catch (error) {
      console.error('Erreur publication:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la publication');
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await api.delete(`/rapports/${id}`, getAuthHeaders());
        toast.success('Rapport supprimé');
        chargerDonnees();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleExporter = (rapport) => {
    // Formater la date
    const date = new Date(rapport.date_creation);
    const dateFormatee = date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Créer le contenu du rapport
    const contenu = `================================================================================
                         RAPPORT D'ANALYSE
================================================================================

Titre: ${rapport.titre}
Date de création: ${dateFormatee}
Type: ${getTypeLabel(rapport.type_rapport)}
Statut: ${rapport.statut === 'publie' ? 'PUBLIÉ' : 'BROUILLON'}
Auteur: ${user?.nom || 'Analyste'}

================================================================================
CONTENU DU RAPPORT
================================================================================

${rapport.contenu}

================================================================================
Fin du rapport - Plateforme de gestion des coupures électriques
Madagascar
================================================================================`;

    // Créer et télécharger le fichier
    const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${rapport.id_rapport}_${date.toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Rapport exporté avec succès');
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'analyse': return 'Analyse';
      case 'mensuel': return 'Mensuel';
      case 'prediction': return 'Prédiction';
      case 'incident': return 'Incident';
      default: return 'Analyse';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'analyse': return 'bg-blue-100 text-blue-700';
      case 'mensuel': return 'bg-green-100 text-green-700';
      case 'prediction': return 'bg-purple-100 text-purple-700';
      case 'incident': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Analyse réseau</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/analyste" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-chart-line w-5"></i><span>Analyse</span>
          </Link>
          <Link to="/analyste/predictions" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100">
            <i className="fas fa-chart-simple w-5"></i><span>Prédictions</span>
          </Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm font-medium bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg">
            <i className="fas fa-file-alt w-5"></i><span>Rapports</span>
          </div>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rapports d'analyse</h1>
            <p className="text-gray-500 text-sm">Générez, publiez et exportez vos rapports</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Nouveau rapport
          </button>
        </div>

        {rapports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <i className="fas fa-file-alt text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Aucun rapport pour le moment</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 hover:underline">
              Créer votre premier rapport
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rapports.map((r) => (
              <div key={r.id_rapport} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{r.titre}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(r.type_rapport)}`}>
                          {getTypeLabel(r.type_rapport)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(r.date_creation).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.statut === 'publie' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.statut === 'publie' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSupprimer(r.id_rapport)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mt-3 line-clamp-3">{r.contenu}</p>
                  <div className="flex gap-3 mt-4 pt-3 border-t">
                    {r.statut !== 'publie' && (
                      <button
                        onClick={() => handlePublier(r.id_rapport)}
                        className="text-green-600 text-sm hover:underline flex items-center gap-1"
                      >
                        <i className="fas fa-check-circle"></i> Publier
                      </button>
                    )}
                    <button
                      onClick={() => handleExporter(r)}
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <i className="fas fa-download"></i> Exporter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Nouveau Rapport */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nouveau rapport</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={newRapport.titre}
                    onChange={(e) => setNewRapport({...newRapport, titre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: Rapport mensuel Mai 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
                  <select
                    value={newRapport.type_rapport}
                    onChange={(e) => setNewRapport({...newRapport, type_rapport: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="analyse">Analyse</option>
                    <option value="mensuel">Mensuel</option>
                    <option value="prediction">Prédiction</option>
                    <option value="incident">Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupure liée (optionnel)</label>
                  <select
                    value={newRapport.id_coupure}
                    onChange={(e) => setNewRapport({...newRapport, id_coupure: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Aucune coupure liée</option>
                    {coupures.map(c => (
                      <option key={c.id_coupure} value={c.id_coupure}>
                        Coupure #{c.id_coupure} - {c.cause || 'Non spécifiée'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    rows={6}
                    value={newRapport.contenu}
                    onChange={(e) => setNewRapport({...newRapport, contenu: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Rédigez le contenu de votre rapport..."
                  />
                </div>

                <button
                  onClick={handleGenererRapport}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Générer le rapport
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AnalysteRapports;
