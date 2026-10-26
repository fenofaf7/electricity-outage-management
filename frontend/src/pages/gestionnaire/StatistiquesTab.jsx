import { Doughnut } from 'react-chartjs-2';

function StatistiquesTab({ stats }) {
  const signalementsChartData = {
    labels: ['Validés', 'En attente', 'Rejetés'],
    datasets: [{ data: [stats.valides, stats.en_attente, stats.rejetes], backgroundColor: ['#22c55e', '#f97316', '#ef4444'] }]
  };

  const coupuresChartData = {
    labels: ['Planifiées', 'En cours', 'Résolues'],
    datasets: [{ data: [stats.coupures_planifiees, stats.coupures_en_cours, stats.coupures_resolues], backgroundColor: ['#3b82f6', '#f97316', '#22c55e'] }]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">📋 Signalements</h2>
        <div className="w-64 h-64 mx-auto"><Doughnut data={signalementsChartData} options={{ cutout: '60%' }} /></div>
        <div className="flex justify-center gap-6 mt-4 text-sm"><div><span className="text-green-600">●</span> Validés: {stats.valides}</div><div><span className="text-orange-600">●</span> En attente: {stats.en_attente}</div><div><span className="text-red-600">●</span> Rejetés: {stats.rejetes}</div></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">⚡ Coupures</h2>
        <div className="w-64 h-64 mx-auto"><Doughnut data={coupuresChartData} options={{ cutout: '60%' }} /></div>
        <div className="flex justify-center gap-6 mt-4 text-sm"><div><span className="text-blue-600">●</span> Planifiées: {stats.coupures_planifiees}</div><div><span className="text-orange-600">●</span> En cours: {stats.coupures_en_cours}</div><div><span className="text-green-600">●</span> Résolues: {stats.coupures_resolues}</div></div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">📊 Résumé global</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{stats.notifications_envoyees}</p><p className="text-xs">Notifications</p></div>
          <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{stats.coupures_resolues}</p><p className="text-xs">Coupures résolues</p></div>
          <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold text-orange-600">{stats.en_attente}</p><p className="text-xs">En attente</p></div>
        </div>
      </div>
    </div>
  );
}

export default StatistiquesTab;
