import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { Header } from './Header'
import { env } from '@/lib/env'
import { useAuth } from '@/hooks/useAuth'
import { getNavItemsForRole } from '@/lib/navigation'
import { AlertCircle, Menu } from 'lucide-react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { role } = useAuth()
  const primaryMobileNav = getNavItemsForRole(role).slice(0, 4)

  return (
    <div className="min-h-dvh bg-[#F4F6FA] flex flex-row antialiased text-[#1D1D24] overflow-x-clip">
      <div className="hidden lg:block lg:w-[270px] lg:shrink-0 h-dvh sticky top-0 z-40">
        <Sidebar />
      </div>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-dvh">
        {!env.isSupabaseConfigured && (
          <div className="bg-[#FDF4E2] border-b border-[#F2B84B]/30 px-4 py-2.5 text-xs text-[#92580E] flex items-center justify-between z-40">
            <div className="flex items-start sm:items-center gap-2 max-w-4xl mx-auto w-full min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F2B84B] mt-0.5 sm:mt-0" />
              <span className="break-words min-w-0">
                <strong>Mode Pratinjau Lokal / Setup Supabase:</strong> Variabel lingkungan{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono break-all">VITE_SUPABASE_URL</code> dan{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono break-all">VITE_SUPABASE_ANON_KEY</code> belum dikonfigurasi. Hubungkan project Supabase Anda untuk fungsionalitas penuh.
              </span>
            </div>
          </div>
        )}

        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-28 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 min-w-0">
          {children}
        </main>

        <nav
          aria-label="Navigasi cepat seluler"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        >
          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            {primaryMobileNav.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              const shortLabel = item.label.split(' ')[0] || item.label
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`min-h-[48px] px-1 py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                    isActive
                      ? 'bg-[#E8ECF6] text-[#183058]'
                      : 'text-[#3E4756] hover:bg-[#F4F6FA] hover:text-[#0F1D33]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-full leading-none">{shortLabel}</span>
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka semua menu navigasi"
              className="min-h-[48px] px-1 py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-[#3E4756] hover:bg-[#F4F6FA] hover:text-[#0F1D33] transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full leading-none">Menu</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
