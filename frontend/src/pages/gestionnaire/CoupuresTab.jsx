import { useState } from 'react';
import api from '../../contexts/services/api';
import toast from 'react-hot-toast';

function CoupuresTab({ coupuresEnCours, coupuresResolues, quartiers, onCreerCoupure, onResoudreCoupure, getAuthHeaders, chargerDonnees }) {
  const [showModal, setShowModal] = useState(false);
  const [newCoupure, setNewCoupure] = useState({
    quartier_id: '',
    date_debut: '',
    date_fin: '',
    type_coupure: 'programmee',
    cause: ''
  });

  const handleResoudre = async (id) => {
    if (!id) {
      toast.error('ID de coupure invalide');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await api.put(`/coupures/${id}/resoudre`, {
        statut: 'termine',
        date_fin: new Date().toISOString()
      }, headers);

      console.log('Réponse résolution:', response.data);
      toast.success('Coupure résolue');
      if (chargerDonnees) chargerDonnees();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la résolution');
    }
  };

  const handleSubmit = () => {
    if (!newCoupure.quartier_id || !newCoupure.date_debut || !newCoupure.cause) {
      toast.error('Champs obligatoires');
      return;
    }
    onCreerCoupure(newCoupure);
    setShowModal(false);
    setNewCoupure({ quartier_id: '', date_debut: '', date_fin: '', type_coupure: 'programmee', cause: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          <i className="fas fa-plus mr-2"></i>Planifier une coupure
        </button>
      </div>

      {/* Coupures en cours */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50">
          <h2 className="font-semibold text-red-600">⚠️ Coupures en cours ({coupuresEnCours.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Quartier</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Cause</th>
                <th className="px-6 py-3">Début</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupuresEnCours.map((c) => (
                <tr key={c.id_coupure} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">#{c.id_coupure}</td>
                  <td className="px-6 py-3 text-sm font-medium text-red-600">{c.quartier_nom}</td>
                  <td className="px-6 py-3 text-sm">{c.type_coupure}</td>
                  <td className="px-6 py-3 text-sm">{c.cause}</td>
                  <td className="px-6 py-3 text-sm">{new Date(c.date_debut).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleResoudre(c.id_coupure)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                      ✓ Résoudre
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupures résolues */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-green-50">
          <h2 className="font-semibold text-green-600">✅ Coupures résolues ({coupuresResolues.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Quartier</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Cause</th>
                <th className="px-6 py-3">Période</th>
              </tr>
            </thead>
            <tbody>
              {coupuresResolues.slice(0, 10).map((c) => (
                <tr key={c.id_coupure} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">#{c.id_coupure}</td>
                  <td className="px-6 py-3 text-sm font-medium text-green-600">{c.quartier_nom}</td>
                  <td className="px-6 py-3 text-sm">{c.type_coupure}</td>
                  <td className="px-6 py-3 text-sm">{c.cause}</td>
                  <td className="px-6 py-3 text-sm">{new Date(c.date_debut).toLocaleDateString()} → {c.date_fin ? new Date(c.date_fin).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Planifier une coupure</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <select value={newCoupure.quartier_id} onChange={(e) => setNewCoupure({...newCoupure, quartier_id: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="">Sélectionner un quartier</option>
                {quartiers.map(q => <option key={q.id_quartier} value={q.id_quartier}>{q.nom_quartier}</option>)}
              </select>
              <input type="datetime-local" value={newCoupure.date_debut} onChange={(e) => setNewCoupure({...newCoupure, date_debut: e.target.value})} className="w-full p-2 border rounded-lg" />
              <input type="datetime-local" value={newCoupure.date_fin} onChange={(e) => setNewCoupure({...newCoupure, date_fin: e.target.value})} className="w-full p-2 border rounded-lg" />
              <select value={newCoupure.type_coupure} onChange={(e) => setNewCoupure({...newCoupure, type_coupure: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="programmee">Programmée</option>
                <option value="delestage">Délestage</option>
                <option value="imprevue">Imprévue</option>
              </select>
              <input type="text" value={newCoupure.cause} onChange={(e) => setNewCoupure({...newCoupure, cause: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Cause" />
              <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded-lg">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoupuresTab;
