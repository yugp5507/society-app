'use client'
import DashboardLayout from '@/src/components/DashboardLayout'

const navItems = [
  { href: '/society-admin/dashboard',   icon: '📊', label: 'Dashboard' },
  { href: '/society-admin/sub-admins',  icon: '🛡️', label: 'Sub Admins' },
  { href: '/society-admin/residents',   icon: '👥', label: 'Residents' },
  { href: '/society-admin/buildings',   icon: '🏢', label: 'Buildings' },
  { href: '/society-admin/notices',     icon: '📢', label: 'Notices' },
  { href: '/society-admin/complaints',  icon: '📝', label: 'Complaints' },
  { href: '/society-admin/bookings',    icon: '🏊', label: 'Bookings' },
  { href: '/society-admin/visitors',    icon: '🚪', label: 'Visitor Log' },
  { href: '/society-admin/maintenance', icon: '💰', label: 'Maintenance' },
]

export default function SocietyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} role="Society Admin">
      {children}
    </DashboardLayout>
  )
}
