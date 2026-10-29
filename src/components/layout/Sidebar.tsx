import { Link, useLocation } from 'react-router'
import {
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getNavItemsForRole } from '@/lib/navigation'

interface SidebarProps {
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ onNavigate, className = '' }: SidebarProps) {
  const location = useLocation()
  const { role, signOut } = useAuth()
  const navItems = getNavItemsForRole(role)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // Toast is already shown or handled in AuthProvider
    }
  }

  return (
    <aside
      className={`flex flex-col h-full bg-[#0F1D33] text-[#C9D2E3] border-r border-white/8 select-none ${className}`}
    >
      <Link
        to="/"
        onClick={onNavigate}
        className="min-h-[72px] px-5 pr-24 lg:pr-5 flex items-center gap-3 border-b border-white/8 hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
          <img
            src="/logo-mark.png"
            alt="Logo ZEINBOX"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5 leading-none">
            ZEINBOX
          </span>
          <span className="text-[11px] text-[#B0B4E0] font-medium leading-none mt-1 truncate">
            Where Every Mind Grows
          </span>
        </div>
      </Link>

      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-xs text-[#C9D2E3]">
          <span className="text-xs font-semibold">Peran Akun</span>
          <span className="capitalize px-2 py-0.5 rounded text-xs font-semibold bg-[#B0B4E0]/15 text-[#B0B4E0]">
            {role === 'super_admin' ? 'Super Admin' : role || 'Student'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
        <div className="px-2 pb-1 text-xs font-bold text-[#B0B4E0]">
          Menu Navigasi
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 min-h-[44px] ${
                isActive
                  ? 'bg-[#244375] text-white'
                  : 'text-[#C9D2E3] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#B0B4E0]' : 'text-[#94A3B8] group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.08] text-[#94A3B8] group-hover:bg-white/[0.12] group-hover:text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/8 space-y-1.5 bg-black/10">
        <Link
          to="/student/help"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#C9D2E3] hover:bg-white/[0.06] hover:text-white transition-colors min-h-[44px]"
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Pusat Bantuan</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#E96A6A] hover:bg-[#E96A6A]/10 transition-colors min-h-[44px] text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
