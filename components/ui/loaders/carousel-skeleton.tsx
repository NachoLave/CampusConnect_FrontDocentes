import { Skeleton } from "./skeleton"

/**
 * Skeleton para el carrusel de la página principal
 */
export function CarouselSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-2 lg:px-0">
      <div className="relative">
        {/* Main carousel image */}
        <Skeleton className="h-48 md:h-64 lg:h-80 rounded-2xl" />
        
        {/* Dots indicator */}
        <div className="flex justify-center items-center mt-6 space-x-3">
          <Skeleton className="w-10 h-3 rounded-full" />
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-3 h-3 rounded-full" />
        </div>
      </div>
    </div>
  )
}

