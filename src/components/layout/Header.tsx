import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatLongDate, getFirstName, getGreeting } from '@/utils/format'
import { NotificationButton } from './NotificationButton'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { profile } = useAuth()
  const todayStr = formatLongDate(new Date())
  const greeting = getGreeting(new Date())
  const firstName = getFirstName(profile?.full_name) || 'Siswa'

  return (
    <header className="sticky top-0 z-30 min-h-[64px] sm:min-h-[72px] px-4 sm:px-6 lg:px-8 py-2.5 bg-white border-b border-border/80 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="lg:hidden min-h-[44px] min-w-[44px] px-3 rounded-xl bg-white border border-border/80 inline-flex items-center justify-center gap-2 text-foreground hover:bg-[#ECF0F7] active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#183058] shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">Menu</span>
        </button>

        <div className="min-w-0">
          <p className="text-sm sm:text-lg font-bold text-foreground tracking-tight truncate">
            {greeting}, {firstName}
          </p>
          <p className="text-xs text-muted-foreground font-medium hidden sm:block truncate">
            {todayStr}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  )
}
