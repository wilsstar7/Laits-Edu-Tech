import { Skeleton } from '@/components/ui/skeleton'

export function LearningProfileSkeleton() {
  return (
    <div className="surface-card p-6 sm:p-8 bg-white border border-border rounded-2xl space-y-6">
      <div className="space-y-2 border-b border-border/60 pb-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  )
}

export function LearningPathSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="surface-card p-6 bg-white border border-border rounded-2xl space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function SubjectCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="surface-card p-5 bg-white border border-border rounded-2xl space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function LearningGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card p-6 bg-white border border-border rounded-2xl space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
