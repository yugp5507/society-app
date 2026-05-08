'use client'
import DashboardLayout from '@/src/components/DashboardLayout'

const navItems = [
  { href: '/sub-admin/dashboard',  icon: '📊', label: 'Dashboard' },
  { href: '/sub-admin/building',   icon: '🏢', label: 'My Building' },
  { href: '/sub-admin/apartments', icon: '🏠', label: 'Apartments' },
  { href: '/sub-admin/visitors',   icon: '🚪', label: 'Visitors' },
  { href: '/sub-admin/complaints', icon: '📝', label: 'Complaints' },
  { href: '/sub-admin/notices',    icon: '📢', label: 'Notices' },
]

export default function SubAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} role="Sub Admin">
      {children}
    </DashboardLayout>
  )
}
