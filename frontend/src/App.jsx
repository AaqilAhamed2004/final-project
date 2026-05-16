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
import DonorContributionsPage from './pages/DonorContributionsPage'
import AdminLogisticsPage from './pages/AdminLogisticsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ProfilePage from './pages/ProfilePage'




function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/" replace />

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

          <Route path="/logistics" element={
            <ProtectedRoute allowedRoles={['super_admin', 'gn_officer']}>
              <AdminLogisticsPage />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
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

          <Route path="/contributions" element={
            <ProtectedRoute allowedRoles={['donor', 'gn_officer', 'super_admin']}>
              <DonorContributionsPage />
            </ProtectedRoute>
          } />


          
          {/* Fallback route for legacy /dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {/* Note: In a real app we might redirect based on user role here */}
              <Navigate to="/login" replace />
            </ProtectedRoute>
          } />
          {/* Catch-all: redirect unknown routes to root (RootRedirect handles role-based dispatch) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}