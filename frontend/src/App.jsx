import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import GNOfficerDashboard from './pages/GNOfficerDashboard'
import DonorReliefBoard from './pages/DonorReliefBoard'
import PriorityResultScreen from './pages/PriorityResultScreen'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Navigate to="/public" replace />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/public" element={<DonorReliefBoard />} />

          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/gn" element={
            <ProtectedRoute allowedRoles={['gn_officer']}>
              <GNOfficerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/donor" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorReliefBoard />
            </ProtectedRoute>
          } />
          
          {/* Fallback route for legacy /dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {/* Note: In a real app we might redirect based on user role here */}
              <Navigate to="/login" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}