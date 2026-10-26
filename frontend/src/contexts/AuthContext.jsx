import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Vérifier si storedUser existe et n'est pas "undefined"
    if (token && storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors du parse du user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Tentative de connexion:', email);

      const response = await api.post('/auth/login', {
        email,
        mot_de_passe: password
      });

      console.log('Réponse:', response.data);

      const { access_token, user_id, nom, role } = response.data;

      const userData = {
        id: user_id,
        nom: nom,
        email: email,
        role: role,
        est_actif: true
      };

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Connexion réussie');
      return { success: true, role: role };
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Réponse erreur:', error.response?.data);

      let message = 'Erreur de connexion';
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
