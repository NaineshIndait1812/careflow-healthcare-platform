import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

// ── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(dateStr) {
  if (!dateStr) return { day: '--', mon: '---' }
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.getDate(),
    mon: d.toLocaleString('default', { month: 'short' }),
    full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const FACILITY_EMOJI = {
  HOSPITAL: '🏥',
  CLINIC: '🏨',
  DIAGNOSTIC_CENTER: '🔬',
  BLOOD_BANK: '🩸',
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function IconAlertCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function IconDroplet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div>
      <div className="skeleton-line full" />
      <div className="skeleton-line med" />
      <div className="skeleton-line short" />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProfileSummaryCard({ profile }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">My Profile</h3>
        <Link to="/patient/profile" className="card-action-link">Edit →</Link>
      </div>
      <div className="profile-summary-grid">
        <div className="profile-field">
          <span className="profile-field-label">Full Name</span>
          <span className="profile-field-value">{profile?.full_name || '—'}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Email</span>
          <span className="profile-field-value">{profile?.email || '—'}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Phone</span>
          <span className={`profile-field-value${!profile?.phone ? ' empty' : ''}`}>
            {profile?.phone || 'Not set'}
          </span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Blood Group</span>
          <span className="profile-field-value">
            {profile?.blood_group
              ? <span className="blood-badge">{profile.blood_group}</span>
              : <span className="profile-field-value empty">Not set</span>}
          </span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Emergency Contact</span>
          <span className={`profile-field-value${!profile?.emergency_contact ? ' empty' : ''}`}>
            {profile?.emergency_contact || 'Not set'}
          </span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Gender</span>
          <span className={`profile-field-value${!profile?.gender ? ' empty' : ''}`}>
            {profile?.gender || 'Not set'}
          </span>
        </div>
      </div>
    </div>
  )
}

