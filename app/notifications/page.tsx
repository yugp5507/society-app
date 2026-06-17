'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Trash2, Filter, ChevronDown } from 'lucide-react'

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
  ALL:         '🔔',
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  NOTICE:      { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#2563EB' },
  COMPLAINT:   { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: '#D97706' },
  BOOKING:     { bg: '#ECFEFF', border: '#A5F3FC', text: '#0E7490', dot: '#0891B2' },
  MAINTENANCE: { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', dot: '#7C3AED' },
  VISITOR:     { bg: '#F0FDF4', border: '#BBF7D0', text: '#065F46', dot: '#059669' },
  GENERAL:     { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', dot: '#64748B' },
}

const FILTER_TYPES = ['ALL', 'NOTICE', 'COMPLAINT', 'BOOKING', 'MAINTENANCE', 'VISITOR', 'GENERAL']

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | string>('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'ALL') params.set('type', typeFilter)
      if (filter === 'UNREAD') params.set('unread', 'true')

      const res = await fetch(`/api/notifications?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter, typeFilter])

  useEffect(() => {
    setLoading(true)
    fetchNotifications()
  }, [fetchNotifications])

  const markAllRead = async () => {
    setActionLoading(true)
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    setActionLoading(false)
  }

  const clearAll = async () => {
    if (!confirm('Clear all notifications? This cannot be undone.')) return
    setActionLoading(true)
    await fetch('/api/notifications/read-all', { method: 'DELETE' })
    setNotifications([])
    setUnreadCount(0)
    setActionLoading(false)
  }

  const markRead = async (notif: Notification) => {
    if (!notif.isRead) {
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (notif.link) router.push(notif.link)
  }

  // Group by date
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt)
    if (!acc[group]) acc[group] = []
    acc[group].push(n)
    return acc
  }, {})

  const groupKeys = Object.keys(grouped)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', background: '#EFF6FF', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #BFDBFE',
              }}>
                <Bell size={22} color="#2563EB" />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Notifications</h1>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, marginTop: '2px' }}>
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={actionLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#2563EB', fontSize: '13px', fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  disabled={actionLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px',
                    background: 'white', border: '1px solid #E2E8F0',
                    color: '#EF4444', fontSize: '13px', fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  <Trash2 size={15} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Read status filter */}
            {(['ALL', 'UNREAD'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === f ? '#0F172A' : 'white',
                  color: filter === f ? 'white' : '#64748B',
                  border: `1px solid ${filter === f ? '#0F172A' : '#E2E8F0'}`,
                  transition: 'all 0.15s',
                }}
              >
                {f === 'ALL' ? 'All' : 'Unread'}
                {f === 'UNREAD' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: '5px', background: filter === 'UNREAD' ? 'white' : '#EF4444',
                    color: filter === 'UNREAD' ? '#0F172A' : 'white',
                    borderRadius: '10px', padding: '1px 6px', fontSize: '11px',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}

            {/* Type dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', background: typeFilter !== 'ALL' ? '#EFF6FF' : 'white',
                  color: typeFilter !== 'ALL' ? '#2563EB' : '#64748B',
                  border: `1px solid ${typeFilter !== 'ALL' ? '#BFDBFE' : '#E2E8F0'}`,
                }}
              >
                <Filter size={13} />
                {typeFilter === 'ALL' ? 'All Types' : typeFilter}
                <ChevronDown size={13} />
              </button>
              {showTypeDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                  background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '160px', overflow: 'hidden',
                }}>
                  {FILTER_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => { setTypeFilter(t); setShowTypeDropdown(false) }}
                      style={{
                        width: '100%', padding: '9px 14px', textAlign: 'left',
                        fontSize: '13px', fontWeight: typeFilter === t ? 700 : 400,
                        color: typeFilter === t ? '#2563EB' : '#0F172A',
                        background: typeFilter === t ? '#EFF6FF' : 'transparent',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                    >
                      <span>{TYPE_ICONS[t]}</span>
                      {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading notifications…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
              No notifications
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
              {filter === 'UNREAD' ? "You've read everything!" : "Nothing here yet. Check back later."}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {groupKeys.map(group => (
              <div key={group}>
                {/* Date group header */}
                <div style={{
                  fontSize: '12px', fontWeight: 700, color: '#94A3B8',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '10px', paddingLeft: '4px',
                }}>
                  {group}
                </div>

                {/* Notifications in group */}
                <div style={{
                  background: 'white', borderRadius: '14px',
                  border: '1px solid #E2E8F0', overflow: 'hidden',
                }}>
                  {grouped[group].map((notif, idx) => {
                    const colors = TYPE_COLORS[notif.type] ?? TYPE_COLORS.GENERAL
                    const isLast = idx === grouped[group].length - 1

                    return (
                      <button
                        key={notif.id}
                        onClick={() => markRead(notif)}
                        style={{
                          width: '100%', textAlign: 'left', border: 'none',
                          borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                          background: notif.isRead ? 'white' : '#EFF6FF',
                          cursor: 'pointer', padding: '16px',
                          display: 'flex', gap: '14px', alignItems: 'flex-start',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = notif.isRead ? '#F8FAFC' : '#DBEAFE')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = notif.isRead ? 'white' : '#EFF6FF')}
                      >
                        {/* Icon */}
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                          background: colors.bg, border: `1px solid ${colors.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px',
                        }}>
                          {TYPE_ICONS[notif.type] ?? '🔔'}
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{
                              fontSize: '14px', fontWeight: notif.isRead ? 500 : 700,
                              color: '#0F172A', lineHeight: 1.3,
                            }}>
                              {notif.title}
                            </span>
                            <span style={{
                              fontSize: '11px', color: '#94A3B8', flexShrink: 0,
                              fontWeight: 500, marginTop: '2px',
                            }}>
                              {getTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '13px', color: '#64748B', margin: '4px 0 0',
                            lineHeight: 1.5,
                          }}>
                            {notif.message}
                          </p>
                          {/* Type badge */}
                          <span style={{
                            display: 'inline-block', marginTop: '8px',
                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                          }}>
                            {notif.type.charAt(0) + notif.type.slice(1).toLowerCase()}
                          </span>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div style={{
                            width: '9px', height: '9px', borderRadius: '50%',
                            background: colors.dot, flexShrink: 0, marginTop: '8px',
                          }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close type dropdown */}
      {showTypeDropdown && (
        <div
          onClick={() => setShowTypeDropdown(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
      )}
    </div>
  )
}
