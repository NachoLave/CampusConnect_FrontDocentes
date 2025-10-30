"use client"

import { CardSkeleton, Skeleton, CircleSkeleton, ButtonSkeleton } from "@/components/ui/loaders/skeleton"

export default function PerfilLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <CardSkeleton>
        <div className="flex items-center space-x-4">
          <CircleSkeleton className="w-20 h-20" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </CardSkeleton>

      {/* Profile Information */}
      <CardSkeleton>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardSkeleton>

      {/* Academic Information */}
      <CardSkeleton>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <ButtonSkeleton />
        </div>
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </CardSkeleton>

      {/* Schedule Availability */}
      <CardSkeleton>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <ButtonSkeleton />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardSkeleton>
    </div>
  )
}

