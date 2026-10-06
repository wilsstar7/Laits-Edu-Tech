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
  iconColor = 'text-[#6C5CE7]',
  iconBg = 'bg-[#EFEDFD]',
  badge,
  action,
}: StatCardProps) {
  return (
    <div className="surface-card p-5 sm:p-6 transition-all duration-200 hover:shadow-md flex flex-col justify-between relative overflow-hidden group">
      {/* Top row: Label & Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
              {value}
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFEDFD] text-[#6C5CE7] border border-[#6C5CE7]/15">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom row: Description / Action */}
      {(description || action) && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          {description && (
            <p className="text-muted-foreground truncate">{description}</p>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </div>
  )
}
