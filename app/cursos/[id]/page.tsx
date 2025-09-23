"use client"

import { CourseInfo } from "@/components/cursos/course-info"
import { Suspense, useEffect } from "react"

interface CoursePageProps {
  params: {
    id: string
  }
}

function CoursePageContent({ params }: CoursePageProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [params.id])

  return <CourseInfo courseId={params.id} />
}

export default function CoursePage({ params }: CoursePageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoursePageContent params={params} />
    </Suspense>
  )
}
