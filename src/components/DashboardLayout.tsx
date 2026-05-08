'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()

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
              <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>{role}</div>
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

        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            margin: '12px', padding: '10px',
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
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%', background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2563EB', fontWeight: 700, fontSize: '13px',
            border: '2px solid #DBEAFE', cursor: 'pointer',
          }}>
            U
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
