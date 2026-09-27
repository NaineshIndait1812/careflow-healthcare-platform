import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BLOOD_GROUPS } from '../../lib/utils'

export default function Blood() {
  const [selected, setSelected] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const search = async (group) => {
    setLoading(true); setError(''); setSearched(true)
    const { data, error: err } = await supabase
      .from('blood_banks')
      .select(`id, name, location, phone, operating_hours, blood_inventory(blood_group, units_available)`)
      .order('name')
    setLoading(false)
    if (err) { setError('Unable to load blood availability. Please try again.'); return }

    const filtered = (data || []).map(bank => ({
      ...bank,
      inventory: group
        ? bank.blood_inventory.filter(i => i.blood_group === group)
        : bank.blood_inventory,
    })).filter(bank => bank.inventory.length > 0)

    setResults(filtered)
  }

  const handleSelect = (bg) => {
    const next = bg === selected ? '' : bg
    setSelected(next)
    search(next)
  }

  // Load all on mount
  useEffect(() => { search('') }, [])

  return (
    <>
      <div className="page-header">
        <h2>Blood Availability</h2>
        <p>Check platform blood inventory at registered blood banks · Demo data only</p>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="card-title">Filter by Blood Group</h3>
          {selected && <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setSelected(''); search('') }}>Clear filter</button>}
        </div>
        <div className="blood-groups-grid">
          {BLOOD_GROUPS.map(bg => (
            <button key={bg} className={`blood-group-btn${selected === bg ? ' selected' : ''}`} onClick={() => handleSelect(bg)}>{bg}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card"><div className="skeleton-line full" /><div className="skeleton-line med" /></div>
      )}

      {!loading && error && <div className="data-error">{error}</div>}

      {!loading && !error && results.length === 0 && searched && (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <p>{selected ? `No ${selected} blood available at registered banks.` : 'No blood bank data available.'}</p>
        </div>
      )}

      {!loading && !error && results.map(bank => (
        <div className="blood-result-card" key={bank.id}>
          <div className="blood-result-header">
            <div>
              <div className="blood-result-name">🩸 {bank.name}</div>
              <div className="blood-result-meta">📍 {bank.location} · 📞 {bank.phone || 'N/A'} · 🕐 {bank.operating_hours || 'N/A'}</div>
            </div>
          </div>
          <div className="blood-units-row">
            {bank.inventory.map(inv => {
              const cls = inv.units_available === 0 ? 'none' : inv.units_available <= 3 ? 'low' : 'available'
              return (
                <span key={inv.blood_group} className={`blood-unit-chip ${cls}`}>
                  {inv.blood_group}: {inv.units_available} unit{inv.units_available !== 1 ? 's' : ''}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
