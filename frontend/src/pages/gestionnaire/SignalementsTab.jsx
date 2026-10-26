function SignalementsTab({ signalements, onValider, onRejeter }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="font-semibold text-gray-800">Signalements en attente ({signalements.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Quartier</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {signalements.map((s) => (
              <tr key={s.id_signalement} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm">#{s.id_signalement}</td>
                <td className="px-6 py-3 text-sm font-medium text-blue-600">{s.quartier_nom}</td>
                <td className="px-6 py-3 text-sm max-w-xs truncate">{s.description}</td>
                <td className="px-6 py-3 text-sm">{new Date(s.date_signalement).toLocaleString()}</td>
                <td className="px-6 py-3 flex gap-2">
                  <button
                    onClick={() => onValider(s.id_signalement)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    ✓ Valider
                  </button>
                  <button
                    onClick={() => onRejeter(s.id_signalement)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    ✗ Rejeter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SignalementsTab;