function AppointmentsCard({ appointments, loading, error }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Upcoming Appointments</h3>
        <Link to="/patient/appointments" className="card-action-link">View all →</Link>
      </div>

      {loading && <CardSkeleton />}

      {!loading && error && (
        <div className="data-error">
          <IconAlertCircle />
          Unable to load appointments. Please try again later.
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="empty-state">
          <IconCalendar />
          <p>No upcoming appointments</p>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="appointment-list">
          {appointments.map((appt) => {
            const { day, mon } = formatDate(appt.appointment_date)
            return (
              <div className="appointment-item" key={appt.id}>
                <div className="appt-date-block">
                  <div className="appt-date-day">{day}</div>
                  <div className="appt-date-mon">{mon}</div>
                </div>
                <div className="appt-info">
                  <div className="appt-doctor">{appt.doctor_name}</div>
                  <div className="appt-facility">
                    {appt.facilities?.name || 'Unknown facility'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                  <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                  <span className="appt-time">{formatTime(appt.appointment_time)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FacilitiesCard({ facilities, loading, error }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Nearby Facilities</h3>
        <Link to="/patient/facilities" className="card-action-link">View all →</Link>
      </div>

      {loading && <CardSkeleton />}

      {!loading && error && (
        <div className="data-error">
          <IconAlertCircle />
          Unable to load facilities.
        </div>
      )}

      {!loading && !error && facilities.length === 0 && (
        <div className="empty-state">
          <IconMapPin />
          <p>No facilities found</p>
        </div>
      )}

      {!loading && !error && facilities.length > 0 && (
        <div className="facility-list">
          {facilities.map((f) => (
            <div className="facility-item" key={f.id}>
              <div className={`facility-icon ${f.type}`}>
                {FACILITY_EMOJI[f.type] || '🏢'}
              </div>
              <div className="facility-info">
                <div className="facility-name">{f.name}</div>
                <div className="facility-meta">
                  {f.type.replace('_', ' ')} · {f.phone || 'No phone'}
                </div>
              </div>
              {f.emergency_available && (
                <span className="facility-emergency">24/7 Emergency</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationsCard({ notifications, loading, error }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Notifications</h3>
        <Link to="/patient/notifications" className="card-action-link">View all →</Link>
      </div>

      {loading && <CardSkeleton />}

      {!loading && error && (
        <div className="data-error">
          <IconAlertCircle />
          Unable to load notifications.
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p>No new notifications</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notification-list">
          {notifications.map((n) => (
            <div className={`notification-item${!n.read ? ' unread' : ''}`} key={n.id}>
              <div className={`notification-dot${n.read ? ' read' : ''}`} />
              <div className="notification-body">
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-time">{timeAgo(n.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, profile } = useAuth()

  const [appointments, setAppointments] = useState([])
  const [apptLoading, setApptLoading] = useState(true)
  const [apptError, setApptError] = useState(false)

  const [facilities, setFacilities] = useState([])
  const [facilLoading, setFacilLoading] = useState(true)
  const [facilError, setFacilError] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(true)
  const [notifError, setNotifError] = useState(false)

  // Fetch upcoming appointments (PENDING + CONFIRMED, soonest first, limit 4)
  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    async function fetchAppointments() {
      setApptLoading(true)
      setApptError(false)

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('appointments')
        .select('id, doctor_name, appointment_date, appointment_time, status, reason, facilities(name)')
        .eq('patient_id', user.id)
        .in('status', ['PENDING', 'CONFIRMED'])
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(4)

      if (cancelled) return

      if (error) {
        console.error('appointments fetch:', error.message)
        setApptError(true)
      } else {
        setAppointments(data || [])
      }
      setApptLoading(false)
    }

    fetchAppointments()
    return () => { cancelled = true }
  }, [user?.id])

  // Fetch facilities (limit 4, emergency-available first)
  useEffect(() => {
    let cancelled = false

    async function fetchFacilities() {
      setFacilLoading(true)
      setFacilError(false)

      const { data, error } = await supabase
        .from('facilities')
        .select('id, name, type, phone, address, emergency_available')
        .order('emergency_available', { ascending: false })
        .limit(4)

      if (cancelled) return

      if (error) {
        console.error('facilities fetch:', error.message)
        setFacilError(true)
      } else {
        setFacilities(data || [])
      }
      setFacilLoading(false)
    }

    fetchFacilities()
    return () => { cancelled = true }
  }, [])

  // Fetch recent notifications (latest 5)
  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    async function fetchNotifications() {
      setNotifLoading(true)
      setNotifError(false)

      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (cancelled) return

      if (error) {
        console.error('notifications fetch:', error.message)
        setNotifError(true)
      } else {
        setNotifications(data || [])
      }
      setNotifLoading(false)
    }

    fetchNotifications()
    return () => { cancelled = true }
  }, [user?.id])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <>
      {/* Greeting */}
      <div className="greeting-banner">
        <div className="greeting-text">
          <h3>{getGreeting()}, {firstName}</h3>
          <p>Here's an overview of your healthcare activity.</p>
        </div>
        <span className="greeting-badge">Patient</span>
      </div>

      {/* Quick actions */}
      <p className="section-title">Quick Actions</p>
      <div className="quick-actions-grid">
        <Link to="/patient/appointments" className="quick-action-card">
          <div className="qa-icon teal"><IconCalendar /></div>
          <span className="qa-label">Book Appointment</span>
          <span className="qa-desc">Schedule a visit with a doctor or clinic</span>
        </Link>

        <Link to="/patient/emergency" className="quick-action-card emergency">
          <div className="qa-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="qa-label">Emergency Help</span>
          <span className="qa-desc">Request an ambulance or urgent care</span>
        </Link>

        <Link to="/patient/blood" className="quick-action-card">
          <div className="qa-icon red"><IconDroplet /></div>
          <span className="qa-label">Find Blood</span>
          <span className="qa-desc">Check blood availability near you</span>
        </Link>

        <Link to="/patient/facilities" className="quick-action-card">
          <div className="qa-icon green"><IconMapPin /></div>
          <span className="qa-label">Healthcare Facilities</span>
          <span className="qa-desc">Hospitals, clinics, and diagnostic centers</span>
        </Link>
      </div>

      {/* Emergency banner */}
      <div className="emergency-card" style={{ marginBottom: '1.25rem' }}>
        <div className="emergency-card-left">
          <div className="emergency-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="emergency-text">
            <h4>Medical Emergency?</h4>
            <p>Request an ambulance immediately — available 24/7</p>
          </div>
        </div>
        <Link to="/patient/emergency" className="btn-emergency">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Emergency Help
        </Link>
      </div>

      {/* Profile + Appointments row */}
      <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>
        <ProfileSummaryCard profile={profile} />
        <AppointmentsCard
          appointments={appointments}
          loading={apptLoading}
          error={apptError}
        />
      </div>

      {/* Blood availability + Facilities row */}
      <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>
        {/* Blood availability */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Blood Availability</h3>
          </div>
          <div className="blood-card">
            <div className="blood-card-left">
              <h4>Need Blood?</h4>
              <p>Check real-time blood unit availability at local blood banks and hospitals.</p>
            </div>
            <Link to="/patient/blood" className="btn-primary">
              <IconDroplet />
              Check Availability
            </Link>
          </div>
        </div>

        <NotificationsCard
          notifications={notifications}
          loading={notifLoading}
          error={notifError}
        />
      </div>

      {/* Facilities full-width */}
      <FacilitiesCard
        facilities={facilities}
        loading={facilLoading}
        error={facilError}
      />
    </>
  )
}
