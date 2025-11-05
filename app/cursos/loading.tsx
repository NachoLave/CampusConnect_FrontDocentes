"use client"

import { CardSkeleton, Skeleton, ButtonSkeleton } from "@/components/ui/loaders/skeleton"
import { CoursesGridSkeleton } from "@/components/ui/loaders/course-card-skeleton"

export default function CoursesLoading() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Skeleton - Filtros de período y sedes/días */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
        {/* Período buttons */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full lg:w-auto">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32 border-l border-gray-300" />
          <Skeleton className="h-10 w-24 border-l border-gray-300" />
        </div>
        
        {/* Filtros de sedes y días */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Results Count Skeleton */}
      <Skeleton className="h-5 w-48" />

      {/* Courses Grid Skeleton */}
      <CoursesGridSkeleton count={6} />
    </div>
  )
}
