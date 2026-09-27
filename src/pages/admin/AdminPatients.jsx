import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, email, phone, blood_group, emergency_contact, created_at')
      .eq('role', 'PATIENT').order('created_at', { ascending: false })
      .then(({ data }) => { setPatients(data || []); setLoading(false) })
  }, [])

  const displayed = search.trim()
    ? patients.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search)
      )
    : patients

  return (
    <>
      <div className="page-header">
        <h2>Patients</h2>
        <p>Registered patients on the platform</p>
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone…" style={{ flex: 1 }} />
        <span className="filter-count">{displayed.length} patient{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card">
        {loading && <div className="skeleton-line full" />}
        {!loading && displayed.length === 0 && <div className="empty-state"><p>No patients found.</p></div>}
        {!loading && displayed.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Blood Group</th><th>Emergency Contact</th><th>Registered</th></tr>
            </thead>
            <tbody>
              {displayed.map(p => (
                <tr key={p.id}>
                  <td className="td-name">{p.full_name || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.blood_group ? <span className="blood-badge">{p.blood_group}</span> : <span className="muted">—</span>}</td>
                  <td>{p.emergency_contact || '—'}</td>
                  <td className="td-sub">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
