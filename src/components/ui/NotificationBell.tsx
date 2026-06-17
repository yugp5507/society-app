'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  NOTICE:      '📢',
  COMPLAINT:   '📝',
  BOOKING:     '🏊',
  MAINTENANCE: '💰',
  VISITOR:     '🚪',
  GENERAL:     '🔔',
}

const TYPE_COLORS: Record<string, string> = {
  NOTICE:      '#2563EB',
  COMPLAINT:   '#D97706',
  BOOKING:     '#0891B2',
  MAINTENANCE: '#7C3AED',
  VISITOR:     '#059669',
  GENERAL:     '#64748B',
}

function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      // silently fail — bell should not break the layout
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAsRead = async (id: string, link: string | null) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    setIsOpen(false)
    if (link) router.push(link)
  }

  const markAllAsRead = async () => {
    setLoading(true)
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          position: 'relative',
          background: isOpen ? '#EFF6FF' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? '#BFDBFE' : 'transparent',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '10px',
          color: isOpen ? '#2563EB' : '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'
          }
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              background: '#EF4444',
              color: 'white',
              borderRadius: '50%',
              width: '17px',
              height: '17px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 0 0 2px white',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="notification-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            background: 'white',
            borderRadius: '14px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '1px 7px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#94A3B8',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔔</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>You're all caught up!</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.link)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    background: notif.isRead ? 'white' : '#EFF6FF',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLButtonElement).style.background = notif.isRead ? '#F8FAFC' : '#DBEAFE')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLButtonElement).style.background = notif.isRead ? 'white' : '#EFF6FF')
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: (TYPE_COLORS[notif.type] ?? '#64748B') + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_ICONS[notif.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: notif.isRead ? 500 : 700,
                        fontSize: '13px',
                        color: '#0F172A',
                        marginBottom: '2px',
                        lineHeight: 1.3,
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748B',
                        lineHeight: 1.45,
                        marginBottom: '5px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                      {getTimeAgo(notif.createdAt)}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#2563EB',
                        flexShrink: 0,
                        marginTop: '8px',
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #F1F5F9',
              textAlign: 'center',
              background: '#FAFAFA',
            }}
          >
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              style={{
                color: '#2563EB',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
