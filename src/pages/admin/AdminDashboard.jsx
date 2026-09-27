import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatDate, formatTime, timeAgo } from '../../lib/utils'

function StatCard({ label, value, sub, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({})
  const [recentAppts, setRecentAppts] = useState([])
  const [recentEmergency, setRecentEmergency] = useState([])
  const [bloodSummary, setBloodSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    async function load() {
      const [patients, todayAppts, pendingAppts, pendingAmb, appts, emerg, blood] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'PATIENT'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('appointment_date', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('ambulance_requests').select('id', { count: 'exact', head: true }).eq('status', 'REQUESTED'),
        supabase.from('appointments').select('id, doctor_name, appointment_date, appointment_time, status, profiles(full_name), facilities(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('ambulance_requests').select('id, patient_id, pickup_location, request_type, status, requested_at, profiles(full_name)').order('requested_at', { ascending: false }).limit(5),
        supabase.from('blood_inventory').select('blood_group, units_available').order('blood_group'),
      ])
      setStats({
        patients: patients.count ?? 0,
        todayAppts: todayAppts.count ?? 0,
        pendingAppts: pendingAppts.count ?? 0,
        pendingAmb: pendingAmb.count ?? 0,
      })
      setRecentAppts(appts.data || [])
      setRecentEmergency(emerg.data || [])

      // Aggregate blood totals
      const totals = {}
      for (const row of (blood.data || [])) {
        totals[row.blood_group] = (totals[row.blood_group] || 0) + row.units_available
      }
      setBloodSummary(Object.entries(totals))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'} — platform overview</p>
      </div>

      {loading ? (
        <div><div className="skeleton-line full" /><div className="skeleton-line med" /></div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Patients" value={stats.patients} sub="Registered" color="blue" />
            <StatCard label="Today's Appointments" value={stats.todayAppts} sub={new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} color="green" />
            <StatCard label="Pending Appointments" value={stats.pendingAppts} sub="Awaiting confirmation" color="amber" />
            <StatCard label="Active Emergency" value={stats.pendingAmb} sub="Requested ambulances" color="red" />
          </div>

          <div className="dashboard-grid">
            {/* Recent appointments */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Appointments</h3>
                <Link to="/admin/appointments" className="card-action-link">Manage →</Link>
              </div>
              {recentAppts.length === 0 ? <div className="empty-state"><p>No appointments yet.</p></div> : (
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentAppts.map(a => (
                      <tr key={a.id}>
                        <td className="td-name">{a.profiles?.full_name || '—'}</td>
                        <td>{a.doctor_name}</td>
                        <td>{formatDate(a.appointment_date).full}</td>
                        <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent emergency */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Emergency Requests</h3>
                <Link to="/admin/emergency" className="card-action-link">Manage →</Link>
              </div>
              {recentEmergency.length === 0 ? <div className="empty-state"><p>No requests.</p></div> : (
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Type</th><th>Status</th><th>Time</th></tr></thead>
                  <tbody>
                    {recentEmergency.map(r => (
                      <tr key={r.id}>
                        <td className="td-name">{r.profiles?.full_name || '—'}</td>
                        <td>{r.request_type || 'Emergency'}</td>
                        <td><span className={`status-badge status-${r.status}`}>{r.status.replace('_', ' ')}</span></td>
                        <td>{timeAgo(r.requested_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Blood summary */}
          {bloodSummary.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Blood Inventory Summary</h3>
                <Link to="/admin/blood" className="card-action-link">Manage →</Link>
              </div>
              <div className="blood-units-row">
                {bloodSummary.map(([bg, units]) => (
                  <span key={bg} className={`blood-unit-chip ${units === 0 ? 'none' : units <= 5 ? 'low' : 'available'}`}>
                    {bg}: {units}u
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
