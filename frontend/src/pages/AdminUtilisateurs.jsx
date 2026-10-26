import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function AdminUtilisateurs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    role: 'citoyen'
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

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

  const chargerUtilisateurs = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      console.log('Chargement des utilisateurs...');

      const response = await api.get('/utilisateurs/', headers);
      console.log('Réponse API:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const utilisateurs = response.data.map(u => ({
          id: u.id_utilisateur || u.id,
          nom: u.nom,
          email: u.email,
          role: u.role?.nom_role || u.role || 'citoyen',
          statut: u.statut,
          est_actif: u.statut === 'actif',
          telephone: u.telephone,
          date_inscription: u.date_creation || u.date_inscription
        }));
        setUsers(utilisateurs);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data);

      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée');
        logout();
        navigate('/login');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est lancé (port 8000).');
        toast.error('Backend inaccessible');
      } else {
        setError('Erreur lors du chargement des données');
        toast.error('Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterUtilisateur = async () => {
    if (!newUser.nom || !newUser.email || !newUser.mot_de_passe) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const headers = getAuthHeaders();

      const roleMap = {
        'citoyen': 62,
        'administrateur': 63,
        'gestionnaire_coupure': 64,
        'analyste': 65
      };

      const userData = {
        nom: newUser.nom,
        email: newUser.email,
        mot_de_passe: newUser.mot_de_passe,
        id_role: roleMap[newUser.role],
        telephone: '',
        id_ville: 64
      };

      await api.post('/auth/register', userData, headers);

      toast.success('Utilisateur créé avec succès');
      setShowModal(false);
      setNewUser({ nom: '', email: '', mot_de_passe: '', role: 'citoyen' });
      chargerUtilisateurs();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
  };

  const handleSuspendre = async (userId, estActif) => {
    if (!userId) {
      toast.error('ID utilisateur invalide');
      return;
    }

    try {
      const headers = getAuthHeaders();

      if (estActif) {
        await api.put(`/utilisateurs/${userId}/suspendre`, {}, headers);
        toast.success('Utilisateur suspendu');
        setUsers(users.map(u => u.id === userId ? { ...u, statut: 'inactif', est_actif: false } : u));
      } else {
        await api.put(`/utilisateurs/${userId}/reactiver`, {}, headers);
        toast.success('Utilisateur réactivé');
        setUsers(users.map(u => u.id === userId ? { ...u, statut: 'actif', est_actif: true } : u));
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      toast.error('ID utilisateur invalide');
      return;
    }

    if (window.confirm('Supprimer définitivement cet utilisateur ?')) {
      try {
        const headers = getAuthHeaders();
        await api.delete(`/utilisateurs/${userId}`, headers);
        toast.success('Utilisateur supprimé');
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Erreur:', error);
        toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'administrateur': return 'bg-purple-100 text-purple-700';
      case 'analyste': return 'bg-green-100 text-green-700';
      case 'gestionnaire_coupure': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'administrateur': return 'Administrateur';
      case 'analyste': return 'Analyste';
      case 'gestionnaire_coupure': return 'Gestionnaire';
      default: return 'Citoyen';
    }
  };

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
            onClick={() => chargerUtilisateurs()}
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
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
            <p className="text-gray-500 text-sm">Gérer les comptes utilisateurs de la plateforme.</p>
            <p className="text-xs text-gray-400 mt-1">Total: {users.length} utilisateur(s)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            <i className="fas fa-plus mr-2"></i>Nouvel utilisateur
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rôle</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr key="empty">
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">#{u.id}</td>
                      <td className="px-6 py-3 text-sm font-medium">{u.nom}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.est_actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.est_actif ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-3">
                        <button onClick={() => handleSuspendre(u.id, u.est_actif)} className={`text-sm ${u.est_actif ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}`}>
                          {u.est_actif ? 'Suspendre' : 'Réactiver'}
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-sm text-red-500 hover:text-red-700">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 py-6 mt-6 border-t">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </main>

      {/* Modal d'ajout d'utilisateur */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter un utilisateur</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" value={newUser.nom} onChange={(e) => setNewUser({...newUser, nom: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Jean Dupont" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="exemple@domaine.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input type="password" value={newUser.mot_de_passe} onChange={(e) => setNewUser({...newUser, mot_de_passe: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="citoyen">Citoyen</option>
                  <option value="gestionnaire_coupure">Gestionnaire</option>
                  <option value="analyste">Analyste</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>

              <button onClick={handleAjouterUtilisateur} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUtilisateurs;
