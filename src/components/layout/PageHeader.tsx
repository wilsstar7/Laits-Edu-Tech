import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFEDFD] text-[#6C5CE7] border border-[#6C5CE7]/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
