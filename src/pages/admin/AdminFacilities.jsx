import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FACILITY_EMOJI } from '../../lib/utils'

const TYPES = ['HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'BLOOD_BANK']
const BLANK = { name: '', type: 'HOSPITAL', address: '', phone: '', operating_hours: '', emergency_available: false }

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // null = add, object = edit
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')

  const fetch = async () => {
    const { data } = await supabase.from('facilities').select('*').order('name')
    setFacilities(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setEditing(null); setForm(BLANK); setFormError(''); setShowModal(true) }
  const openEdit = (f) => { setEditing(f); setForm({ name: f.name, type: f.type, address: f.address, phone: f.phone || '', operating_hours: f.operating_hours || '', emergency_available: f.emergency_available }); setFormError(''); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.address.trim()) { setFormError('Name and address are required.'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), type: form.type, address: form.address.trim(), phone: form.phone.trim() || null, operating_hours: form.operating_hours.trim() || null, emergency_available: form.emergency_available }
    let error
    if (editing) {
      ({ error } = await supabase.from('facilities').update(payload).eq('id', editing.id))
    } else {
      ({ error } = await supabase.from('facilities').insert(payload))
    }
    setSaving(false)
    if (error) { setFormError('Unable to save facility. Please try again.'); return }
    setShowModal(false)
    fetch()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this facility? This may fail if appointments reference it.')) return
    const { error } = await supabase.from('facilities').delete().eq('id', id)
    if (error) { alert('Cannot delete: facility is referenced by existing appointments.'); return }
    setFacilities(prev => prev.filter(f => f.id !== id))
  }

  const displayed = search.trim()
    ? facilities.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.type.includes(search.toUpperCase()))
    : facilities

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><h2>Facilities</h2><p>Manage healthcare facilities on the platform</p></div>
        <button className="btn-primary" onClick={openAdd}>+ Add Facility</button>
      </div>

      <div className="filter-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities…" />
      </div>

      <div className="card">
        {loading && <div className="skeleton-line full" />}
        {!loading && displayed.length === 0 && <div className="empty-state"><p>No facilities found.</p></div>}
        {!loading && displayed.length > 0 && (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Address</th><th>Phone</th><th>Hours</th><th>24/7</th><th>Actions</th></tr></thead>
            <tbody>
              {displayed.map(f => (
                <tr key={f.id}>
                  <td className="td-name">{FACILITY_EMOJI[f.type]} {f.name}</td>
                  <td><span className="status-badge" style={{ background: 'rgba(79,195,247,0.08)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.2)' }}>{f.type.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: '0.78rem', maxWidth: '150px' }}>{f.address}</td>
                  <td style={{ fontSize: '0.78rem' }}>{f.phone || '—'}</td>
                  <td style={{ fontSize: '0.78rem' }}>{f.operating_hours || '—'}</td>
                  <td>{f.emergency_available ? <span className="facility-emergency">Yes</span> : <span style={{ color: '#2e4050', fontSize: '0.75rem' }}>No</span>}</td>
                  <td>
                    <div className="action-row">
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.65rem' }} onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn-danger" style={{ fontSize: '0.7rem', padding: '0.3rem 0.65rem' }} onClick={() => handleDelete(f.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3>{editing ? 'Edit Facility' : 'Add Facility'}</h3>
            {formError && <div className="data-error" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Address *</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Operating Hours</label>
                  <input value={form.operating_hours} onChange={e => setForm(p => ({ ...p, operating_hours: e.target.value }))} placeholder="e.g. 8AM–8PM" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
                    <input type="checkbox" checked={form.emergency_available} onChange={e => setForm(p => ({ ...p, emergency_available: e.target.checked }))} style={{ width: 'auto', padding: 0, background: 'none', border: 'none' }} />
                    24/7 Emergency Available
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Facility'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
