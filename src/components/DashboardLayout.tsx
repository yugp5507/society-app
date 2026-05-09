'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { getRoleLabel, getRoleColor } from '@/src/lib/auth-redirect'

export type NavItem = {
  href: string
  icon: string
  label: string
}

export default function DashboardLayout({
  children,
  navItems,
  role,
}: {
  children: React.ReactNode
  navItems: NavItem[]
  role: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const userName = session?.user?.name ?? role
  const userRole = session?.user?.role ?? ''
  const roleLabel = getRoleLabel(userRole)
  const roleColor = getRoleColor(userRole)
  // Initials from name
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut({ redirect: false })
    router.replace('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div
        className="sp-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '240px',
          height: '100vh',
          background: '#0F172A',
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1E293B', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', background: '#2563EB',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '16px', flexShrink: 0,
            }}>🏢</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>SocietyPro</div>
              {/* Role badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                marginTop: '4px', padding: '2px 8px', borderRadius: '20px',
                background: roleColor + '22', border: `1px solid ${roleColor}44`,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: roleColor, flexShrink: 0 }} />
                <span style={{ color: roleColor, fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em' }}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  color: active ? 'white' : '#94A3B8',
                  background: active ? '#2563EB' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* ── User info + Logout ── */}
        <div style={{ padding: '12px', borderTop: '1px solid #1E293B', flexShrink: 0 }}>
          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', background: '#1E293B',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: roleColor, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 700,
              fontSize: '13px', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: 'white', fontWeight: 600, fontSize: '13px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              <div style={{ color: '#64748B', fontSize: '11px', marginTop: '1px' }}>
                {session?.user?.email ?? ''}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '9px 12px', borderRadius: '8px',
              background: 'transparent', border: '1px solid #334155',
              color: '#94A3B8', fontSize: '13px', fontWeight: 500,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              opacity: loggingOut ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!loggingOut) {
                (e.currentTarget as HTMLButtonElement).style.background = '#EF444415'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#F87171'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#EF444440'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'
            }}
          >
            <span style={{ fontSize: '15px' }}>🚪</span>
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            margin: '0 12px 12px', padding: '10px',
            background: '#1E293B', border: 'none',
            borderRadius: '8px', color: '#94A3B8',
            fontSize: '13px', cursor: 'pointer',
            display: 'none', flexShrink: 0,
          }}
          className="sp-close-btn"
        >
          ✕ Close Menu
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* ── Right column ─────────────────────────────────────── */}
      <div
        className="sp-main"
        style={{
          marginLeft: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Top navbar */}
        <div style={{
          flexShrink: 0,
          height: '64px',
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none',
              fontSize: '20px', cursor: 'pointer',
              color: '#0F172A', padding: '8px',
              borderRadius: '6px', lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
            SocietyPro
          </span>
          <div style={{ flex: 1 }} />

          {/* User display in top nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {session?.user?.name && (
              <div style={{ textAlign: 'right', display: 'none' }} className="sp-username">
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                  {session.user.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{roleLabel}</div>
              </div>
            )}
            <div
              title={userName}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%', background: roleColor + '1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: roleColor, fontWeight: 700, fontSize: '13px',
                border: `2px solid ${roleColor}33`, cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Scrollable page content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px',
          background: '#F8FAFC',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .sp-sidebar {
            transform: translateX(0) !important;
          }
          .sp-main {
            margin-left: 240px !important;
          }
          .sp-close-btn {
            display: none !important;
          }
          .sp-username {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .sp-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
