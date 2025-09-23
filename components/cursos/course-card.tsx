"use client"

import { Users, MapPin, ChevronRight, BookOpen, UserCheck, BarChart3, Building } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation" // Added router import for navigation

interface Teacher {
  id: number
  name: string
  avatar: string
}

interface Course {
  id: number
  title: string
  day: string
  dayColor: string
  code: string
  students: number
  teachers: Teacher[]
  shift: string
  shiftColor: string
  schedule: string
  dates: string
  location: string
  sede: string // Added sede property to interface
  isVirtual: boolean
  image: string
}

interface CourseCardProps {
  course: Course
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getTeacherColor(teacherId: number): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  return colors[teacherId % colors.length]
}

export function CourseCard({ course }: CourseCardProps) {
  const [showActions, setShowActions] = useState(false)
  const router = useRouter() // Added router instance

  const handleInfoClick = () => {
    router.push(`/cursos/${course.id}`)
  }

  const handleAttendanceClick = () => {
    router.push(`/cursos/${course.id}?tab=asistencia`)
  }

  const handleGradesClick = () => {
    router.push(`/cursos/${course.id}?tab=calificaciones`)
  }

  const handleStudentsClick = () => {
    router.push(`/cursos/${course.id}?tab=alumnos`)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Course Image with Day Badge overlay */}
      <div
        className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleInfoClick}
      >
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className={`${course.dayColor} text-white text-xs font-semibold px-3 py-1 inline-flex items-center gap-1 rounded-br-md absolute top-0 left-0 m-0`}>{course.day}</div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-3">{course.title}</h3>

        {/* Course Details */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.code}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.students} alumnos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building className="h-4 w-4" />
            <span>{course.sede}</span> {/* Use dynamic sede from course data */}
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <div className="flex -space-x-1">
              {course.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getTeacherColor(teacher.id)}`}
                  title={teacher.name}
                >
                  <span className="text-white text-xs font-semibold">{getInitials(teacher.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule and Location */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${course.shiftColor} text-white text-xs font-semibold px-2 py-1 rounded`}>
              {course.shift}
            </div>
            <span className="text-sm font-medium">{course.schedule}</span>
            <span className="text-sm text-gray-500">{course.dates}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            {course.isVirtual ? (
              <>
                <MapPin className="h-4 w-4" />
                <span>VIRTUAL</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>{course.location}</span> {/* Show only location without sede info */}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - collapsible on hover */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showActions ? "max-h-24 mt-4 pt-4 border-t border-gray-200" : "max-h-0 mt-0 pt-0 border-t-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleInfoClick}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <BookOpen className="h-3 w-3" />
              <span>INFO</span>
            </button>
            <button
              onClick={handleStudentsClick}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <Users className="h-3 w-3" />
              <span>ALUMNOS</span>
            </button>
            <button
              onClick={handleAttendanceClick}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <UserCheck className="h-3 w-3" />
              <span>ASISTENCIA</span>
            </button>
            <button
              onClick={handleGradesClick}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <BarChart3 className="h-3 w-3" />
              <span>CALIFICACIONES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
