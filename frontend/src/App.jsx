import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './constants';

import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import GNOfficerDashboard from './pages/GNOfficerDashboard';
import DonorReliefBoard from './pages/DonorReliefBoard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PriorityResultScreen from './pages/PriorityResultScreen';

// RootRedirect component checks the current user and redirects to their specific dashboard
// This prevents authenticated users from seeing the login screen if they visit the root URL.
function RootRedirect() {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (currentUser.role === ROLES.GN_OFFICER) return <Navigate to="/dashboard/gn" replace />;
  if (currentUser.role === ROLES.DONOR) return <Navigate to="/dashboard/donor" replace />;
  if (currentUser.role === ROLES.SUPER_ADMIN) return <Navigate to="/dashboard/admin" replace />;
  
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* GN Officer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.GN_OFFICER]} />}>
            <Route path="/dashboard/gn" element={<GNOfficerDashboard />} />
          </Route>

          {/* Donor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.DONOR]} />}>
            <Route path="/dashboard/donor" element={<DonorReliefBoard />} />
          </Route>

          {/* Super Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
            <Route path="/dashboard/admin" element={<SuperAdminDashboard />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.GN_OFFICER, ROLES.SUPER_ADMIN]} />}>
            <Route path="/priority-result" element={<PriorityResultScreen />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
