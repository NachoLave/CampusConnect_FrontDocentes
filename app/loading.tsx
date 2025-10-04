"use client"

export default function Loading() {
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Hero Carousel Skeleton */}
      <div className="max-w-7xl mx-auto">
        <div className="relative h-48 md:h-64 lg:h-80 bg-gray-200 animate-pulse rounded-2xl" />
        <div className="flex justify-center items-center mt-6 space-x-3">
          <div className="w-10 h-3 bg-gray-300 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="w-full max-w-[95rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Skeleton */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-7 gap-4 mb-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-4 w-8 bg-gray-200 rounded mb-2 mx-auto animate-pulse" />
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mx-auto animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Next Class Skeleton */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="h-5 w-20 bg-gray-200 rounded mb-4 animate-pulse" />
                  <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}