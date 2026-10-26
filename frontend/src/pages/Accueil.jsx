import { Link } from 'react-router-dom';

function Accueil() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <i className="fas fa-bolt text-blue-600 text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Plateforme de gestion des coupures électriques</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Surveillez, analysez et anticipez les coupures d'électricité à Madagascar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="fas fa-map-marked-alt text-blue-500 text-4xl mb-3"></i>
            <h3 className="font-semibold text-gray-800 mb-2">Surveillance en temps réel</h3>
            <p className="text-gray-500 text-sm">Consultez les zones affectées sur la carte interactive</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="fas fa-chart-line text-blue-500 text-4xl mb-3"></i>
            <h3 className="font-semibold text-gray-800 mb-2">Analyse et prédiction</h3>
            <p className="text-gray-500 text-sm">Anticipez les risques de coupure</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="fas fa-bell text-blue-500 text-4xl mb-3"></i>
            <h3 className="font-semibold text-gray-800 mb-2">Notifications</h3>
            <p className="text-gray-500 text-sm">Recevez des alertes en temps réel</p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/carte" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition mx-2">
            🗺️ Voir la carte des coupures
          </Link>
          <Link to="/login" className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition mx-2">
            🔐 Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Accueil;
