import api from './api';

export const algorithmeService = {
  // ========== PRÉDICTIONS ==========

  // Prédiction simple (approche probabiliste)
  getPrediction: async (consommation, pannes, heure) => {
    try {
      const response = await api.get(`/test/prediction/${consommation}/${pannes}/${heure}`);
      return response.data;
    } catch (error) {
      console.error('Erreur prédiction:', error);
      return null;
    }
  },

  // Prédictions multiples pour tous les quartiers
  getPredictionsMultiples: async () => {
    try {
      const response = await api.get('/test/predictions-multiples');
      return response.data;
    } catch (error) {
      console.error('Erreur prédictions multiples:', error);
      return [];
    }
  },

  // Scénarios de prédiction
  getScenarios: async () => {
    try {
      const response = await api.get('/test/scenarios');
      return response.data;
    } catch (error) {
      console.error('Erreur scénarios:', error);
      return [];
    }
  },

  // ========== DIJKSTRA - RÉSEAU ==========

  // Chemin optimal entre deux quartiers
  getCheminOptimal: async (source, destination) => {
    try {
      const response = await api.get(`/test/reseau/chemin/${source}/${destination}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chemin optimal:', error);
      return null;
    }
  },

  // Chemins alternatifs
  getCheminsAlternatifs: async (source, destination, k = 3) => {
    try {
      const response = await api.get(`/test/reseau/chemin-alternatifs/${source}/${destination}?k=${k}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chemins alternatifs:', error);
      return null;
    }
  },

  // Distribution réseau
  getDistributionReseau: async () => {
    try {
      const response = await api.get('/test/reseau/distributions');
      return response.data;
    } catch (error) {
      console.error('Erreur distribution:', error);
      return null;
    }
  },

  // Informations du réseau
  getInfoReseau: async () => {
    try {
      const response = await api.get('/test/reseau');
      return response.data;
    } catch (error) {
      console.error('Erreur info réseau:', error);
      return null;
    }
  },

  // ========== GLOUTON - DÉLESTAGE ==========

  // Planifier délestage avec puissance personnalisée
  planifierDelestage: async (puissance) => {
    try {
      const response = await api.get(`/test/delestage/${puissance}`);
      return response.data;
    } catch (error) {
      console.error('Erreur planification délestage:', error);
      return null;
    }
  },

  // Priorité des quartiers
  getPrioriteQuartiers: async () => {
    try {
      const response = await api.get('/test/priorite-quartier');
      return response.data;
    } catch (error) {
      console.error('Erreur priorité quartiers:', error);
      return [];
    }
  },

  // Tous les tests en un
  getAllTests: async () => {
    try {
      const response = await api.get('/test/all');
      return response.data;
    } catch (error) {
      console.error('Erreur tests complets:', error);
      return null;
    }
  }
};
