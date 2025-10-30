"use client"

import { CarouselSkeleton } from "@/components/ui/loaders/carousel-skeleton"
import { CalendarSkeleton } from "@/components/ui/loaders/calendar-skeleton"
import { NextClassSkeleton } from "@/components/ui/loaders/next-class-skeleton"
import { StatsGridSkeleton } from "@/components/ui/loaders/stats-skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Hero Carousel Skeleton */}
      <CarouselSkeleton />

      {/* Dashboard Grid Skeleton */}
      <div className="w-full max-w-[95rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Skeleton */}
          <CalendarSkeleton compact />

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Next Class Skeleton */}
            <NextClassSkeleton />

            {/* Stats Grid Skeleton */}
            <StatsGridSkeleton count={2} />
          </div>
        </div>
      </div>
    </div>
  )
}