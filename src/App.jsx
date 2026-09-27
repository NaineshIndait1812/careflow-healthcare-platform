import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PatientLayout from './components/PatientLayout'
import AdminLayout from './components/AdminLayout'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'

// Patient pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientProfile from './pages/patient/Profile'
import Appointments from './pages/patient/Appointments'
import Emergency from './pages/patient/Emergency'
import Blood from './pages/patient/Blood'
import Facilities from './pages/patient/Facilities'
import Notifications from './pages/patient/Notifications'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminEmergency from './pages/admin/AdminEmergency'
import AdminBlood from './pages/admin/AdminBlood'
import AdminFacilities from './pages/admin/AdminFacilities'
import AdminPatients from './pages/admin/AdminPatients'

import './styles/auth.css'

function AppRoutes() {
  const { isAuthenticated, profile } = useAuth()
  const isAdmin = profile?.role === 'ADMIN'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/patient') : '/login'} replace />} />

      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/patient'} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/patient'} replace /> : <Register />} />

      {/* ── Patient routes ── */}
      <Route path="/patient" element={<ProtectedRoute requiredRole="PATIENT"><PatientLayout /></ProtectedRoute>}>
        <Route index element={<PatientDashboard />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="blood" element={<Blood />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="emergency" element={<AdminEmergency />} />
        <Route path="blood" element={<AdminBlood />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="patients" element={<AdminPatients />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
