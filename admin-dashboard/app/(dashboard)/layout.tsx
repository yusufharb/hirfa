"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, UserCog, CalendarDays, CreditCard, Settings, LogOut, Bell } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  if (!mounted) return null

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/bookings', label: 'Bookings', icon: CalendarDays },
    { href: '/craftsmen', label: 'Craftsmen', icon: UserCog },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/payments', label: 'Payments', icon: CreditCard },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-2xl font-bold text-primary">HIRFA</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn("flex items-center px-3 py-2 rounded-md text-sm font-medium", pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100")}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
              <span className="text-sm font-medium">Admin User</span>
            </div>
            <button onClick={() => { localStorage.removeItem('admin_token'); router.push('/login') }} className="text-gray-500 hover:text-gray-700">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
