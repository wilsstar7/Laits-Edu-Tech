import { NavLink, Outlet } from 'react-router'
import { Brain, Compass } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const personalitySections = [
  { label: 'Kepribadian Saya', href: '/student/personality', icon: Compass },
  { label: 'Asesmen Kepribadian', href: '/student/assessment', icon: Brain },
]

export function StudentPersonalityLayout() {
  return (
    <AppShell>
      <nav aria-label="Bagian Kepribadian" className="flex flex-wrap gap-2 border-b border-border pb-3">
        {personalitySections.map(({ label, href, icon: Icon }) => (
          <NavLink key={href} to={href}
            className={({ isActive }) =>
              `inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-colors ${
                isActive
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-border/70 bg-white text-ink-muted hover:bg-surface hover:text-ink-primary'
              }`
            }>
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </AppShell>
  )
}
