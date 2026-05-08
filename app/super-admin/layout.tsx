'use client'
import DashboardLayout from '@/src/components/DashboardLayout'

const navItems = [
  { href: '/super-admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/super-admin/societies', icon: '🏘️', label: 'Societies' },
  { href: '/super-admin/admins',    icon: '👤', label: 'Admins' },
  { href: '/super-admin/residents', icon: '👥', label: 'Residents' },
  { href: '/super-admin/reports',   icon: '📈', label: 'Reports' },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} role="Super Admin">
      {children}
    </DashboardLayout>
  )
}
