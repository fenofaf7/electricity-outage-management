import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { nom, email, mot_de_passe: password, role: 'citoyen' });
      toast.success('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input type="text" placeholder="Nom complet" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="mb-6">
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{loading ? 'Inscription...' : "S'inscrire"}</button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Déjà un compte ? Se connecter</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
