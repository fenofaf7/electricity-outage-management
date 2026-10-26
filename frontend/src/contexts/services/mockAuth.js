// Simulation temporaire en attendant l'API réelle
export const mockLogin = async (email, password) => {
  // Simuler une attente réseau
  await new Promise(resolve => setTimeout(resolve, 500));

  // Pour tester, accepter n'importe quel email/mot de passe
  if (email && password) {
    return {
      access_token: 'mock_token_12345',
      user: {
        id: 1,
        nom: email.split('@')[0],
        email: email,
        role: 'citoyen',
        est_actif: true
      }
    };
  }

  throw new Error('Email ou mot de passe incorrect');
};
