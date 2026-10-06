import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-2xl bg-white/60 border border-dashed border-border/80 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mb-3 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#17181C] tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm text-balance">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
