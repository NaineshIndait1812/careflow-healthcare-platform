import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './styles/auth.css'

function AppRoutes() {
  const { isAuthenticated, profile } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? (profile?.role === 'ADMIN' ? '/admin' : '/patient') : '/login'}
            replace
          />
        }
      />
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
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="PATIENT">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
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
