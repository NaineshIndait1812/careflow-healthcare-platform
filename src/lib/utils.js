// Shared formatting utilities

export function formatDate(dateStr) {
  if (!dateStr) return { day: '--', mon: '---', full: '' }
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.getDate(),
    mon: d.toLocaleString('default', { month: 'short' }),
    full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const FACILITY_EMOJI = {
  HOSPITAL: '🏥',
  CLINIC: '🏨',
  DIAGNOSTIC_CENTER: '🔬',
  BLOOD_BANK: '🩸',
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Insert a notification record (best-effort — errors are logged, not thrown)
export async function insertNotification(supabase, { userId, title, message, type = 'INFO' }) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, message, type, read: false })
  if (error) console.error('notification insert:', error.message)
}
