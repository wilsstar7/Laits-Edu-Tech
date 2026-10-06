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
    <header className="sticky top-0 z-30 h-18 px-4 sm:px-6 lg:px-8 bg-white border-b border-border/80 flex items-center justify-between">
      {/* Left: Mobile trigger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="lg:hidden w-10 h-10 rounded-xl bg-white border border-border/80 flex items-center justify-center text-foreground hover:bg-[#EEF0F8] transition-colors focus-visible:outline-2 focus-visible:outline-[#6C5CE7]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <span>{greeting}, {firstName}!</span>
            <span className="hidden sm:inline-block text-lg">👋</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium hidden sm:block">
            {todayStr}
          </p>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="text-xs text-muted-foreground font-medium sm:hidden pr-1">
          {todayStr.split(',')[0]}
        </span>
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  )
}
