"use client"

import { CardSkeleton, Skeleton, ButtonSkeleton, CircleSkeleton } from "@/components/ui/loaders/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative h-32 lg:h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
        <Skeleton className="absolute top-2 left-2 lg:top-4 lg:left-4 h-8 w-8 lg:h-10 lg:w-10 rounded-lg" />
      </div>

      {/* Course Header Skeleton */}
      <div className="bg-white px-3 py-4 lg:px-6 lg:py-6 border-b">
        <Skeleton className="h-7 lg:h-9 w-3/4 mb-3 lg:mb-4" />
        
        <div className="flex flex-wrap items-center gap-3 lg:gap-6 mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <div className="flex -space-x-1">
            <CircleSkeleton className="w-5 h-5 lg:w-6 lg:h-6" />
            <CircleSkeleton className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
            <div className="flex items-center flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <ButtonSkeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-gray-200 border-b overflow-x-auto">
        <div className="px-3 lg:px-6">
          <div className="flex space-x-0 min-w-max">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 lg:h-12 w-24 lg:w-32 mx-1" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Area Skeleton - Información Tab (default) */}
      <div className="p-3 lg:p-6 bg-gray-100 min-h-screen">
        <div className="space-y-4 lg:space-y-6">
          {/* Teachers Section Skeleton */}
          <CardSkeleton>
            <Skeleton className="h-6 w-32 mb-3 lg:mb-4" />
            <div className="overflow-x-auto -mx-4 lg:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <th key={i} className="py-2 lg:py-3 px-3 lg:px-4">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <CircleSkeleton className="w-7 h-7 lg:w-8 lg:h-8" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSkeleton>

          {/* Statistics Section Skeleton */}
          <CardSkeleton>
            <Skeleton className="h-6 w-32 mb-4 lg:mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
              {/* Time Progress */}
              <div className="text-center">
                <Skeleton className="h-4 w-32 mx-auto mb-2 lg:mb-3" />
                <div className="relative">
                  <Skeleton className="h-2 lg:h-3 w-full rounded-full mb-2" />
                  <Skeleton className="h-6 lg:h-7 w-12 mx-auto" />
                </div>
              </div>

              {/* Average Attendance */}
              <div className="flex flex-col items-center justify-center text-center">
                <Skeleton className="h-4 w-32 mb-2 lg:mb-3" />
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-2">
                  <CircleSkeleton className="w-20 h-20 lg:w-24 lg:h-24" />
                </div>
              </div>

              {/* Average Grade */}
              <div className="text-center">
                <Skeleton className="h-4 w-36 mx-auto mb-2 lg:mb-3" />
                <div className="mb-2">
                  <Skeleton className="h-8 lg:h-10 w-16 mx-auto" />
                </div>
                <Skeleton className="h-3 w-40 mx-auto" />
              </div>
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  )
}

