import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/patient.css'

// ── SVG icons (inline, no extra dependencies) ──────────────────────────────

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function IconAmbulance() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>
      <path d="M14 3h7l1 4-3 5h-5V3z"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
      <line x1="13" y1="8" x2="13" y2="12"/>
      <line x1="11" y1="10" x2="15" y2="10"/>
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ── Nav items config ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/patient',              label: 'Dashboard',       icon: <IconHome />,       end: true },
  { to: '/patient/appointments', label: 'Appointments',    icon: <IconCalendar /> },
  { to: '/patient/emergency',    label: 'Emergency',       icon: <IconAmbulance /> },
  { to: '/patient/blood',        label: 'Blood Availability', icon: <IconDroplet /> },
  { to: '/patient/facilities',   label: 'Facilities',      icon: <IconMapPin /> },
  { to: '/patient/notifications',label: 'Notifications',   icon: <IconBell /> },
  { to: '/patient/profile',      label: 'Profile',         icon: <IconUser /> },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function PatientLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const closeSidebar = () => setSidebarOpen(false)

  // First letter of name for avatar
  const initials = profile?.full_name
    ? profile.full_name.trim().charAt(0).toUpperCase()
    : '?'

  return (
    <div className="patient-shell">
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <h1>CareFlow</h1>
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* ── Sidebar overlay (mobile) ── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Patient navigation">
        <div className="sidebar-logo">
          <h1>CareFlow</h1>
          <span>Patient Portal</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="nav-section-label">Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.full_name || 'Patient'}</div>
              <div className="sidebar-user-role">Patient</div>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignOut}>
            <IconLogout />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="patient-main">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
