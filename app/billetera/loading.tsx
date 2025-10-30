"use client"

import { BalanceSkeleton } from "@/components/ui/loaders/balance-skeleton"
import { TransactionListSkeleton } from "@/components/ui/loaders/transaction-skeleton"
import { CardSkeleton, Skeleton, ButtonSkeleton } from "@/components/ui/loaders/skeleton"

export default function WalletLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Balance Card Skeleton */}
          <BalanceSkeleton showActions />

          {/* Transactions List Skeleton */}
          <TransactionListSkeleton count={8} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Account Information */}
          <CardSkeleton>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardSkeleton>

          {/* Quick Actions */}
          <CardSkeleton>
            <Skeleton className="h-6 w-32 mb-4" />
            <ButtonSkeleton className="w-full" />
          </CardSkeleton>

          {/* Monthly Summary */}
          <CardSkeleton>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  )
}
