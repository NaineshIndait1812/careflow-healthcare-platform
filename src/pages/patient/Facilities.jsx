import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FACILITY_EMOJI } from '../../lib/utils'

const TYPES = ['HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'BLOOD_BANK']

export default function Facilities() {
  const [facilities, setFacilities] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    supabase.from('facilities')
      .select('id, name, type, address, phone, operating_hours, emergency_available')
      .order('emergency_available', { ascending: false })
      .order('name')
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) { setError('Unable to load facilities.'); return }
        setFacilities(data || [])
        setFiltered(data || [])
      })
  }, [])

  useEffect(() => {
    let list = facilities
    if (typeFilter) list = list.filter(f => f.type === typeFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q))
    }
    setFiltered(list)
  }, [search, typeFilter, facilities])

  return (
    <>
      <div className="page-header">
        <h2>Healthcare Facilities</h2>
        <p>Find hospitals, clinics, and diagnostic centers</p>
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or address…" style={{ flex: 1, minWidth: '200px' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        {(search || typeFilter) && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setTypeFilter('') }}>Clear</button>
        )}
      </div>

      {loading && <div className="card"><div className="skeleton-line full" /><div className="skeleton-line med" /></div>}
      {!loading && error && <div className="data-error">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state"><p>No facilities match your search.</p></div>
      )}

      {!loading && !error && filtered.map(f => (
        <div className="card" key={f.id} style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className={`facility-icon ${f.type}`} style={{ width: '42px', height: '42px', fontSize: '1.2rem', flexShrink: 0 }}>
              {FACILITY_EMOJI[f.type] || '🏢'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#c8dcea', fontSize: '0.95rem' }}>{f.name}</span>
                <span className="status-badge" style={{ background: 'rgba(79,195,247,0.08)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.2)' }}>{f.type.replace('_', ' ')}</span>
                {f.emergency_available && <span className="facility-emergency">24/7 Emergency</span>}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4a6070', marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <span>📍 {f.address}</span>
                {f.phone && <span>📞 {f.phone}</span>}
                {f.operating_hours && <span>🕐 {f.operating_hours}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
