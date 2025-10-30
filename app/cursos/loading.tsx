"use client"

import { CardSkeleton, Skeleton, ButtonSkeleton } from "@/components/ui/loaders/skeleton"
import { CoursesGridSkeleton } from "@/components/ui/loaders/course-card-skeleton"

export default function CoursesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <CardSkeleton>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <ButtonSkeleton />
            <ButtonSkeleton />
          </div>
        </div>
      </CardSkeleton>

      {/* Results Count Skeleton */}
      <Skeleton className="h-5 w-48" />

      {/* Courses Grid Skeleton */}
      <CoursesGridSkeleton count={6} />
    </div>
  )
}
