import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Profile completion banner skeleton */}
      <Skeleton className="h-28 w-full rounded-3xl" />

      {/* 4 Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-7 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Grid content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
