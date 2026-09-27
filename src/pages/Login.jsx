import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandMark from '../components/BrandMark'

export default function Login() {
  const { signIn, isAuthenticated, isAdmin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/patient'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanedEmail = email.trim()
    const cleanedPassword = password

    if (!cleanedEmail || !cleanedPassword) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    const { error: authError } = await signIn({ email: cleanedEmail, password: cleanedPassword })
    setLoading(false)

    if (authError) {
      const lower = authError.message?.toLowerCase() || ''
      const status = authError.status

      if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
        setError('Invalid email or password.')
      } else if (
        status === 429 ||
        lower.includes('rate limit') ||
        lower.includes('too many') ||
        lower.includes('over_email_send_rate_limit')
      ) {
        setError('Too many login attempts have been made from this network. Please wait a few minutes and try again.')
      } else if (lower.includes('email not confirmed') || lower.includes('email confirmation')) {
        setError('Please verify your email before signing in.')
      } else {
        setError('Unable to sign in. Please check your credentials and try again.')
      }
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-logo-row">
            <BrandMark size={44} />
            <h1>Care<span>Flow</span></h1>
          </div>
          <h2>Connected Healthcare. Simplified.</h2>
          <p>A professional platform for appointments, emergency coordination, blood availability, and facility access.</p>
          <ul className="auth-brand-points">
            <li><span className="auth-point-dot" /> Secure patient and admin access</li>
            <li><span className="auth-point-dot" /> Appointments and facility directory</li>
            <li><span className="auth-point-dot" /> Emergency ambulance coordination</li>
          </ul>
        </div>
      </aside>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-header mobile-only">
            <h1>Care<span>Flow</span></h1>
            <p className="auth-subtitle">Healthcare Management Platform</p>
          </div>

          <h2>Sign In</h2>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
