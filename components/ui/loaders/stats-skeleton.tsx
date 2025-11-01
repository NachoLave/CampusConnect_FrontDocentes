import { CardSkeleton, Skeleton } from "./skeleton"

/**
 * Skeleton para tarjetas de estadísticas pequeñas
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <CardSkeleton className={className}>
      <Skeleton className="h-5 w-20 mb-4" />
      <Skeleton className="h-10 w-32" />
    </CardSkeleton>
  )
}

/**
 * Grid de tarjetas de estadísticas
 */
export function StatsGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

