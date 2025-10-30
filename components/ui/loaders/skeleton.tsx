import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer"
}

/**
 * Componente base Skeleton con animación moderna
 * Soporta dos variantes: default (pulse) y shimmer (más moderna)
 */
function Skeleton({ className, variant = "shimmer", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-gray-200/80",
        variant === "shimmer" && "relative overflow-hidden",
        variant === "default" && "animate-pulse",
        className
      )}
      {...props}
    >
      {variant === "shimmer" && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  )
}

/**
 * Skeleton para tarjetas completas
 */
function CardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton para texto
 */
function TextSkeleton({ 
  className, 
  lines = 1,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton circular (para avatares)
 */
function CircleSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      {...props}
    />
  )
}

/**
 * Skeleton para botones
 */
function ButtonSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-10 w-32 rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton, CardSkeleton, TextSkeleton, CircleSkeleton, ButtonSkeleton }

