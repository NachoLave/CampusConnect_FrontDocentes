"use client"

import { Users, MapPin, ChevronRight, BookOpen, UserCheck, BarChart3, Building } from "lucide-react"
import { useState, useEffect, memo } from "react"
import { CoursesService } from "@/lib/api/services"
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
  dayColor?: string
  code: string
  students: number
  teachers: Teacher[]
  shift: string
  shiftColor?: string
  schedule: string
  dates?: string
  location?: string
  sede: string
  isVirtual?: boolean
  image?: string
  // Campos adicionales del backend
  modality?: string
  classroom?: string
  professor?: string
  credits?: number
  description?: string
  status?: string
  // Información automática agregada por el frontend
  horarioInicio?: string
  horarioFin?: string
  turnoAbreviacion?: string
  fechaInicio?: string
  fechaFin?: string
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

export const CourseCard = memo(function CourseCard({ course }: CourseCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [studentCount, setStudentCount] = useState<number>(course.students ?? 0)
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
  // Actualizar cantidad de alumnos desde el roster
  useEffect(() => {
    let isMounted = true
    CoursesService.getCourseRoster(course.id)
      .then((resp) => {
        if (isMounted && resp.success) {
          setStudentCount(Array.isArray(resp.data) ? resp.data.length : 0)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [course.id])

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
        className="relative h-32 lg:h-40 bg-gradient-to-br from-slate-700 to-slate-900 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleInfoClick}
      >
        <img
          src={course.image || "/images/course-background.png"}
          alt={course.title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className={`${course.dayColor} text-white text-xs font-semibold px-2 lg:px-3 py-1 inline-flex items-center gap-1 rounded-br-md absolute top-0 left-0 m-0`}>{course.day}</div>
      </div>

      {/* Course Content */}
      <div className="p-3 lg:p-4">
        <h3 className="font-semibold text-gray-900 text-base lg:text-lg mb-2 lg:mb-3 line-clamp-2">{course.title}</h3>

        {/* Course Details */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 lg:mb-4 text-xs lg:text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">{course.code}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{studentCount} alumnos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">{course.sede}</span>
          </div>
          {/* Modalidad */}
          {course.modality && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="truncate">{course.modality}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {course.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white flex items-center justify-center ${getTeacherColor(teacher.id)}`}
                  title={teacher.name}
                >
                  <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(teacher.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule and Location */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3 lg:mb-4">
          <div className="flex items-center flex-wrap gap-2 lg:gap-3">
            {/* Turno con abreviación automática */}
            <div className={`${course.shiftColor || 'bg-blue-500'} text-white text-xs font-semibold px-2 py-0.5 lg:py-1 rounded flex-shrink-0`}>
              {course.turnoAbreviacion || course.shift}
            </div>
            
            {/* Horario automático */}
            {course.horarioInicio && course.horarioFin && (
              <span className="text-xs lg:text-sm font-medium whitespace-nowrap bg-gray-100 px-2 py-1 rounded">
                {course.horarioInicio} - {course.horarioFin}
              </span>
            )}
            
            {/* Schedule original como fallback */}
            <span className="text-xs lg:text-sm font-medium whitespace-nowrap">{course.schedule}</span>
            
            {/* Fechas automáticas */}
            {course.fechaInicio && course.fechaFin && (
              <span className="text-xs lg:text-sm text-gray-500 truncate bg-gray-50 px-2 py-1 rounded">
                {course.fechaInicio} - {course.fechaFin}
              </span>
            )}
            
            {/* Fechas originales como fallback */}
            {course.dates && (
              <span className="text-xs lg:text-sm text-gray-500 truncate">{course.dates}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs lg:text-sm text-gray-600">
            {course.isVirtual ? (
              <>
                <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                <span>VIRTUAL</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                <span className="truncate">{course.classroom || course.location || course.sede}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - collapsible on hover (desktop) / always visible (mobile) */}
        <div
          className={`overflow-hidden transition-all duration-300
            ${showActions ? "lg:max-h-24 lg:mt-4 lg:pt-4 lg:border-t lg:border-gray-200" : "lg:max-h-0 lg:mt-0 lg:pt-0 lg:border-t-0"}
            max-h-24 mt-3 pt-3 border-t border-gray-200
          `}
        >
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3">
            <button
              onClick={handleInfoClick}
              className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 text-gray-700 text-[10px] lg:text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <BookOpen className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">INFO</span>
            </button>
            <button
              onClick={handleStudentsClick}
              className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 text-gray-700 text-[10px] lg:text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <Users className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">ALUMNOS</span>
            </button>
            <button
              onClick={handleAttendanceClick}
              className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 text-gray-700 text-[10px] lg:text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <UserCheck className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">ASISTENCIA</span>
            </button>
            <button
              onClick={handleGradesClick}
              className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 text-gray-700 text-[10px] lg:text-xs rounded hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all duration-200"
            >
              <BarChart3 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">CALIFICACIONES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
