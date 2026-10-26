import api from './api';

export const coupureService = {
  // Récupérer toutes les coupures
  getAll: async () => {
    const response = await api.get('/coupures/');
    return response.data;
  },

  // Récupérer les coupures en cours
  getEnCours: async () => {
    const response = await api.get('/coupures/');
    return response.data.filter(c => c.statut === 'en_cours');
  },

  // Récupérer les coupures par quartier
  getByQuartier: async (quartierId) => {
    const response = await api.get(`/coupures/quartier/${quartierId}`);
    return response.data;
  },

  // Récupérer les statistiques des coupures
  getStats: async () => {
    const response = await api.get('/coupures/stats');
    return response.data;
  }
};
