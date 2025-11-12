"use client"

import { Users, MapPin, ChevronRight, BookOpen, UserCheck, BarChart3, Building, Lock } from "lucide-react"
import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { CoursesService } from '@/lib/api/services/courses'

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
  promocionable?: boolean
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


// Abreviaciones y colores para días de la semana
function getDayInfo(day: string): { abbr: string; color: string } {
  const dayUpper = day.toUpperCase().trim()
  
  if (dayUpper.includes('LUNES') || dayUpper.includes('LU')) {
    return { abbr: 'LU', color: 'bg-blue-500' }
  }
  if (dayUpper.includes('MARTES') || dayUpper.includes('MA')) {
    return { abbr: 'MA', color: 'bg-green-500' }
  }
  if (dayUpper.includes('MIERCOLES') || dayUpper.includes('MIÉRCOLES') || dayUpper.includes('MI')) {
    return { abbr: 'MI', color: 'bg-purple-500' }
  }
  if (dayUpper.includes('JUEVES') || dayUpper.includes('JU')) {
    return { abbr: 'JU', color: 'bg-orange-500' }
  }
  if (dayUpper.includes('VIERNES') || dayUpper.includes('VI')) {
    return { abbr: 'VI', color: 'bg-cyan-500' }
  }
  if (dayUpper.includes('SABADO') || dayUpper.includes('SÁBADO') || dayUpper.includes('SA')) {
    return { abbr: 'SA', color: 'bg-pink-500' }
  }
  if (dayUpper.includes('DOMINGO') || dayUpper.includes('DO')) {
    return { abbr: 'DO', color: 'bg-red-500' }
  }
  
  // Default: intentar extraer las primeras 2 letras
  return { abbr: day.substring(0, 2).toUpperCase(), color: 'bg-gray-500' }
}

// Colores para turnos
function getShiftColor(shift: string): string {
  const shiftUpper = shift.toUpperCase()
  if (shiftUpper.includes('TM') || shiftUpper.includes('MAÑANA') || shiftUpper.includes('MANIANA')) {
    return 'bg-amber-500' // Amarillo/naranja para mañana
  }
  if (shiftUpper.includes('TT') || shiftUpper.includes('TARDE')) {
    return 'bg-sky-500' // Azul cielo para tarde
  }
  if (shiftUpper.includes('TN') || shiftUpper.includes('NOCHE')) {
    return 'bg-indigo-600' // Índigo oscuro para noche
  }
  return 'bg-blue-500' // Default
}

// Paleta estandarizada de colores para avatares de docentes
function getTeacherColor(teacherId: number): string {
  const colors = [
    'bg-rose-500',      // Rosa
    'bg-blue-500',      // Azul
    'bg-emerald-500',   // Verde esmeralda
    'bg-violet-500',    // Violeta
    'bg-amber-500',     // Ámbar
    'bg-pink-500',      // Rosa fucsia
    'bg-cyan-500',      // Cian
    'bg-teal-500',      // Verde azulado
    'bg-orange-500',    // Naranja
    'bg-purple-500',    // Púrpura
  ]
  return colors[teacherId % colors.length]
}

