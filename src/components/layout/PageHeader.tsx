import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 sm:pb-6 border-b border-border/60 min-w-0">
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17181C] tracking-tight break-words">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8ECF6] text-[#183058] border border-[#183058]/20 shrink-0">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
