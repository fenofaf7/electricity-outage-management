import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CarteCoupure from './pages/Carte';
import Accueil from './pages/Accueil';
import DashboardCitoyen from './pages/DashboardCitoyen';
import DashboardGestionnaire from './pages/DashboardGestionnaire';
import DashboardAnalyste from './pages/DashboardAnalyste';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminUtilisateurs from './pages/AdminUtilisateurs';
import AdminLogs from './pages/AdminLogs';
import AdminParametres from './pages/AdminParametres';
import AnalystePredictions from './pages/AnalystePredictions';
import AnalysteRapports from './pages/AnalysteRapports';
import AnalysteCarteReseau from './pages/AnalysteCarteReseau';
import AnalysteJournal from './pages/AnalysteJournal';
import TestAlgorithmes from './pages/TestAlgorithmes';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carte" element={<CarteCoupure />} />
        <Route path="/dashboard/citoyen" element={
          <ProtectedRoute allowedRoles={['citoyen', 'administrateur']}>
            <DashboardCitoyen />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/gestionnaire" element={
          <ProtectedRoute allowedRoles={['gestionnaire_coupure', 'administrateur']}>
            <DashboardGestionnaire />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analyste" element={
          <ProtectedRoute allowedRoles={['analyste', 'administrateur']}>
            <DashboardAnalyste />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['administrateur']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/utilisateurs" element={
          <ProtectedRoute allowedRoles={['administrateur']}>
            <AdminUtilisateurs />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute allowedRoles={['administrateur']}>
            <AdminLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/parametres" element={
          <ProtectedRoute allowedRoles={['administrateur']}>
            <AdminParametres />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/gestionnaire" element={
          <ProtectedRoute allowedRoles={['gestionnaire_coupure', 'administrateur']}>
            <DashboardGestionnaire />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/citoyen" element={
          <ProtectedRoute allowedRoles={['citoyen', 'administrateur']}>
            <DashboardCitoyen />
          </ProtectedRoute>
        } />
        <Route path="/analyste/predictions" element={
          <ProtectedRoute allowedRoles={['analyste', 'administrateur']}>
            <AnalystePredictions />
          </ProtectedRoute>
        } />
        <Route path="/analyste/rapports" element={
          <ProtectedRoute allowedRoles={['analyste', 'administrateur']}>
            <AnalysteRapports />
          </ProtectedRoute>
        } />
        <Route path="/analyste/carte-reseau" element={
          <ProtectedRoute allowedRoles={['analyste', 'administrateur']}>
            <AnalysteCarteReseau />
          </ProtectedRoute>
        } />
        <Route path="/analyste/journal" element={
          <ProtectedRoute allowedRoles={['analyste', 'administrateur']}>
            <AnalysteJournal />
          </ProtectedRoute>
        } />
        <Route path="/test-algorithmes" element={
          <ProtectedRoute allowedRoles={['administrateur', 'analyste']}>
            <TestAlgorithmes />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
