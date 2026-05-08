'use client'
import DashboardLayout from '@/src/components/DashboardLayout'

const navItems = [
  { href: '/resident/dashboard',   icon: '🏠', label: 'Dashboard' },
  { href: '/resident/family',      icon: '👨‍👩‍👧', label: 'My Family' },
  { href: '/resident/vehicles',    icon: '🚗', label: 'My Vehicles' },
  { href: '/resident/bookings',    icon: '🏊', label: 'Book Amenity' },
  { href: '/resident/notices',     icon: '📢', label: 'Notice Board' },
  { href: '/resident/complaints',  icon: '📝', label: 'My Complaints' },
  { href: '/resident/visitors',    icon: '🚪', label: 'Visitor Entry' },
  { href: '/resident/maintenance', icon: '💰', label: 'Pay Maintenance' },
]

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} role="Resident Portal">
      {children}
    </DashboardLayout>
  )
}
