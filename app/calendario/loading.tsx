"use client"

import { CalendarSkeleton } from "@/components/ui/loaders/calendar-skeleton"

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <CalendarSkeleton />
    </div>
  )
}
