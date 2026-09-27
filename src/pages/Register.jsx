import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Register() {
  const { signUp, isAuthenticated, isAdmin } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect — use <Navigate> not navigate() in render
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/patient'} replace />
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const fullName = form.fullName.trim()
    const email = form.email.trim().toLowerCase()
    const password = form.password
    const confirmPassword = form.confirmPassword
    const phone = form.phone.trim()

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { data, error: authError } = await signUp({
      email,
      password,
      fullName,
      phone,
    })
    setLoading(false)

    if (authError) {
      const lower = authError.message?.toLowerCase() || ''
      const status = authError.status

      if (lower.includes('already registered') || lower.includes('user already exists')) {
        setError('An account with this email already exists.')
      } else if (
        status === 429 ||
        lower.includes('rate limit') ||
        lower.includes('too many') ||
        lower.includes('over_email_send_rate_limit')
      ) {
        setError('Too many signup attempts have been made from this network. Please wait a few minutes and try again.')
      } else if (lower.includes('weak password') || lower.includes('password should')) {
        setError('Please choose a stronger password.')
      } else if (lower.includes('invalid email')) {
        setError('Please enter a valid email address.')
      } else {
        setError('Unable to create your account. Please review your details and try again.')
      }
      return
    }

    // If email confirmation is required, user won't have a session yet
    if (data?.user && !data?.session) {
      setSuccess('Registration successful! Please check your email to verify your account.')
    }
    // If no confirmation needed, onAuthStateChange handles redirect
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>CareFlow</h1>
          <p className="auth-subtitle">Healthcare Management Platform</p>
        </div>

        <h2>Create Account</h2>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91-9000000000"
          />

          <label htmlFor="bloodGroup">Blood Group</label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
          >
            <option value="">— Select —</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
