import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function AdminLogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    chargerLogs();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const getActionLabel = (action) => {
    const actionMap = {
      'CONNEXION': 'Connexion',
      'DECONNEXION': 'Déconnexion',
      'MODIFICATION': 'Modification',
      'SUPPRESSION': 'Suppression',
      'VALIDATION': 'Validation',
      'REJET': 'Rejet',
      'SIGNALEMENT': 'Signalement',
      'NOTIFICATION': 'Notification',
      'PREDICTION': 'Prédiction',
      'EXPORT': 'Export',
      'RAPPORT': 'Rapport',
      'PLANIFICATION': 'Planification',
      'CONSULTATION': 'Consultation',
      'CREATION': 'Création',
      'SYSTEME': 'Système',
      'ANALYSE': 'Analyse'
    };
    return actionMap[action] || action;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chargerLogs = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/logs/', headers);
      console.log('Logs reçus de la base:', response.data);

      if (response.data && response.data.length > 0) {
        const logsData = response.data.map(log => ({
          id: log.id_log,
          date: formatDate(log.created_at),
          utilisateur: log.utilisateur_nom || 'Système',
          email: log.utilisateur_email || '-',
          action: getActionLabel(log.action),
          details: log.details || '-',
          ip: log.ip_address || '-'
        }));
        setLogs(logsData);
        setFilteredLogs(logsData);
        toast.success(`${logsData.length} logs chargés depuis la base`);
      } else {
        setLogs([]);
        setFilteredLogs([]);
        toast.info('Aucun log trouvé dans la base de données');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée');
        logout();
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Endpoint /logs/ non trouvé. Vérifiez le backend.');
      } else {
        toast.error('Erreur de chargement: ' + (error.response?.data?.detail || error.message));
      }
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les logs
  useEffect(() => {
    let result = logs;

    if (search) {
      result = result.filter(log =>
        log.utilisateur.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter(log => log.action === filterType);
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [search, filterType, logs]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getActionBadgeClass = (action) => {
    const classes = {
      'Connexion': 'bg-green-100 text-green-700',
      'Modification': 'bg-blue-100 text-blue-700',
      'Suppression': 'bg-red-100 text-red-700',
      'Validation': 'bg-purple-100 text-purple-700',
      'Rejet': 'bg-orange-100 text-orange-700',
      'Prédiction': 'bg-indigo-100 text-indigo-700',
      'Notification': 'bg-pink-100 text-pink-700',
      'Signalement': 'bg-yellow-100 text-yellow-700'
    };
    return classes[action] || 'bg-gray-100 text-gray-700';
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
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            <span className="font-bold text-gray-800 text-lg">Tableau de bord</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <Link to="/dashboard/admin" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100 transition">
            <i className="fas fa-chart-line w-5"></i><span>Analyse</span>
          </Link>
          <Link to="/admin/utilisateurs" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100 transition">
            <i className="fas fa-users w-5"></i><span>Utilisateurs</span>
          </Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm font-medium bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg">
            <i className="fas fa-history w-5"></i><span>Journal d'activités</span>
          </div>
          <Link to="/admin/parametres" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100 transition">
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
          <h1 className="text-2xl font-bold text-gray-800">Journal d'activités</h1>
          <p className="text-gray-500 text-sm">Historique des actions effectuées sur la plateforme.</p>
          <p className="text-xs text-gray-400 mt-1">📋 {logs.length} log(s) dans la base de données</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Toutes les actions</option>
                <option value="Connexion">Connexions</option>
                <option value="Modification">Modifications</option>
                <option value="Suppression">Suppressions</option>
                <option value="Validation">Validations</option>
                <option value="Rejet">Rejets</option>
                <option value="Signalement">Signalements</option>
                <option value="Notification">Notifications</option>
                <option value="Prédiction">Prédictions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Utilisateur</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Détails</th>
                  <th className="px-6 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{log.date}</td>
                    <td className="px-6 py-3 text-sm font-medium">{log.utilisateur}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{log.details}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t flex justify-between items-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">◀</button>
              <span>Page {currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50">▶</button>
            </div>
          )}
        </div>

        <button onClick={chargerLogs} className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <i className="fas fa-sync-alt"></i> Actualiser
        </button>

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>
    </div>
  );
}

export default AdminLogs;
