import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BLOOD_GROUPS } from '../../lib/utils'

export default function AdminBlood() {
  const [banks, setBanks] = useState([])
  const [inventory, setInventory] = useState([]) // { id, blood_bank_id, blood_group, units_available }
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null) // { id, units_available }
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const [b, inv] = await Promise.all([
      supabase.from('blood_banks').select('id, name, location, phone').order('name'),
      supabase.from('blood_inventory').select('id, blood_bank_id, blood_group, units_available').order('blood_group'),
    ])
    setBanks(b.data || [])
    setInventory(inv.data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const filtered = filter ? inventory.filter(i => i.blood_group === filter) : inventory

  const startEdit = (row) => setEditing({ id: row.id, units: row.units_available })
  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    const units = parseInt(editing.units, 10)
    if (isNaN(units) || units < 0) { alert('Enter a valid non-negative number.'); return }
    setSaving(true)
    const { error } = await supabase.from('blood_inventory').update({ units_available: units }).eq('id', editing.id)
    setSaving(false)
    if (error) { alert('Unable to update inventory.'); return }
    setInventory(prev => prev.map(i => i.id === editing.id ? { ...i, units_available: units } : i))
    setEditing(null)
  }

  const bankMap = Object.fromEntries(banks.map(b => [b.id, b]))

  return (
    <>
      <div className="page-header">
        <h2>Blood Inventory</h2>
        <p>Manage blood unit availability across registered blood banks</p>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
      </div>

      <div className="card">
        {loading && <div className="skeleton-line full" />}
        {!loading && filtered.length === 0 && <div className="empty-state"><p>No inventory data.</p></div>}
        {!loading && filtered.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Blood Bank</th><th>Location</th><th>Blood Group</th><th>Units Available</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const bank = bankMap[row.blood_bank_id]
                const isEditing = editing?.id === row.id
                return (
                  <tr key={row.id}>
                    <td className="td-name">{bank?.name || '—'}</td>
                    <td style={{ fontSize: '0.78rem' }}>{bank?.location || '—'}</td>
                    <td><span className="blood-badge">{row.blood_group}</span></td>
                    <td>
                      {isEditing ? (
                        <input type="number" min="0" value={editing.units}
                          onChange={e => setEditing(p => ({ ...p, units: e.target.value }))}
                          className="inventory-input"
                        />
                      ) : (
                        <span className={row.units_available === 0 ? 'units-none' : row.units_available <= 3 ? 'units-low' : 'units-ok'}>{row.units_available}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="action-row">
                          <button className="btn-primary btn-sm" disabled={saving} onClick={saveEdit}>{saving ? '…' : 'Save'}</button>
                          <button className="btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn-secondary btn-sm" onClick={() => startEdit(row)}>Edit</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
