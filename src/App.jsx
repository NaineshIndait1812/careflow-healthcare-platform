import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PatientLayout from './components/PatientLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'

// Patient sub-pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientProfile from './pages/patient/Profile'
import Placeholder from './pages/patient/Placeholder'

import './styles/auth.css'

function AppRoutes() {
  const { isAuthenticated, profile } = useAuth()

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? (profile?.role === 'ADMIN' ? '/admin' : '/patient') : '/login'}
            replace
          />
        }
      />

      {/* Auth pages */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={profile?.role === 'ADMIN' ? '/admin' : '/patient'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={profile?.role === 'ADMIN' ? '/admin' : '/patient'} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Patient routes — nested under PatientLayout */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="PATIENT">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route
          path="appointments"
          element={
            <Placeholder
              icon="📅"
              title="Appointments"
              description="Book and manage your appointments with doctors and clinics. Coming in the next step."
            />
          }
        />
        <Route
          path="emergency"
          element={
            <Placeholder
              icon="🚑"
              title="Emergency Center"
              description="Request emergency ambulance services and coordinate urgent care. Coming soon."
            />
          }
        />
        <Route
          path="blood"
          element={
            <Placeholder
              icon="🩸"
              title="Blood Availability"
              description="Check real-time blood unit availability at local blood banks. Coming soon."
            />
          }
        />
        <Route
          path="facilities"
          element={
            <Placeholder
              icon="🏥"
              title="Healthcare Facilities"
              description="Browse hospitals, clinics, and diagnostic centers near you. Coming soon."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <Placeholder
              icon="🔔"
              title="Notifications"
              description="Your appointment updates, reminders, and alerts will appear here. Coming soon."
            />
          }
        />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
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
