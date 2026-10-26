import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

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

function CarteCitoyen() {
  const [loading, setLoading] = useState(true);
  const [coupures, setCoupures] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    planifie: 0,
    termine: 0
  });

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
      const response = await api.get('/coupures/');
      const allCoupures = response.data || [];

      const coupuresAvecCoords = allCoupures.map(c => ({
        ...c,
        coordonnees: quartierCoordinates[c.id_quartier] || { lat: -18.8792, lng: 47.5079, nom: 'Antananarivo' },
        quartier_nom: quartierCoordinates[c.id_quartier]?.nom || 'Inconnu'
      }));

      setCoupures(coupuresAvecCoords);

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

  const filteredCoupures = coupures.filter(c => {
    if (filter === 'all') return true;
    return c.statut === filter;
  });

  const center = { lat: -18.8792, lng: 47.5079 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats mini */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-500">Total</p>
          <p className="text-sm font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-red-500">En cours</p>
          <p className="text-sm font-bold text-red-600">{stats.en_cours}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-orange-500">Planifiées</p>
          <p className="text-sm font-bold text-orange-600">{stats.planifie}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-green-500">Résolues</p>
          <p className="text-sm font-bold text-green-600">{stats.termine}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}>
          Toutes
        </button>
        <button onClick={() => setFilter('en_cours')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === 'en_cours' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>
          En cours
        </button>
        <button onClick={() => setFilter('planifie')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === 'planifie' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
          Planifiées
        </button>
        <button onClick={() => setFilter('termine')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === 'termine' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
          Résolues
        </button>
      </div>

      {/* Carte */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <MapContainer center={center} zoom={12} style={{ height: '350px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                radius={10 + Math.min(coupuresList.length, 8)}
                fillColor={couleur}
                color="#fff"
                weight={2}
                opacity={1}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold text-gray-800">{coords.nom}</h3>
                    <p className="text-xs text-gray-500">{coupuresList.length} coupure(s)</p>
                    {coupuresList.slice(0, 3).map(c => (
                      <div key={c.id_coupure} className="text-xs mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          c.statut === 'en_cours' ? 'bg-red-500' :
                          c.statut === 'planifie' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></span>
                        {c.cause || c.type_coupure}
                      </div>
                    ))}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Légende */}
        <div className="p-2 bg-gray-50 border-t flex gap-3 justify-center text-[10px]">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>En cours</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span>Planifiée</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div><span>Résolue</span></div>
        </div>
      </div>
    </div>
  );
}

export default CarteCitoyen;
