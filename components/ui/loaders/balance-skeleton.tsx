import { CardSkeleton, Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

interface BalanceSkeletonProps {
  className?: string
  showActions?: boolean
  compact?: boolean
}

/**
 * Skeleton específico para componentes de saldo/balance
 * Se adapta al contexto (dashboard compacto o billetera completa)
 */
export function BalanceSkeleton({ 
  className, 
  showActions = false,
  compact = false 
}: BalanceSkeletonProps) {
  if (compact) {
    // Versión compacta para dashboard
    return (
      <CardSkeleton className={className}>
        <div className="space-y-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardSkeleton>
    )
  }

  // Versión completa para página de billetera
  return (
    <CardSkeleton className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-12 w-48" />
        {showActions && (
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
      </div>
    </CardSkeleton>
  )
}

