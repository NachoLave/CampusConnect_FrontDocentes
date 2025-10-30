/**
 * Componente helper para skeletons inline
 * Útil para estados de carga pequeños dentro de componentes
 */
export function InlineSkeleton({ 
  width = "32", 
  height = "4",
  className = "",
  rounded = "rounded"
}: { 
  width?: string
  height?: string
  className?: string
  rounded?: string
}) {
  return (
    <div className={`relative overflow-hidden h-${height} w-${width} bg-gray-200 ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

/**
 * Skeleton específico para eventos del calendario
 */
export function EventSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="relative overflow-hidden h-16 bg-gray-100 rounded-lg">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para próxima clase (inline)
 */
export function InlineNextClassSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative overflow-hidden h-4 w-4 bg-gray-200 rounded">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        <div className="relative overflow-hidden h-6 w-48 bg-gray-200 rounded">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>
      <div className="relative overflow-hidden h-4 w-40 bg-gray-100 rounded">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="relative overflow-hidden h-4 w-32 bg-gray-100 rounded">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    </div>
  )
}

/**
 * Skeleton para balance (inline)
 */
export function InlineBalanceSkeleton() {
  return (
    <div className="relative overflow-hidden h-10 w-32 bg-gray-200 rounded">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

