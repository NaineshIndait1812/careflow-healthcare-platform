import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function formatMemberSince(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
  })

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name:         profile.full_name         || '',
        phone:             profile.phone             || '',
        date_of_birth:     profile.date_of_birth     || '',
        gender:            profile.gender            || '',
        blood_group:       profile.blood_group       || '',
        address:           profile.address           || '',
        emergency_contact: profile.emergency_contact || '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear status messages when user edits
    setSaveSuccess(false)
    setSaveError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    const trimmed = {
      full_name:         form.full_name.trim(),
      phone:             form.phone.trim() || null,
      date_of_birth:     form.date_of_birth || null,
      gender:            form.gender || null,
      blood_group:       form.blood_group || null,
      address:           form.address.trim() || null,
      emergency_contact: form.emergency_contact.trim() || null,
    }

    if (!trimmed.full_name) {
      setSaveError('Full name is required.')
      return
    }

    setSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    const { error } = await supabase
      .from('profiles')
      .update(trimmed)
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('profile update error:', error.message)
      setSaveError('Unable to save changes. Please try again.')
    } else {
      setSaveSuccess(true)
      // Refresh profile in AuthContext so sidebar name updates
      await refreshProfile()
      // Auto-clear success message after 3 s
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const initials = form.full_name
    ? form.full_name.trim().charAt(0).toUpperCase()
    : '?'

  return (
    <>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>View and update your personal information</p>
      </div>

      <div className="profile-page-grid">
        {/* ── Left: Avatar card ── */}
        <div className="card profile-avatar-card">
          <div className="profile-avatar-large" aria-hidden="true">{initials}</div>
          <div className="profile-avatar-name">{form.full_name || 'Patient'}</div>
          <div className="profile-avatar-email">{profile?.email}</div>
          {profile?.blood_group && (
            <span className="blood-badge">{profile.blood_group}</span>
          )}
          {profile?.created_at && (
            <div className="profile-avatar-since">
              Member since {formatMemberSince(profile.created_at)}
            </div>
          )}
          <div className="profile-role-chip">Role: Patient</div>
        </div>

        {/* ── Right: Edit form ── */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <h3 className="card-title">Personal Information</h3>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="profile-form-grid">

              {/* Full name */}
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Email (read-only — managed by Supabase Auth) */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  title="Email cannot be changed here"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91-9000000000"
                />
              </div>

              {/* Date of birth */}
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">— Select —</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Blood group */}
              <div className="form-group">
                <label htmlFor="blood_group">Blood Group</label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                >
                  <option value="">— Select —</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your home address"
                  rows={2}
                />
              </div>

              {/* Emergency contact */}
              <div className="form-group full-width">
                <label htmlFor="emergency_contact">Emergency Contact</label>
                <input
                  id="emergency_contact"
                  name="emergency_contact"
                  type="text"
                  value={form.emergency_contact}
                  onChange={handleChange}
                  placeholder="Name and phone number of emergency contact"
                />
              </div>

            </div>

            {/* Actions row */}
            <div className="profile-form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ minWidth: '130px' }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

              {saveSuccess && (
                <span className="save-success">
                  ✓ Profile updated successfully
                </span>
              )}

              {saveError && (
                <span className="save-error">{saveError}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
