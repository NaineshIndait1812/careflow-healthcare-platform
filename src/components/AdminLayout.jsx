import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'
import '../styles/patient.css'

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

function IconHospital() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
      <path d="M9 21v-6h6v6"/>
      <path d="M10 9h4M12 7v4"/>
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

const NAV = [
  { to: '/admin',              label: 'Dashboard',        end: true, icon: <IconHome /> },
  { to: '/admin/appointments', label: 'Appointments',     icon: <IconCalendar /> },
  { to: '/admin/emergency',    label: 'Emergency',        icon: <IconAmbulance />, emergency: true },
  { to: '/admin/blood',        label: 'Blood Inventory',  icon: <IconDroplet /> },
  { to: '/admin/facilities',   label: 'Facilities',       icon: <IconHospital /> },
  { to: '/admin/patients',     label: 'Patients',         icon: <IconUsers /> },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/login', { replace: true }) }
  const initials = profile?.full_name?.trim().charAt(0).toUpperCase() || 'A'

  return (
    <div className="admin-shell">
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <BrandMark size={28} />
          <h1>Care<span>Flow</span></h1>
        </div>
        <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Toggle nav">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><BrandMark size={22} /></div>
          <div className="sidebar-logo-text">
            <h1>Care<span>Flow</span></h1>
            <small>Admin Portal</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          <p className="nav-section-label">Management</p>
          {NAV.map(({ to, label, end, icon, emergency }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${emergency ? ' nav-emergency' : ''}${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {icon}{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar admin-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.full_name || 'Admin'}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignOut}>
            <IconLogout />
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
