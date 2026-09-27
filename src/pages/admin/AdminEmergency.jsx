import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { timeAgo, insertNotification } from '../../lib/utils'

const STATUSES = ['', 'REQUESTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'CANCELLED']
const NEXT_STATUS = { REQUESTED: 'ASSIGNED', ASSIGNED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED', ARRIVED: 'COMPLETED' }

export default function AdminEmergency() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [assignModal, setAssignModal] = useState(null) // request being assigned
  const [assignForm, setAssignForm] = useState({ ambulance_id: '', driver_name: '', driver_phone: '' })

  const fetch = async () => {
    setLoading(true)
    let q = supabase
      .from('ambulance_requests')
      .select('id, patient_id, pickup_location, emergency_contact, request_type, ambulance_id, driver_name, driver_phone, status, requested_at, profiles(full_name, phone)')
      .order('requested_at', { ascending: false })
      .limit(50)
    if (filter) q = q.eq('status', filter)
    const { data } = await q
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [filter])

  const advance = async (req) => {
    const next = NEXT_STATUS[req.status]
    if (!next) return
    if (req.status === 'REQUESTED') { setAssignModal(req); return }
    setUpdating(req.id)
    await supabase.from('ambulance_requests').update({ status: next }).eq('id', req.id)
    const msgs = {
      ON_THE_WAY: 'Your ambulance is on the way.',
      ARRIVED: 'The ambulance has arrived at your location.',
      COMPLETED: 'Your ambulance request has been completed.',
    }
    if (msgs[next]) {
      await insertNotification(supabase, { userId: req.patient_id, title: `Ambulance ${next.replace('_', ' ')}`, message: msgs[next] })
    }
    setUpdating(null)
    fetch()
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    const req = assignModal
    const { ambulance_id, driver_name, driver_phone } = assignForm
    if (!ambulance_id.trim() || !driver_name.trim()) { alert('Ambulance ID and Driver Name required.'); return }
    setUpdating(req.id)
    await supabase.from('ambulance_requests').update({
      status: 'ASSIGNED', ambulance_id: ambulance_id.trim(),
      driver_name: driver_name.trim(), driver_phone: driver_phone.trim() || null,
    }).eq('id', req.id)
    await insertNotification(supabase, {
      userId: req.patient_id,
      title: 'Ambulance Assigned',
      message: `An ambulance (${ambulance_id.trim()}) has been assigned to your request. Driver: ${driver_name.trim()}.`,
    })
    setUpdating(null)
    setAssignModal(null)
    setAssignForm({ ambulance_id: '', driver_name: '', driver_phone: '' })
    fetch()
  }

  const cancel = async (req) => {
    if (!window.confirm('Cancel this request?')) return
    setUpdating(req.id)
    await supabase.from('ambulance_requests').update({ status: 'CANCELLED' }).eq('id', req.id)
    setUpdating(null)
    fetch()
  }

  return (
    <>
      <div className="page-header">
        <h2>Emergency Requests</h2>
        <p>Manage ambulance requests and dispatch coordination</p>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="card">
        {loading && <div className="skeleton-line full" />}
        {!loading && requests.length === 0 && <div className="empty-state"><p>No ambulance requests.</p></div>}
        {!loading && requests.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Location</th><th>Type</th><th>Driver / Ambulance</th><th>Status</th><th>Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="td-name">{r.profiles?.full_name || '—'}</div>
                    <div className="td-sub">{r.emergency_contact || r.profiles?.phone || ''}</div>
                  </td>
                  <td style={{ maxWidth: '160px' }}>{r.pickup_location}</td>
                  <td>{r.request_type || '—'}</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {r.driver_name ? <><div>{r.driver_name}</div><div className="td-sub">{r.ambulance_id} · {r.driver_phone}</div></> : '—'}
                  </td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status.replace('_', ' ')}</span></td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{timeAgo(r.requested_at)}</td>
                  <td>
                    {updating === r.id ? <span className="updating-text">Updating…</span> : (
                      <div className="action-row">
                        {NEXT_STATUS[r.status] && (
                          <button className="btn-primary btn-sm" onClick={() => advance(r)}>
                            {r.status === 'REQUESTED' ? 'Assign' : `→ ${NEXT_STATUS[r.status].replace('_', ' ')}`}
                          </button>
                        )}
                        {!['COMPLETED', 'CANCELLED'].includes(r.status) && (
                          <button className="btn-danger btn-sm" onClick={() => cancel(r)}>Cancel</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {assignModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div className="modal">
            <h3>Assign Ambulance</h3>
            <p className="modal-lead">Patient: <strong>{assignModal.profiles?.full_name}</strong> · {assignModal.pickup_location}</p>
            <form onSubmit={handleAssign}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Ambulance ID *</label>
                  <input value={assignForm.ambulance_id} onChange={e => setAssignForm(p => ({ ...p, ambulance_id: e.target.value }))} placeholder="e.g. AMB-001" required />
                </div>
                <div className="form-group">
                  <label>Driver Name *</label>
                  <input value={assignForm.driver_name} onChange={e => setAssignForm(p => ({ ...p, driver_name: e.target.value }))} placeholder="Driver full name" required />
                </div>
                <div className="form-group full-width">
                  <label>Driver Phone</label>
                  <input value={assignForm.driver_phone} onChange={e => setAssignForm(p => ({ ...p, driver_phone: e.target.value }))} placeholder="+91-9XXXXXXXXX" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setAssignModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Assign Ambulance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
