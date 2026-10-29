import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  badge?: string
  action?: ReactNode
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconColor = 'text-[#183058]',
  iconBg = 'bg-[#E8ECF6]',
  badge,
  action,
}: StatCardProps) {
  return (
    <div className="surface-card p-4 sm:p-5 lg:p-6 transition-colors duration-150 flex flex-col justify-between relative min-w-0">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-baseline gap-2 pt-0.5 min-w-0">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17181C] tracking-tight break-words">
              {value}
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8ECF6] text-[#183058] border border-[#183058]/15 shrink-0">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(description || action) && (
        <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
          {description && (
            <p className="text-muted-foreground break-words min-w-0 flex-1">{description}</p>
          )}
          {action && (
            <div className="shrink-0 min-h-[44px] inline-flex items-center">
              {action}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
