import { CardSkeleton, Skeleton, CircleSkeleton } from "./skeleton"

/**
 * Skeleton para una transacción individual
 */
export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center gap-3 flex-1">
        <CircleSkeleton className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  )
}

/**
 * Skeleton para lista de transacciones
 */
export function TransactionListSkeleton({ 
  count = 8,
  className 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <CardSkeleton className={className}>
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-0">
          {Array.from({ length: count }).map((_, i) => (
            <TransactionItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </CardSkeleton>
  )
}

