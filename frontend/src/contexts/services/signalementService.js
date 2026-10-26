import api from './api';

export const signalementService = {
  // Récupérer tous les signalements
  getAll: async () => {
    const response = await api.get('/signalements/');
    return response.data;
  },

  // Récupérer les signalements en attente
  getEnAttente: async () => {
    const response = await api.get('/signalements/en-attente/');
    return response.data;
  },

  // Créer un signalement (citoyen)
  create: async (data) => {
    const response = await api.post('/signalements/', data);
    return response.data;
  },

  // Valider un signalement (gestionnaire)
  valider: async (id, coupureData) => {
    const response = await api.put(`/signalements/${id}/valider`, coupureData);
    return response.data;
  },

  // Rejeter un signalement (gestionnaire)
  rejeter: async (id, raison) => {
    const response = await api.put(`/signalements/${id}/rejeter`, { raison });
    return response.data;
  },

  // Récupérer les stats des signalements
  getStats: async () => {
    const response = await api.get('/signalements/stats/');
    return response.data;
  }
};
