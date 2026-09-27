import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute — wraps pages that require authentication + optional role.
 *
 * Props:
 *   requiredRole  — 'PATIENT' | 'ADMIN' (optional, any authenticated user if omitted)
 *   children      — the page to render
 */
export default function ProtectedRoute({ requiredRole, children }) {
  const { loading, isAuthenticated, profile } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If a specific role is required, check it
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to the appropriate dashboard based on actual role
    if (profile?.role === 'ADMIN') return <Navigate to="/admin" replace />
    return <Navigate to="/patient" replace />
  }

  return children
}
