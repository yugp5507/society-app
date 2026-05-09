'use client'
import DashboardLayout from '@/src/components/DashboardLayout'

const navItems = [
  { href: '/guard/dashboard',       icon: '🏠', label: 'Dashboard' },
  { href: '/guard/pending',         icon: '✅', label: 'Pending Approvals' },
  { href: '/guard/manual-entry',    icon: '📋', label: 'Manual Entry' },
  { href: '/guard/inside',          icon: '👥', label: 'Currently Inside' },
  { href: '/guard/preapproved',     icon: '📅', label: 'Pre-approved' },
  { href: '/guard/log',             icon: '📊', label: 'Today\'s Log' },
]

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} role="Security Guard">
      {children}
    </DashboardLayout>
  )
}
