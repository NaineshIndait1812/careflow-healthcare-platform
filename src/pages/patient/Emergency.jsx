import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { timeAgo, insertNotification } from '../../lib/utils'

const REQUEST_TYPES = ['Medical Emergency', 'Accident', 'Cardiac', 'Stroke', 'Respiratory', 'Other']

const STATUS_ORDER = ['REQUESTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'CANCELLED']

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status.replace('_', ' ')}</span>
}

export default function Emergency() {
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    pickup_location: '',
    emergency_contact: profile?.emergency_contact || '',
    request_type: '',
  })

  const fetchRequests = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('ambulance_requests')
      .select('id, pickup_location, emergency_contact, request_type, status, ambulance_id, driver_name, driver_phone, requested_at')
      .eq('patient_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(10)
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchRequests() }, [user?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.pickup_location.trim()) { setFormError('Pickup location is required.'); return }
    setSubmitting(true)
    const { error } = await supabase.from('ambulance_requests').insert({
      patient_id: user.id,
      pickup_location: form.pickup_location.trim(),
      emergency_contact: form.emergency_contact.trim() || null,
      request_type: form.request_type || null,
      status: 'REQUESTED',
    })
    setSubmitting(false)
    if (error) { setFormError('Unable to submit request. Please try again.'); return }

    await insertNotification(supabase, {
      userId: user.id,
      title: 'Ambulance Requested',
      message: 'Your emergency ambulance request has been submitted. Help is on the way.',
    })
    setShowForm(false)
    setSuccessMsg('Your ambulance request has been submitted. Please stay at your pickup location.')
    setForm({ pickup_location: '', emergency_contact: profile?.emergency_contact || '', request_type: '' })
    fetchRequests()
    setTimeout(() => setSuccessMsg(''), 8000)
  }

  const activeRequest = requests.find(r => !['COMPLETED', 'CANCELLED'].includes(r.status))

  return (
    <>
      <div className="page-header">
        <h2>Emergency Center</h2>
        <p>Request emergency ambulance services — available 24/7</p>
      </div>

      {/* Emergency action banner */}
      {!activeRequest && (
        <div className="emergency-card" style={{ marginBottom: '1.5rem' }}>
          <div className="emergency-card-left">
            <div className="emergency-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="emergency-text">
              <h4>Need Emergency Help?</h4>
              <p>Request an ambulance immediately — our team will coordinate dispatch.</p>
            </div>
          </div>
          <button className="btn-emergency" onClick={() => setShowForm(true)}>Request Ambulance</button>
        </div>
      )}

      {successMsg && (
        <div className="alert-success">
          {successMsg}
        </div>
      )}

      {/* Active request tracker */}
      {activeRequest && (
        <div className="card active-emergency" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <h3 className="card-title">Active Request</h3>
            <StatusBadge status={activeRequest.status} />
          </div>
          <div className="profile-summary-grid">
            <div className="profile-field">
              <span className="profile-field-label">Pickup Location</span>
              <span className="profile-field-value">{activeRequest.pickup_location}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Type</span>
              <span className="profile-field-value">{activeRequest.request_type || '—'}</span>
            </div>
            {activeRequest.driver_name && (
              <div className="profile-field">
                <span className="profile-field-label">Driver</span>
                <span className="profile-field-value">{activeRequest.driver_name}</span>
              </div>
            )}
            {activeRequest.driver_phone && (
              <div className="profile-field">
                <span className="profile-field-label">Driver Phone</span>
                <span className="profile-field-value">{activeRequest.driver_phone}</span>
              </div>
            )}
            {activeRequest.ambulance_id && (
              <div className="profile-field">
                <span className="profile-field-label">Ambulance ID</span>
                <span className="profile-field-value">{activeRequest.ambulance_id}</span>
              </div>
            )}
          </div>
          {/* Progress steps — VISUAL-ONLY ADDITION: replaced inline styles with .status-stepper classes */}
          <div className="status-stepper">
            {['REQUESTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'].map((s) => {
              const idx = STATUS_ORDER.indexOf(activeRequest.status)
              const sIdx = STATUS_ORDER.indexOf(s)
              const done = sIdx < idx
              const active = sIdx === idx
              return (
                <div key={s} className={`stepper-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
                  <div className="stepper-dot" />
                  <span className="stepper-label">{s.replace(/_/g, ' ')}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent requests */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Requests</h3>
          {activeRequest && <button className="btn-emergency btn-sm" onClick={() => setShowForm(true)}>New Request</button>}
        </div>
        {loading && <div className="skeleton-line full" />}
        {!loading && requests.length === 0 && (
          <div className="empty-state"><p>No emergency requests yet.</p></div>
        )}
        {!loading && requests.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Location</th><th>Status</th><th>Requested</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td className="td-name">{r.request_type || 'Emergency'}</td>
                  <td>{r.pickup_location}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{timeAgo(r.requested_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Request form modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h3>Request Ambulance</h3>
            {formError && <div className="data-error" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="profile-form-grid">
                <div className="form-group full-width">
                  <label>Pickup Location *</label>
                  <input value={form.pickup_location} onChange={e => setForm(p => ({ ...p, pickup_location: e.target.value }))} placeholder="Enter your exact location / address" required />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="Name and phone" />
                </div>
                <div className="form-group">
                  <label>Type of Emergency</label>
                  <select value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}>
                    <option value="">— Select —</option>
                    {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="alert-emergency-note">
                For life-threatening emergencies, also call national emergency services (112).
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-emergency" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
