import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../contexts/services/api';
import toast from 'react-hot-toast';

function AdminParametres() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'Plateforme Gestion Coupures',
    siteDescription: 'Plateforme de gestion et prédiction des coupures électriques',
    contactEmail: 'contact@coupures.mg',
    notificationEnabled: true,
    autoPrediction: true,
    maxCoupuresPerDay: 10,
    alertThreshold: 70,
    maintenanceMode: false
  });

  useEffect(() => {
    chargerParametres();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const chargerParametres = async () => {
    setLoading(true);
    try {
      // Simulation (à remplacer par l'API réelle)
      // const response = await api.get('/parametres/', getAuthHeaders());
      // setSettings(response.data);

      // Données mockées
      console.log('Paramètres chargés');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sauvegarde (à remplacer par l'API réelle)
      // await api.put('/parametres/', settings, getAuthHeaders());

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
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
          <Link to="/admin/logs" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 rounded-lg mx-2 hover:bg-gray-100 transition">
            <i className="fas fa-history w-5"></i><span>Journal d'activités</span>
          </Link>
          <div className="flex items-center gap-3 px-5 py-3 text-sm font-medium bg-blue-50 text-blue-700 border-r-4 border-blue-600 mx-2 rounded-l-lg">
            <i className="fas fa-cog w-5"></i><span>Paramètres</span>
          </div>
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
          <p className="text-gray-500 text-sm">Configuration générale de la plateforme.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description du site</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Configuration système */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration système</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (%)</label>
                <input
                  type="number"
                  name="alertThreshold"
                  value={settings.alertThreshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Déclencher une alerte lorsque le risque dépasse ce seuil</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max coupures/jour</label>
                <input
                  type="number"
                  name="maxCoupuresPerDay"
                  value={settings.maxCoupuresPerDay}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Options</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationEnabled"
                  checked={settings.notificationEnabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Activer les notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoPrediction"
                  checked={settings.autoPrediction}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Prédiction automatique</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-red-600">Mode maintenance (site inaccessible)</span>
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={chargerParametres}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sauvegarder
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>
    </div>
  );
}

export default AdminParametres;
