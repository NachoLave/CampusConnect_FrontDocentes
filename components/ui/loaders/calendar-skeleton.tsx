import { CardSkeleton, Skeleton, CircleSkeleton } from "./skeleton"

interface CalendarSkeletonProps {
  className?: string
  compact?: boolean
}

/**
 * Skeleton para componentes de calendario
 * Soporta versión compacta (dashboard) y completa (página de calendario)
 */
export function CalendarSkeleton({ className, compact = false }: CalendarSkeletonProps) {
  if (compact) {
    // Versión compacta para dashboard
    return (
      <CardSkeleton className={className}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-4 w-8 mx-auto" />
                <CircleSkeleton className="h-10 w-10 mx-auto" />
                <Skeleton className="h-1.5 w-1.5 mx-auto rounded-full" />
              </div>
            ))}
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>

          {/* Link */}
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </CardSkeleton>
    )
  }

  // Versión completa para página de calendario
  return (
    <CardSkeleton className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Calendar grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6" />
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    </CardSkeleton>
  )
}