export const CourseCard = memo(function CourseCard({ course }: CourseCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [hasActa, setHasActa] = useState(false)
  const [promocionable, setPromocionable] = useState<boolean | null>(() => {
    // Intentar cargar desde localStorage al inicio
    if (typeof window !== 'undefined' && course?.id) {
      try {
        const stored = localStorage.getItem(`course_${course.id}_promocionable`)
        if (stored !== null) {
          return stored === 'true'
        }
      } catch (e) {
        // Ignorar errores de localStorage
      }
    }
    return null
  })
  const [loadingPromocionable, setLoadingPromocionable] = useState(() => {
    // Si no hay valor en localStorage, necesita cargar
    if (typeof window !== 'undefined' && course?.id) {
      try {
        const stored = localStorage.getItem(`course_${course.id}_promocionable`)
        return stored === null
      } catch (e) {
        return true
      }
    }
    return true
  })
  const router = useRouter()

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

  // Check backend for acts for this course and show a lock if an acta exists / is closed
  useEffect(() => {
    let mounted = true
    const fetchActs = async () => {
      try {
        if (!course?.id) return
        const resp = await CoursesService.getActs(Number(course.id))
        if (!mounted) return
        if (resp && resp.success) {
          const acts = Array.isArray(resp.data) ? resp.data : []
          const closed = acts.some((a: any) => (a && ((a.estado && String(a.estado).toUpperCase() === 'CERRADO') || a.actaId)))
          setHasActa(closed || acts.length > 0)
        }
      } catch (err) {
        // ignore errors - don't block UI
      }
    }

    fetchActs()
    return () => { mounted = false }
  }, [course?.id])

  // Obtener información de promocionable del endpoint de detalle
  useEffect(() => {
    let mounted = true
    const fetchCourseDetail = async () => {
      try {
        if (!course?.id) return
        
        // Si ya viene en el curso, usarlo directamente y guardar en localStorage
        if (course.promocionable !== undefined) {
          setPromocionable(course.promocionable)
          setLoadingPromocionable(false)
          try {
            localStorage.setItem(`course_${course.id}_promocionable`, String(course.promocionable))
          } catch (e) {
            // Ignorar errores de localStorage
          }
          return
        }

        // Verificar si ya está en localStorage
        try {
          const stored = localStorage.getItem(`course_${course.id}_promocionable`)
          if (stored !== null) {
            setPromocionable(stored === 'true')
            setLoadingPromocionable(false)
            return
          }
        } catch (e) {
          // Continuar si hay error con localStorage
        }

        // Si no está en localStorage, obtener del endpoint de detalle
        setLoadingPromocionable(true)
        const resp = await CoursesService.getCourseById(Number(course.id))
        if (!mounted) return
        if (resp && resp.success && resp.data) {
          const courseDetail = resp.data as any
          const promocionableValue = courseDetail.promocionable ?? null
          setPromocionable(promocionableValue)
          // Guardar en localStorage
          try {
            if (promocionableValue !== null) {
              localStorage.setItem(`course_${course.id}_promocionable`, String(promocionableValue))
            }
          } catch (e) {
            // Ignorar errores de localStorage
          }
        }
      } catch (err) {
        // ignore errors - don't block UI
      } finally {
        if (mounted) {
          setLoadingPromocionable(false)
        }
      }
    }

    fetchCourseDetail()
    return () => { mounted = false }
  }, [course?.id, course?.promocionable])

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Course Image with Day Badge overlay */}
      <div
        className="relative h-32 lg:h-40 bg-gradient-to-br from-slate-700 to-slate-900 cursor-pointer hover:opacity-95 transition-opacity overflow-hidden"
        onClick={handleInfoClick}
      >
        {/* Imagen de fondo con blur */}
        <div className="absolute inset-0">
          <img
            src="/courseimage.png"
            alt={course.title}
            className="w-full h-full object-cover blur-sm opacity-40"
          />
          {/* Overlay oscuro para mejor contraste */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50"></div>
        </div>
        
        {/* Tag del día - estilo badge minimalista */}
        <div className="absolute top-3 left-3">
          <div className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
            {course.day}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-3 lg:p-4">
        <div className="flex items-start justify-between gap-2 mb-2 lg:mb-3">
          <h3 className="font-semibold text-gray-900 text-base lg:text-lg line-clamp-2 flex-1">
            {course.title}
          </h3>
          {/* Badge y candado alineados a la derecha */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Promocionable o Examen Final */}
            {loadingPromocionable ? (
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : promocionable !== null ? (
              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold transition-opacity duration-300 ${
                promocionable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                <span>{promocionable ? 'PROMOCIONABLE' : 'EXAMEN FINAL'}</span>
              </div>
            ) : null}
            {/* Candado cuando el curso está cerrado */}
            {(hasActa || (course.status || '').toUpperCase().includes('ACTA')) && (
              <span title="Acta generada - curso cerrado" className="flex items-center">
                <Lock className="h-4 w-4 text-gray-500 flex-shrink-0" aria-hidden />
              </span>
            )}
          </div>
        </div>

        {/* Course Details */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 lg:mb-4 text-xs lg:text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">{course.code}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{course.students} alumnos</span>
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
            {/* Turno con color según horario */}
            <div className={`${getShiftColor(course.shift)} text-white text-xs font-semibold px-2 py-0.5 lg:py-1 rounded flex-shrink-0`}>
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
