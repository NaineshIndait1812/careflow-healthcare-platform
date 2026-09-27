import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, insertNotification } from '../../lib/utils'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

function Badge({ s }) { return <span className={`status-badge status-${s}`}>{s}</span> }

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const fetch = async () => {
    setLoading(true)
    let q = supabase
      .from('appointments')
      .select('id, doctor_name, appointment_date, appointment_time, status, reason, patient_id, profiles(full_name, email), facilities(name)')
      .order('appointment_date', { ascending: false })
      .limit(50)
    if (filter) q = q.eq('status', filter)
    const { data, error: err } = await q
    setLoading(false)
    if (err) { setError('Unable to load appointments.'); return }
    setAppointments(data || [])
  }

  useEffect(() => { fetch() }, [filter])

  const update = async (appt, newStatus) => {
    setUpdating(appt.id)
    const { error: err } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appt.id)
    setUpdating(null)
    if (err) { alert('Unable to update status.'); return }

    const msgs = {
      CONFIRMED: `Your appointment with ${appt.doctor_name} at ${appt.facilities?.name} has been confirmed.`,
      CANCELLED: `Your appointment with ${appt.doctor_name} at ${appt.facilities?.name} has been cancelled.`,
      COMPLETED: `Your appointment with ${appt.doctor_name} has been marked as completed.`,
    }
    if (msgs[newStatus]) {
      await insertNotification(supabase, {
        userId: appt.patient_id,
        title: `Appointment ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`,
        message: msgs[newStatus],
      })
    }
    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: newStatus } : a))
  }

  const actions = (appt) => {
    if (appt.status === 'PENDING') return (
      <div className="action-row">
        <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} disabled={updating === appt.id} onClick={() => update(appt, 'CONFIRMED')}>Confirm</button>
        <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} disabled={updating === appt.id} onClick={() => update(appt, 'CANCELLED')}>Cancel</button>
      </div>
    )
    if (appt.status === 'CONFIRMED') return (
      <div className="action-row">
        <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} disabled={updating === appt.id} onClick={() => update(appt, 'COMPLETED')}>Complete</button>
        <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} disabled={updating === appt.id} onClick={() => update(appt, 'CANCELLED')}>Cancel</button>
      </div>
    )
    return <Badge s={appt.status} />
  }

  return (
    <>
      <div className="page-header">
        <h2>Appointments</h2>
        <p>View and manage all patient appointments</p>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="card">
        {loading && <div className="skeleton-line full" />}
        {!loading && error && <div className="data-error">{error}</div>}
        {!loading && !error && appointments.length === 0 && <div className="empty-state"><p>No appointments found.</p></div>}
        {!loading && !error && appointments.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Facility</th><th>Date / Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="td-name">{a.profiles?.full_name || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#3a5060' }}>{a.profiles?.email}</div>
                  </td>
                  <td>{a.doctor_name}</td>
                  <td>{a.facilities?.name || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(a.appointment_date).full}<br />
                    <span style={{ fontSize: '0.75rem', color: '#3a5060' }}>{formatTime(a.appointment_time)}</span>
                  </td>
                  <td><Badge s={a.status} /></td>
                  <td>{updating === a.id ? <span style={{ color: '#4fc3f7', fontSize: '0.75rem' }}>Updating…</span> : actions(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
