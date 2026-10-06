import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TutorCardSkeleton() {
  return (
    <Card className="border border-border/80 bg-white shadow-sm overflow-hidden animate-pulse">
      <CardContent className="p-5 flex flex-col sm:flex-row gap-5">
        <div className="flex sm:flex-col items-center gap-3">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-20 h-4 rounded" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1.5">
              <Skeleton className="w-40 h-5 rounded" />
              <Skeleton className="w-56 h-4 rounded" />
            </div>
            <Skeleton className="w-28 h-6 rounded-full" />
          </div>
          <Skeleton className="w-full h-8 rounded" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-6 rounded-md" />
            <Skeleton className="w-20 h-6 rounded-md" />
            <Skeleton className="w-16 h-6 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-24 h-9 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TutorListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TutorCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TutorProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner / Header */}
      <Card className="border-border bg-white p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Skeleton className="w-48 h-7 rounded mb-2" />
                <Skeleton className="w-64 h-4 rounded" />
              </div>
              <Skeleton className="w-32 h-10 rounded-xl" />
            </div>
            <div className="flex gap-4 pt-2">
              <Skeleton className="w-24 h-5 rounded" />
              <Skeleton className="w-28 h-5 rounded" />
              <Skeleton className="w-32 h-5 rounded" />
            </div>
          </div>
        </div>
      </Card>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4 border-border bg-white">
            <Skeleton className="w-36 h-5 rounded" />
            <Skeleton className="w-full h-16 rounded" />
            <Skeleton className="w-40 h-5 rounded pt-2" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-7 rounded-md" />
              <Skeleton className="w-24 h-7 rounded-md" />
              <Skeleton className="w-20 h-7 rounded-md" />
            </div>
          </Card>
          <Card className="p-6 space-y-4 border-border bg-white">
            <Skeleton className="w-44 h-5 rounded" />
            <Skeleton className="w-full h-12 rounded" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-border bg-white">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-full h-40 rounded" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  )
}
