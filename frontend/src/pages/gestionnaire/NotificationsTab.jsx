import { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

function NotificationsTab({ stats, quartiers, notifications, onEnvoyerNotification, onMarquerLu }) {
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({
    quartier_id: '',
    message: '',
    type: 'delestage',
    id_citoyen: ''
  });

  // Calcul des compteurs réels
  const totalEnvoyees = notifications.length;
  const totalLues = notifications.filter(n => n.statut === 'lu').length;
  const totalNonLues = notifications.filter(n => n.statut === 'non_lu').length;
  const tauxLecture = totalEnvoyees > 0 ? Math.round((totalLues / totalEnvoyees) * 100) : 0;

  // Données pour le graphique par type
  const typesData = {
    labels: ['Délestage', 'Maintenance', 'Information', 'Urgence', 'Signalement'],
    datasets: [{
      label: 'Nombre',
      data: [
        notifications.filter(n => n.type === 'delestage').length,
        notifications.filter(n => n.type === 'maintenance').length,
        notifications.filter(n => n.type === 'info').length,
        notifications.filter(n => n.type === 'urgence').length,
        notifications.filter(n => n.type === 'signalement').length
      ],
      backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6']
    }]
  };

  // Évolution des notifications (7 derniers jours)
  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const evolutionData = jours.map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return notifications.filter(n => new Date(n.date_envoi).toDateString() === date.toDateString()).length;
  });

  const evolutionNotifications = {
    labels: jours,
    datasets: [{
      label: 'Notifications',
      data: evolutionData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Donut des lectures
  const tauxLectureData = {
    labels: ['Lus', 'Non lus'],
    datasets: [{
      data: [totalLues, totalNonLues],
      backgroundColor: ['#22c55e', '#ef4444']
    }]
  };

  const handleSubmit = () => {
    if (!notification.quartier_id || !notification.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onEnvoyerNotification({
      message: notification.message,
      type: notification.type,
      id_quartier: parseInt(notification.quartier_id),
      id_citoyen: notification.id_citoyen ? parseInt(notification.id_citoyen) : null
    });

    setShowModal(false);
    setNotification({ quartier_id: '', message: '', type: 'delestage', id_citoyen: '' });
  };

  const handleMarquerLu = (notificationId) => {
    if (onMarquerLu) {
      onMarquerLu(notificationId);
    }
  };

  const getQuartierNom = (id) => {
    const q = quartiers.find(q => q.id_quartier === id);
    return q?.nom_quartier || `Quartier ${id}`;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'delestage': return '⚡ Délestage';
      case 'maintenance': return '🔧 Maintenance';
      case 'urgence': return '🚨 Urgence';
      case 'signalement': return '📋 Signalement';
      default: return 'ℹ️ Information';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'delestage': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'urgence': return 'bg-red-100 text-red-700';
      case 'signalement': return 'bg-purple-100 text-purple-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          <i className="fas fa-plus mr-2"></i>Nouvelle notification
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-3xl mb-2">📨</div>
          <p className="text-gray-500 text-sm">Notifications envoyées</p>
          <p className="text-3xl font-bold text-blue-600">{totalEnvoyees}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-gray-500 text-sm">Taux de lecture</p>
          <p className="text-3xl font-bold text-green-600">{tauxLecture}%</p>
          <p className="text-xs text-gray-400 mt-1">{totalLues} lus / {totalEnvoyees} total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-gray-500 text-sm">Non lues</p>
          <p className="text-3xl font-bold text-orange-600">{totalNonLues}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-4">📊 Notifications par type</h2>
          <Bar data={typesData} options={{ responsive: true }} height={250} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-4">📈 Évolution (7 derniers jours)</h2>
          <Line data={evolutionNotifications} options={{ responsive: true }} height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-4">🎯 Taux de lecture</h2>
          <div className="w-64 h-64 mx-auto">
            <Doughnut data={tauxLectureData} options={{ cutout: '60%' }} />
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div><span className="text-green-600">●</span> Lus: {totalLues}</div>
            <div><span className="text-red-600">●</span> Non lus: {totalNonLues}</div>
          </div>
        </div>

        {/* Liste des notifications avec bouton "Marquer comme lu" */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-4">📋 Liste des notifications</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Aucune notification</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id_notification} className={`p-3 rounded-lg border ${n.statut === 'non_lu' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(n.type)}`}>
                          {getTypeIcon(n.type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(n.date_envoi).toLocaleString()}
                        </span>
                        {n.statut === 'non_lu' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        📍 Quartier: {getQuartierNom(n.id_quartier)}
                        {n.id_citoyen && ` | 👤 Citoyen #${n.id_citoyen}`}
                      </p>
                    </div>
                    {n.statut === 'non_lu' && (
                      <button
                        onClick={() => handleMarquerLu(n.id_notification)}
                        className="ml-3 text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                      >
                        ✓ Marquer comme lu
                      </button>
                    )}
                    {n.statut === 'lu' && (
                      <span className="ml-3 text-xs text-green-600 px-2 py-1">
                        ✅ Lu
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nouvelle notification</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({...notification, type: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="delestage">⚡ Délestage</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="info">ℹ️ Information</option>
                  <option value="urgence">🚨 Urgence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quartier *</label>
                <select
                  value={notification.quartier_id}
                  onChange={(e) => setNotification({...notification, quartier_id: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Sélectionner un quartier</option>
                  {quartiers.map(q => <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Destinataire (optionnel)</label>
                <select
                  value={notification.id_citoyen}
                  onChange={(e) => setNotification({...notification, id_citoyen: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Tous les citoyens du quartier</option>
                  <option value="5">Feno Andria (Analakely)</option>
                  <option value="7">Amnazy Raforce (Antaninarenina)</option>
                  <option value="8">Ketaka Soa (Tanambao V)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={notification.message}
                  onChange={(e) => setNotification({...notification, message: e.target.value})}
                  className="w-full p-2 border rounded-lg resize-none"
                  placeholder="Entrez votre message..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Envoyer la notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsTab;
