import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, insertNotification } from '../../lib/utils'

const TODAY = new Date().toISOString().split('T')[0]

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

function Skeleton() {
  return <div style={{ padding: '1rem' }}>
    <div className="skeleton-line full" /><div className="skeleton-line med" /><div className="skeleton-line short" />
  </div>
}

export default function Appointments() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [facilities, setFacilities] = useState([])
  const [cancelling, setCancelling] = useState(null)

  const [form, setForm] = useState({
    facility_id: '', doctor_name: '', appointment_date: '', appointment_time: '', reason: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchAppointments = async () => {
    if (!user?.id) return
    setLoading(true); setError('')
    const isUpcoming = tab === 'upcoming'
    let q = supabase
      .from('appointments')
      .select('id, doctor_name, appointment_date, appointment_time, status, reason, facilities(name)')
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: isUpcoming })
      .order('appointment_time', { ascending: true })

    if (isUpcoming) {
      q = q.in('status', ['PENDING', 'CONFIRMED']).gte('appointment_date', TODAY)
    } else {
      q = q.in('status', ['COMPLETED', 'CANCELLED'])
    }

    const { data, error: err } = await q.limit(20)
    setLoading(false)
    if (err) { setError('Unable to load appointments.'); return }
    setAppointments(data || [])
  }

  useEffect(() => { fetchAppointments() }, [tab, user?.id])

  useEffect(() => {
    supabase.from('facilities').select('id, name, type').order('name')
      .then(({ data }) => setFacilities(data || []))
  }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    setFormError('')
    const { facility_id, doctor_name, appointment_date, appointment_time, reason } = form
    if (!facility_id || !doctor_name.trim() || !appointment_date || !appointment_time) {
      setFormError('Please fill in all required fields.'); return
    }
    if (appointment_date < TODAY) {
      setFormError('Please select a future date.'); return
    }
    setSubmitting(true)
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: user.id, facility_id, doctor_name: doctor_name.trim(),
      appointment_date, appointment_time, reason: reason.trim() || null, status: 'PENDING',
    })
    setSubmitting(false)
    if (err) { setFormError('Unable to book appointment. Please try again.'); return }

    const fac = facilities.find(f => f.id === facility_id)
    await insertNotification(supabase, {
      userId: user.id,
      title: 'Appointment Requested',
      message: `Your appointment with Dr. ${doctor_name.trim()} at ${fac?.name || 'the facility'} is pending confirmation.`,
    })
    setShowModal(false)
    setForm({ facility_id: '', doctor_name: '', appointment_date: '', appointment_time: '', reason: '' })
    if (tab === 'upcoming') fetchAppointments()
    else setTab('upcoming')
  }

  const handleCancel = async (apptId) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(apptId)
    const { error: err } = await supabase
      .from('appointments').update({ status: 'CANCELLED' }).eq('id', apptId).eq('patient_id', user.id)
    setCancelling(null)
    if (err) { alert('Unable to cancel appointment.'); return }
    setAppointments(prev => prev.filter(a => a.id !== apptId))
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Appointments</h2>
          <p>Manage your medical appointments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Book Appointment</button>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={`tab-btn${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      <div className="card">
        {loading && <Skeleton />}
        {!loading && error && <div className="data-error">{error}</div>}
        {!loading && !error && appointments.length === 0 && (
          <div className="empty-state">
            <p>{tab === 'upcoming' ? 'No upcoming appointments.' : 'No appointment history.'}</p>
          </div>
        )}
        {!loading && !error && appointments.length > 0 && (
          <div className="appointment-list">
            {appointments.map(a => {
              const { day, mon } = formatDate(a.appointment_date)
              return (
                <div className="appointment-item" key={a.id}>
                  <div className="appt-date-block">
                    <div className="appt-date-day">{day}</div>
                    <div className="appt-date-mon">{mon}</div>
                  </div>
                  <div className="appt-info">
                    <div className="appt-doctor">{a.doctor_name}</div>
                    <div className="appt-facility">{a.facilities?.name}</div>
                    {a.reason && <div className="appt-facility" style={{ fontStyle: 'italic' }}>{a.reason}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <StatusBadge status={a.status} />
                    <span className="appt-time">{formatTime(a.appointment_time)}</span>
                    {a.status === 'PENDING' && (
                      <button
                        className="btn-danger" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                        onClick={() => handleCancel(a.id)} disabled={cancelling === a.id}
                      >
                        {cancelling === a.id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>Book Appointment</h3>
            {formError && <div className="data-error" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleBook}>
              <div className="profile-form-grid">
                <div className="form-group full-width">
                  <label>Facility *</label>
                  <select value={form.facility_id} onChange={e => setForm(p => ({ ...p, facility_id: e.target.value }))} required>
                    <option value="">— Select facility —</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input value={form.doctor_name} onChange={e => setForm(p => ({ ...p, doctor_name: e.target.value }))} placeholder="Dr. Name" required />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" min={TODAY} value={form.appointment_date} onChange={e => setForm(p => ({ ...p, appointment_date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input type="time" value={form.appointment_time} onChange={e => setForm(p => ({ ...p, appointment_time: e.target.value }))} required />
                </div>
                <div className="form-group full-width">
                  <label>Reason</label>
                  <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason for visit" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Booking…' : 'Book Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
