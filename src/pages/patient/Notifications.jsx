import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { timeAgo } from '../../lib/utils'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = async () => {
    if (!user?.id) return
    const { data, error: err } = await supabase
      .from('notifications')
      .select('id, title, message, type, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setLoading(false)
    if (err) { setError('Unable to load notifications.'); return }
    setNotifications(data || [])
  }

  useEffect(() => { fetch() }, [user?.id])

  const markRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ read: true }).in('id', ids)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <div className="page-header with-action">
        <div>
          <h2>Notifications {unreadCount > 0 && <span className="unread-count">({unreadCount} unread)</span>}</h2>
          <p>Your appointment updates and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {loading && <div className="card"><div className="skeleton-line full" /><div className="skeleton-line med" /></div>}
      {!loading && error && <div className="data-error">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state" style={{ padding: '3rem' }}><p>No notifications yet.</p></div>
      )}

      {!loading && !error && (
        <div className="notification-list">
          {notifications.map(n => (
            <div className={`notification-item${!n.read ? ' unread' : ''}`} key={n.id}>
              <div className={`notification-dot${n.read ? ' read' : ''}`} />
              <div className="notification-body" style={{ flex: 1 }}>
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <span className="notification-time">{timeAgo(n.created_at)}</span>
                  {!n.read && (
                    <button className="mark-read-btn" onClick={() => markRead(n.id)}>Mark read</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
