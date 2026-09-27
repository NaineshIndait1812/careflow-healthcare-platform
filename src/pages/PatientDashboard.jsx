import { useAuth } from '../context/AuthContext'

export default function PatientDashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>CareFlow</h1>
        <div className="dashboard-header-right">
          <span className="role-badge role-patient">Patient</span>
          <button onClick={signOut} className="btn-logout">Sign Out</button>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Patient Dashboard</h2>
        <p className="dashboard-welcome">
          Welcome, <strong>{profile?.full_name || 'Patient'}</strong> — authentication successful.
        </p>
        <div className="dashboard-info">
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
        </div>
        <p className="dashboard-placeholder">
          Dashboard features will be implemented in the next steps.
        </p>
      </main>
    </div>
  )
}
