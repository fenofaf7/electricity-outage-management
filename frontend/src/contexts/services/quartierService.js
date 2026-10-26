import api from './api';

export const quartierService = {
  // Récupérer tous les quartiers
  getAll: async () => {
    const response = await api.get('/quartiers/');
    return response.data;
  },

  // Récupérer un quartier par ID
  getById: async (id) => {
    const response = await api.get(`/quartiers/${id}`);
    return response.data;
  },

  // Récupérer les quartiers par ville
  getByVille: async (villeId) => {
    const response = await api.get(`/quartiers/ville/${villeId}`);
    return response.data;
  }
};
