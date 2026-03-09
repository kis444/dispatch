'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Truck,
  Users,
  Moon,
  Calculator,
  Settings,
  LogOut,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Load', href: '/dashboard/loads', icon: Package },
  { name: 'After Hours', href: '/dashboard/after-hours', icon: Moon },
  { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
  { name: 'Goal Calculator', href: '/dashboard/calculator', icon: Calculator },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#103754]">
      <div className="flex h-16 items-center gap-3 px-6">
       <div className="flex items-center justify-center">
  <img src="/truck.png" alt="Logo" className="h-12 w-auto object-contain" />
</div>
        <div>
          <h1 className="text-lg font-bold text-white">Dispatcher</h1>
          <p className="text-xs text-white/60">Performance Tracker</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#97D3CB] text-[#103754]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 rounded-xl bg-white/5 px-4 py-3">
          <p className="text-xs text-white/50">Logged in as</p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
