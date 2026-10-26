import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../contexts/services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

function CarteCoupures() {
  const { user } = useAuth(); // Ajout pour vérifier si l'utilisateur est connecté
  const [loading, setLoading] = useState(true);
  const [coupures, setCoupures] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedQuartier, setSelectedQuartier] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    planifie: 0,
    termine: 0
  });

  // Coordonnées des quartiers
  const quartierCoordinates = {
    86: { lat: -18.9072, lng: 47.5363, nom: 'Analakely' },
    87: { lat: -18.9142, lng: 47.5314, nom: 'Antaninarenina' },
    88: { lat: -18.9225, lng: 47.5286, nom: 'Isotry' },
    89: { lat: -18.9019, lng: 47.5264, nom: 'Mahamasina' },
    90: { lat: -18.8897, lng: 47.5436, nom: '67 Ha' },
    91: { lat: -18.8833, lng: 47.5500, nom: 'Andraharo' },
    92: { lat: -18.8739, lng: 47.5567, nom: 'Anjanahary' },
    93: { lat: -18.9125, lng: 47.5217, nom: 'Anosy' },
    94: { lat: -18.9083, lng: 47.5119, nom: 'Antanimena' },
    95: { lat: -18.9178, lng: 47.5242, nom: 'Faravohitra' },
    96: { lat: -18.8903, lng: 47.5489, nom: 'Tanambao V' },
    97: { lat: -18.8986, lng: 47.5383, nom: 'Morarano' },
    98: { lat: -18.8808, lng: 47.5617, nom: 'Ambatoharanana' },
    99: { lat: -18.8864, lng: 47.5461, nom: 'Mahavoky Avaratra' },
    100: { lat: -18.8931, lng: 47.5544, nom: 'Amborovy' }
  };

  useEffect(() => {
    chargerDonnees();
    const interval = setInterval(chargerDonnees, 30000);
    return () => clearInterval(interval);
  }, []);

  const chargerDonnees = async () => {
    try {
      const coupuresRes = await api.get('/coupures/');
      const allCoupures = coupuresRes.data || [];

      const quartiersRes = await api.get('/quartiers/');
      const quartiersList = quartiersRes.data || [];

      const coupuresAvecCoords = allCoupures.map(c => ({
        ...c,
        coordonnees: quartierCoordinates[c.id_quartier] || { lat: -18.8792, lng: 47.5079, nom: 'Antananarivo' },
        quartier_nom: quartierCoordinates[c.id_quartier]?.nom || 'Inconnu'
      }));

      setCoupures(coupuresAvecCoords);
      setQuartiers(quartiersList);

      setStats({
        total: allCoupures.length,
        en_cours: allCoupures.filter(c => c.statut === 'en_cours').length,
        planifie: allCoupures.filter(c => c.statut === 'planifie').length,
        termine: allCoupures.filter(c => c.statut === 'termine').length
      });

    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCouleurParStatut = (statut) => {
    switch(statut) {
      case 'en_cours': return '#ef4444';
      case 'planifie': return '#f97316';
      case 'termine': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const filteredCoupures = coupures.filter(c => {
    if (filter === 'all') return true;
    return c.statut === filter;
  });

  const center = { lat: -18.8792, lng: 47.5079 };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header avec bouton retour */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">🗺️ Carte interactive des coupures</h1>
              <p className="text-blue-100 text-sm mt-1">Consultez en temps réel les zones affectées</p>
            </div>
            <div className="flex gap-3">
              <Link to="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i className="fas fa-home mr-2"></i>Accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-gray-500">
            <p className="text-gray-500 text-xs">Total coupures</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-red-500">
            <p className="text-red-500 text-xs">En cours</p>
            <p className="text-2xl font-bold text-red-600">{stats.en_cours}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-orange-500">
            <p className="text-orange-500 text-xs">Planifiées</p>
            <p className="text-2xl font-bold text-orange-600">{stats.planifie}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center border-l-4 border-green-500">
            <p className="text-green-500 text-xs">Résolues</p>
            <p className="text-2xl font-bold text-green-600">{stats.termine}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="container mx-auto px-4 py-3">
        <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap gap-2 justify-center">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Toutes
          </button>
          <button onClick={() => setFilter('en_cours')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'en_cours' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
            En cours
          </button>
          <button onClick={() => setFilter('planifie')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'planifie' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
            Planifiées
          </button>
          <button onClick={() => setFilter('termine')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'termine' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
            Résolues
          </button>
        </div>
      </div>

      {/* Carte */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <MapContainer center={center} zoom={12} style={{ height: '450px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />

            {Object.entries(
              filteredCoupures.reduce((acc, c) => {
                const key = c.id_quartier;
                if (!acc[key]) acc[key] = [];
                acc[key].push(c);
                return acc;
              }, {})
            ).map(([quartierId, coupuresList]) => {
              const coords = quartierCoordinates[quartierId];
              if (!coords) return null;

              const enCoursCount = coupuresList.filter(c => c.statut === 'en_cours').length;
              const couleur = enCoursCount > 0 ? '#ef4444' : '#f97316';

              return (
                <CircleMarker
                  key={quartierId}
                  center={[coords.lat, coords.lng]}
                  radius={12 + Math.min(coupuresList.length, 10)}
                  fillColor={couleur}
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.7}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <h3 className="font-bold text-gray-800 mb-2">{coords.nom}</h3>
                      <p className="text-xs text-gray-500 mb-2">{coupuresList.length} coupure(s)</p>
                      <div className="space-y-1">
                        {coupuresList.slice(0, 3).map(c => (
                          <div key={c.id_coupure} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              c.statut === 'en_cours' ? 'bg-red-500' :
                              c.statut === 'planifie' ? 'bg-orange-500' : 'bg-green-500'
                            }`}></span>
                            <span>{c.cause || c.type_coupure}</span>
                            <span className="text-gray-400">
                              {c.statut === 'en_cours' ? 'En cours' : c.statut === 'planifie' ? 'Prévue' : 'Résolue'}
                            </span>
                          </div>
                        ))}
                        {coupuresList.length > 3 && (
                          <p className="text-xs text-blue-500">+{coupuresList.length - 3} autres</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Légende */}
          <div className="p-3 bg-gray-50 border-t flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Coupure en cours</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>Planifiée</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Résolue</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-500"></div><span>Aucune coupure</span></div>
          </div>
        </div>
      </div>

      {/* Liste des coupures récentes */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-800">📋 Dernières coupures signalées</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Quartier</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Cause</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupures.slice(0, 10).map((c) => (
                  <tr key={c.id_coupure} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{new Date(c.date_debut).toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm font-medium">{c.quartier_nom}</td>
                    <td className="px-6 py-3 text-sm">{c.type_coupure}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{c.cause}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.statut === 'en_cours' ? 'bg-red-100 text-red-700' :
                        c.statut === 'planifie' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {c.statut === 'en_cours' ? 'En cours' : c.statut === 'planifie' ? 'Prévue' : 'Résolue'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          © 2026 Plateforme de gestion des coupures électriques - Madagascar
        </div>
      </div>
    </div>
  );
}

export default CarteCoupures;
