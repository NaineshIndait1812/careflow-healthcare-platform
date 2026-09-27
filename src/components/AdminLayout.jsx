import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/patient.css'

function Icon({ d, d2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />{d2 && <path d={d2} />}
    </svg>
  )
}

const NAV = [
  { to: '/admin',            label: 'Dashboard',     end: true,  emoji: '📊' },
  { to: '/admin/appointments', label: 'Appointments', emoji: '📅' },
  { to: '/admin/emergency',  label: 'Emergency',     emoji: '🚑' },
  { to: '/admin/blood',      label: 'Blood Inventory', emoji: '🩸' },
  { to: '/admin/facilities', label: 'Facilities',    emoji: '🏥' },
  { to: '/admin/patients',   label: 'Patients',      emoji: '👥' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/login', { replace: true }) }
  const initials = profile?.full_name?.trim().charAt(0).toUpperCase() || 'A'

  return (
    <div className="admin-shell">
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <h1>CareFlow Admin</h1>
        <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Toggle nav">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo admin-sidebar-logo">
          <h1>CareFlow</h1>
          <span style={{ color: '#ffa726' }}>Admin Portal</span>
        </div>
        <nav className="sidebar-nav">
          <p className="nav-section-label">Management</p>
          {NAV.map(({ to, label, end, emoji }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <span style={{ fontSize: '0.95rem' }}>{emoji}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #e65100, #ffa726)' }}>{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.full_name || 'Admin'}</div>
              <div className="sidebar-user-role" style={{ color: '#7a5020' }}>Administrator</div>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignOut}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
