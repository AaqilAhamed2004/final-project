import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import GNOfficerDashboard from './pages/GNOfficerDashboard'
import DonorReliefBoard from './pages/DonorReliefBoard'
import PriorityResultScreen from './pages/PriorityResultScreen'
import AdminInventoryPage from './pages/AdminInventoryPage'
import AdminRequestsPage from './pages/AdminRequestsPage'


function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { token, user } = useAuth()
  
  if (!token) return <Navigate to="/login" replace />
  
  if (user?.role === 'super_admin') return <Navigate to="/dashboard/admin" replace />
  if (user?.role === 'gn_officer')  return <Navigate to="/dashboard/gn" replace />
  if (user?.role === 'donor')       return <Navigate to="/dashboard/donor" replace />
  
  return <Navigate to="/public" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<RootRedirect />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/public" element={<DonorReliefBoard />} />


          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['super_admin', 'gn_officer']}>
              <AdminInventoryPage />
            </ProtectedRoute>
          } />

          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['super_admin', 'gn_officer']}>
              <AdminRequestsPage />
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