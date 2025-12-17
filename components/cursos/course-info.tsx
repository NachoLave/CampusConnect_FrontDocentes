"use client"

import {
  ArrowLeft,
  FileText,
  Users,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  RotateCcw,
  ChevronDown,
  ClipboardCheck,
  Eye,
  Calendar,
} from "lucide-react"
import { CardSkeleton, Skeleton, ButtonSkeleton, CircleSkeleton } from "@/components/ui/loaders/skeleton"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { CoursesService, mapBackendCourseToFrontend } from '@/lib/api/services/courses'
import { CalendarService, ClaseIndividual } from '@/lib/api/services/calendar'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import { authService } from '@/lib/api/services/auth'
import CourseNotFound from '@/app/cursos/[id]/not-found'

/**
 * Helper: Configura los headers X-Teacher-Id y X-Teacher-Roles con el UUID real del docente.
 * Usar para llamadas al backend de nuestro módulo que requieren estos headers.
 * @param teacherRole - Rol del docente en el curso: 'TITULAR' o 'AUXILIAR'
 */
const setRealTeacherHeader = (teacherRole?: string) => {
  const teacherUUID = authService.getTeacherUUID()
  if (teacherUUID) {
    apiClient.setTeacherHeaders(teacherUUID, teacherRole)
  } else {
    // Fallback: si no hay UUID real, usar el mock (para desarrollo)
    try { 
      apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) 
    } catch {}
  }
}

interface CourseInfoProps {
  courseId: string
}

// Mock data - in real app this would come from API
const getCourseData = (id: string) => {
  const courses = {
    "1": {
      id: 1,
      title: "Desarrollo de Aplicaciones II",
      code: "18068",
      students: 31,
      day: "MIÉRCOLES",
      shift: "TT",
      schedule: "14:00 - 18:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "VIRTUAL",
      isVirtual: true,
      status: "Finalizado",
      teachers: [
        { id: 1, name: "Martín Perez", legajo: "123456", email: "martin.perez@campusconnect.edu.ar", role: "Titular" },
        { id: 2, name: "Lucia Lopez", legajo: "456789", email: "lucia.lopez@campusconnect.edu.ar", role: "Auxiliar" },
      ],
      studentsData: [
        {
          id: 1,
          name: "Juan Alvarez",
          legajo: "123456",
          email: "juan.alvarez@campusconnect.edu.ar",
          condition: "Adeuda final",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Lucia Barbara",
          legajo: "456789",
          email: "lucia.barbara@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Ausente",
        },
        {
          id: 3,
          name: "Tomás Copa",
          legajo: "456789",
          email: "tomas.copa@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 4,
          name: "Thiago Di Maria",
          legajo: "456789",
          email: "thiago.dimaria@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "1/2 Falta",
        },
        {
          id: 5,
          name: "Lucia Maradona",
          legajo: "456789",
          email: "lucia.maradona@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 6,
          name: "Marta Perez",
          legajo: "456789",
          email: "marta.perez@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Ausente",
        },
        {
          id: 7,
          name: "Augusto Marquez",
          legajo: "456789",
          email: "augusto.marquez@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
      ],
      stats: {
        timeProgress: 75,
        averageAttendance: 62,
        averageGrade: 6.25,
      },
    },
    "2": {
      id: 2,
      title: "Arquitectura de Aplicaciones",
      code: "18068",
      students: 60,
      day: "JUEVES",
      shift: "TM",
      schedule: "8:00 - 12:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "LIMA 1 - 234 (Sede Monserrat)",
      isVirtual: false,
      status: "En curso",
      teachers: [
        {
          id: 1,
          name: "Carlos Rodriguez",
          legajo: "789012",
          email: "carlos.rodriguez@campusconnect.edu.ar",
          role: "Titular",
        },
      ],
      studentsData: [
        {
          id: 1,
          name: "Ana García",
          legajo: "234567",
          email: "ana.garcia@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Pedro Martínez",
          legajo: "345678",
          email: "pedro.martinez@campusconnect.edu.ar",
          condition: "Adeuda final",
          attendance: "Ausente",
        },
      ],
      stats: {
        timeProgress: 45,
        averageAttendance: 78,
        averageGrade: 7.15,
      },
    },
    "3": {
      id: 3,
      title: "Desarrollo de Aplicaciones I",
      code: "18068",
      students: 55,
      day: "JUEVES",
      shift: "TT",
      schedule: "14:00 - 18:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "VIRTUAL",
      isVirtual: true,
      status: "En curso",
      teachers: [
        {
          id: 1,
          name: "María González",
          legajo: "567890",
          email: "maria.gonzalez@campusconnect.edu.ar",
          role: "Titular",
        },
      ],
      studentsData: [
        {
          id: 1,
          name: "Diego Silva",
          legajo: "456789",
          email: "diego.silva@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Laura Fernández",
          legajo: "567890",
          email: "laura.fernandez@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "1/2 Falta",
        },
      ],
      stats: {
        timeProgress: 60,
        averageAttendance: 85,
        averageGrade: 8.2,
      },
    },
    "4": {
      id: 4,
      title: "Base de Datos Avanzada",
      code: "18075",
      students: 42,
      day: "LUNES",
      shift: "TN",
      schedule: "18:00 - 22:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "AULA 305 (Sede Belgrano)",
      isVirtual: false,
      status: "En curso",
      teachers: [
        { id: 3, name: "Roberto Díaz", legajo: "678901", email: "roberto.diaz@campusconnect.edu.ar", role: "Titular" },
        { id: 4, name: "Carmen Ruiz", legajo: "789012", email: "carmen.ruiz@campusconnect.edu.ar", role: "Auxiliar" },
      ],
      studentsData: [
        {
          id: 1,
          name: "Sebastián Torres",
          legajo: "678901",
          email: "sebastian.torres@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Valentina Castro",
          legajo: "789012",
          email: "valentina.castro@campusconnect.edu.ar",
          condition: "Adeuda final",
          attendance: "Ausente",
        },
        {
          id: 3,
          name: "Mateo Herrera",
          legajo: "890123",
          email: "mateo.herrera@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "1/2 Falta",
        },
      ],
      stats: {
        timeProgress: 0,
        averageAttendance: 0,
        averageGrade: 0,
      },
    },
    "5": {
      id: 5,
      title: "Programación Web Full Stack",
      code: "18082",
      students: 38,
      day: "MARTES",
      shift: "TM",
      schedule: "8:00 - 12:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "LAB 201 (Sede Recoleta)",
      isVirtual: false,
      status: "En curso",
      teachers: [
        {
          id: 5,
          name: "Andrea Morales",
          legajo: "901234",
          email: "andrea.morales@campusconnect.edu.ar",
          role: "Titular",
        },
      ],
      studentsData: [
        {
          id: 1,
          name: "Facundo López",
          legajo: "012345",
          email: "facundo.lopez@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Camila Vega",
          legajo: "123456",
          email: "camila.vega@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
      ],
      stats: {
        timeProgress: 0,
        averageAttendance: 0,
        averageGrade: 0,
      },
    },
    "6": {
      id: 6,
      title: "Inteligencia Artificial",
      code: "18090",
      students: 28,
      day: "VIERNES",
      shift: "TT",
      schedule: "14:00 - 18:00",
      dates: "01/08/2025 - 23/12/2025",
      location: "AULA 102 (Sede Campus Costa Pinamar)",
      isVirtual: false,
      status: "En curso",
      teachers: [
        {
          id: 6,
          name: "Alejandro Paz",
          legajo: "234567",
          email: "alejandro.paz@campusconnect.edu.ar",
          role: "Titular",
        },
        {
          id: 7,
          name: "Sofía Mendoza",
          legajo: "345678",
          email: "sofia.mendoza@campusconnect.edu.ar",
          role: "Auxiliar",
        },
      ],
      studentsData: [
        {
          id: 1,
          name: "Ignacio Romero",
          legajo: "456789",
          email: "ignacio.romero@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Florencia Sosa",
          legajo: "567890",
          email: "florencia.sosa@campusconnect.edu.ar",
          condition: "Adeuda final",
          attendance: "1/2 Falta",
        },
      ],
      stats: {
        timeProgress: 0,
        averageAttendance: 0,
        averageGrade: 0,
      },
    },
    "7": {
      id: 7,
      title: "Seguridad Informática",
      code: "18095",
      students: 35,
      day: "SÁBADO",
      shift: "TM",
      schedule: "9:00 - 13:00",
      dates: "01/08/2025 - 30/11/2025",
      location: "LAB 150 (Sede Monserrat)",
      isVirtual: false,
      status: "En curso",
      teachers: [
        {
          id: 8,
          name: "Gabriel Ortega",
          legajo: "678901",
          email: "gabriel.ortega@campusconnect.edu.ar",
          role: "Titular",
        },
      ],
      studentsData: [
        {
          id: 1,
          name: "Nicolás Blanco",
          legajo: "789012",
          email: "nicolas.blanco@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Presente",
        },
        {
          id: 2,
          name: "Martina Ramos",
          legajo: "890123",
          email: "martina.ramos@campusconnect.edu.ar",
          condition: "Regular",
          attendance: "Ausente",
        },
      ],
      stats: {
        timeProgress: 0,
        averageAttendance: 0,
        averageGrade: 0,
      },
    },
  }

  return courses[id as keyof typeof courses] || courses["1"]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getTeacherColor(teacherId: number | string): string {
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
  // Si es string (UUID), convertir a numero usando hash
  const numericId = typeof teacherId === 'string' 
    ? teacherId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : teacherId
  return colors[numericId % colors.length]
}

function getStudentColor(studentId: number | string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-red-500",
  ]
  // Si es string (UUID), convertir a numero usando hash
  const numericId = typeof studentId === 'string' 
    ? studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : studentId
  return colors[numericId % colors.length]
}

function getDayShiftColors(day: string, shift: string) {
  const shiftColorMap: { [key: string]: string } = {
    TM: "bg-yellow-600",
    TT: "bg-green-600",
    TN: "bg-gray-600",
  }

  return shiftColorMap[shift] || "bg-gray-600" // fallback to gray
}

export default function CourseInfo({ courseId }: { courseId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams() // Added to read URL parameters
  
  // Detectar si courseId es un UUID (contiene guiones)
  const isUUIDCourse = courseId.includes('-')
  // Obtener courseId en formato correcto para llamadas API
  const getCourseIdForApi = () => isUUIDCourse ? courseId : Number(courseId)

  const getInitialTab = () => {
    const tabParam = searchParams.get("tab")
    switch (tabParam) {
      case "asistencia":
        return "Asistencia"
      case "calificaciones":
        return "Calificaciones"
      case "alumnos":
        return "Alumnos"
      default:
        return "Información"
    }
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [searchTerm, setSearchTerm] = useState("")
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState("")
  const [gradesSearchTerm, setGradesSearchTerm] = useState("")

  const [showGradesFilter, setShowGradesFilter] = useState(false)
  const [gradesFilterConditions, setGradesFilterConditions] = useState<string[]>([])
  const [showAttendanceFilter, setShowAttendanceFilter] = useState(false)
  const [attendanceFilterStatuses, setAttendanceFilterStatuses] = useState<string[]>([])
  const [showStudentsFilter, setShowStudentsFilter] = useState(false)
  const [studentsFilterConditions, setStudentsFilterConditions] = useState<string[]>([])

  // Cerrar filtros al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Para el filtro de Alumnos
      const studentsButton = document.querySelector('[aria-label="Filtrar por condición"]')
      const studentsDropdown = studentsButton?.nextElementSibling
      if (showStudentsFilter && studentsButton && studentsDropdown) {
        if (!studentsButton.contains(target) && !studentsDropdown.contains(target)) {
          setShowStudentsFilter(false)
        }
      }
      
      // Para el filtro de Asistencia
      const attendanceButton = document.querySelector('[aria-label="Filtrar por asistencia"]')
      const attendanceDropdown = attendanceButton?.nextElementSibling
      if (showAttendanceFilter && attendanceButton && attendanceDropdown) {
        if (!attendanceButton.contains(target) && !attendanceDropdown.contains(target)) {
          setShowAttendanceFilter(false)
        }
      }
      
      // Para el filtro de Calificaciones
      const gradesButton = document.querySelector('[aria-label="Filtrar por condición final"]')
      const gradesDropdown = gradesButton?.nextElementSibling
      if (showGradesFilter && gradesButton && gradesDropdown) {
        if (!gradesButton.contains(target) && !gradesDropdown.contains(target)) {
          setShowGradesFilter(false)
        }
      }
    }

    if (showStudentsFilter || showAttendanceFilter || showGradesFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStudentsFilter, showAttendanceFilter, showGradesFilter])

  const [showActaModal, setShowActaModal] = useState(false)
  const [showActaPreviewModal, setShowActaPreviewModal] = useState(false)
  const [showActaConfirmModal, setShowActaConfirmModal] = useState(false)
  const [generatingAct, setGeneratingAct] = useState(false)
  const [isCourseLocked, setIsCourseLocked] = useState(false)
  const [showActaGeneratedModal, setShowActaGeneratedModal] = useState(false)
  const [showActaErrorModal, setShowActaErrorModal] = useState(false)
  const [actaErrorMessage, setActaErrorMessage] = useState<string | null>(null)
  const [showAttendanceSavedModal, setShowAttendanceSavedModal] = useState(false)
  const [showGradesSaveModal, setShowGradesSaveModal] = useState(false)
  const [showGradesAlertModal, setShowGradesAlertModal] = useState(false)
  const [gradesAlertMessage, setGradesAlertMessage] = useState("")
  const [gradesAlertType, setGradesAlertType] = useState<'success' | 'error' | 'info'>('error')
  const [savingGrades, setSavingGrades] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("Septiembre")
  const [selectedDate, setSelectedDate] = useState(21)
  // studentId es UUID string, no número
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: { [key: string]: "P" | "1/2" | "A" } }>({})
  const [hasUnsavedAttendance, setHasUnsavedAttendance] = useState(false)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)
  
  // Rol del docente actual en este curso (TITULAR o AUXILIAR)
  // Se obtiene de la lista de docentes del curso comparando con el UUID del usuario logueado
  const [currentTeacherRole, setCurrentTeacherRole] = useState<string | undefined>(undefined)

  // Bloquear scroll del body cuando el modal de preview está abierto
  useEffect(() => {
    if (showActaPreviewModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showActaPreviewModal])

  // Persistencia local por curso
  const attendanceStorageKey = `attendance_${courseId}`
  useEffect(() => {
    try {
      const raw = localStorage.getItem(attendanceStorageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') setAttendanceData(parsed)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  // Check backend if there are acts for this course and block edits when an acta is closed
  useEffect(() => {
    let mounted = true
    const loadActs = async () => {
      try {
        // Pasar el rol del docente si está disponible
        const resp = await CoursesService.getActs(getCourseIdForApi())
        if (!mounted) return
        if (resp && resp.success) {
          const acts = Array.isArray(resp.data) ? resp.data : []
          const closed = acts.some((a: any) => (a && ((a.estado && String(a.estado).toUpperCase() === 'CERRADO') || a.actaId)))
          if (closed || acts.length > 0) setIsCourseLocked(true)
        }
      } catch (err) {
        // ignore - don't block on error
      }
    }

    loadActs()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])
  useEffect(() => {
    try {
      localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceData))
    } catch {}
  }, [attendanceData])
  const [isEditingGrades, setIsEditingGrades] = useState(false)
  const [gradesData, setGradesData] = useState<Record<string, Record<string, string>>>({})
  // Estado para guardar las calificaciones originales del backend (para comparar cambios)
  const [originalGradesData, setOriginalGradesData] = useState<Record<string, Record<string, string>>>({})

  // Salir del modo edición si cambia de pestaña
  useEffect(() => {
    if (activeTab !== 'Calificaciones' && isEditingGrades) {
      setIsEditingGrades(false)
    }
  }, [activeTab, isEditingGrades])

  // Salir del modo edición si cambia de pestaña
  useEffect(() => {
    if (activeTab !== 'Calificaciones' && isEditingGrades) {
      setIsEditingGrades(false)
    }
  }, [activeTab, isEditingGrades])
  const [loadingGrades, setLoadingGrades] = useState(false)
  // Estado para guardar los assessmentId de cada tipo de evaluación
  const [assessmentIds, setAssessmentIds] = useState<Record<string, string | number>>({})
  // Estado para guardar las evaluaciones (assessments) para validar si están vacías
  const [assessments, setAssessments] = useState<any[]>([])
  // Estado para almacenar los datos del preview del acta
  const [actsPreviewData, setActsPreviewData] = useState<any>(null)

  // Persistencia local de calificaciones por curso
  const gradesStorageKey = `grades_${courseId}`
  useEffect(() => {
    try {
      const raw = localStorage.getItem(gradesStorageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Record<string, string>>
        if (parsed && typeof parsed === 'object') {
          // Normalizar condición calculada
          const normalized: Record<string, Record<string, string>> = {}
          Object.entries(parsed).forEach(([sid, grades]) => {
            const g: Record<string, string> = {}
            // Sanitize each grade value using validateAndRoundGrade
            Object.entries(grades || {}).forEach(([k, v]) => {
              if (k === 'CONDICIÓN FINAL') return
              g[k] = validateAndRoundGrade(String(v ?? ''))
            })
            // Recompute condition
            g["CONDICIÓN FINAL"] = calculateFinalCondition(g)
            normalized[sid] = g
          })
          setGradesData(normalized)
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])
  useEffect(() => {
    try {
      localStorage.setItem(gradesStorageKey, JSON.stringify(gradesData))
    } catch {}
  }, [gradesData])

  // Load grades from backend (cargar siempre para estadísticas, no solo cuando se abre la pestaña)
  // Cargar calificaciones una sola vez al montar el componente (no al cambiar de pestaña)
  useEffect(() => {
    let mounted = true
    const loadGrades = async () => {
      // Cargar siempre para poder calcular estadísticas, no solo cuando activeTab === 'Calificaciones'
      setLoadingGrades(true)
      try {
        const resp = await CoursesService.getCourseGrades(getCourseIdForApi())
        if (!mounted) return
        
        if (resp && resp.success && Array.isArray(resp.data)) {
          const assessmentsData: any[] = resp.data
          // Guardar las assessments para validar si están vacías
          setAssessments(assessmentsData)
          const updated: Record<string, Record<string, string>> = {}
          const assessmentIdsMap: Record<string, string | number> = {}

          // Map assessment types to internal grade keys
          // Mapeo directo entre tipos del backend y claves internas
          const mapTipoToKey = (tipo: string) => {
            const t = String(tipo || '').toUpperCase().trim()
            // Mapeo exacto
            if (t === 'PARCIAL_1') return '1P'
            if (t === 'PARCIAL_2') return '2P'
            if (t === 'RECUPERATORIO') return 'REC'
            if (t === 'FINAL') return 'FINAL'
            // Fallback para variantes
            if (t.includes('PARCIAL') && t.includes('1')) return '1P'
            if (t.includes('PARCIAL') && t.includes('2')) return '2P'
            if (t.includes('RECUP') || t.includes('REC')) return 'REC'
            if (t.includes('FINAL')) return 'FINAL'
            return ''
          }

          for (const ass of assessmentsData) {
            const key = mapTipoToKey(ass.tipo)
            if (!key) {
              continue
            }
            
            // Guardar el assessmentId para este tipo de evaluación
            // IMPORTANTE: Guardar incluso si no hay grades, porque el assessment existe en el backend
            if (ass.assessmentId) {
              assessmentIdsMap[key] = ass.assessmentId
            }
            
            const gradesArr = Array.isArray(ass.grades) ? ass.grades : []
            
            for (const g of gradesArr) {
              const sid = String(g.studentId ?? g.studentId)
              
              if (!updated[sid]) updated[sid] = {}
              // Sanitize backend values to ensure only numeric grades (rounded to 0.5) are stored
              const sanitized = validateAndRoundGrade(String(g.grade ?? ''))
              updated[sid][key] = sanitized
            }
          }

          // Ensure all students exist in the map (even if empty)
          for (const s of students) {
            const sid = String(s.id)
            if (!updated[sid]) {
              updated[sid] = {}
            }
          }

          // Calculate final condition for each student
          Object.keys(updated).forEach((sid) => {
            updated[sid]["CONDICIÓN FINAL"] = calculateFinalCondition(updated[sid])
          })

          // Guardar una copia profunda de las calificaciones originales para comparar cambios
          const originalCopy: Record<string, Record<string, string>> = {}
          Object.keys(updated).forEach((sid) => {
            originalCopy[sid] = { ...updated[sid] }
          })
          setOriginalGradesData(originalCopy)

          setGradesData(updated)
          setAssessmentIds(assessmentIdsMap)
        } else if (resp && resp.success && Array.isArray(resp.data) && resp.data.length === 0) {
          // Si la respuesta es exitosa pero el array está vacío, guardar array vacío
          setAssessments([])
          setGradesData({})
          setAssessmentIds({})
        } else if (resp && resp.success && (!resp.data || !Array.isArray(resp.data))) {
          // Si la respuesta es exitosa pero no hay data o no es un array, también considerar vacío
          setAssessments([])
        }
      } catch (err) {
        // En caso de error, también inicializar como vacío
        setAssessments([])
      } finally {
        if (mounted) {
          setLoadingGrades(false)
        }
      }
    }

    loadGrades()
    return () => { mounted = false }
  }, [courseId]) // Removido activeTab de las dependencias

  // Start with a minimal placeholder (do NOT show full mock data)
  const placeholderCourse = {
    id: isUUIDCourse ? 0 : Number(courseId),
    uuid: isUUIDCourse ? courseId : undefined,
    title: 'MISSING',
    code: '',
    students: 0,
    day: '',
    shift: '',
    schedule: '',
    // safe default so existing date parsing doesn't crash
    dates: '01/01/1970 - 01/01/1970',
    location: '',
    isVirtual: false,
    status: '',
    teachers: [] as any[],
    studentsData: [] as any[],
    promocionable: true, // Por defecto true
    stats: {
      timeProgress: 0,
      averageAttendance: 0,
      averageGrade: 0,
    },
  }

  const [course, setCourse] = useState(() => placeholderCourse)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [courseLoadError, setCourseLoadError] = useState<string | null>(null)
  const [courseNotFound, setCourseNotFound] = useState(false)
  const students = course.studentsData || []

  // Determine if the current logged-in teacher is an Auxiliar in this course
  const { getProfile } = useAuth()
  const isUserAuxiliarInCourse = useMemo(() => {
    try {
      // Primero intentar usar currentTeacherRole si está disponible (más confiable)
      if (currentTeacherRole) {
        const roleUpper = String(currentTeacherRole).toUpperCase()
        return roleUpper.includes('AUXILIAR') || roleUpper.includes('AUX')
      }

      // Obtener UUID del docente autenticado
      const myUUID = authService.getTeacherUUID()
      if (!myUUID) {
        // Fallback: intentar obtener desde profile
      const profile: any = getProfile ? getProfile() : null
        if (profile && profile.uuid) {
          const profileUUID = profile.uuid
          if (course && Array.isArray((course as any).teachers)) {
            const myTeacher = (course as any).teachers.find((t: any) => {
              const teacherUUID = t.uuid || t.teacherId || t.id
              return String(teacherUUID) === String(profileUUID)
            })
            if (myTeacher) {
              const role = String(myTeacher.role || myTeacher.rol || '').toUpperCase()
              return role.includes('AUXILIAR') || role.includes('AUX')
            }
          }
        }
        return false
      }

      // Comparar por UUID con los docentes del curso
      if (course && Array.isArray((course as any).teachers)) {
        const myTeacher = (course as any).teachers.find((t: any) => {
          const teacherUUID = t.uuid || t.teacherId || t.id
          return String(teacherUUID) === String(myUUID)
        })
        
        if (myTeacher) {
          const role = String(myTeacher.role || myTeacher.rol || '').toUpperCase()
          return role.includes('AUXILIAR') || role.includes('AUX')
        }
      }

      // Fallback: usar profile id numérico (para compatibilidad legacy)
      const profile: any = getProfile ? getProfile() : null
      if (profile && course && Array.isArray((course as any).teachers)) {
        const myId = Number(profile.id)
        if (myId && myId > 0) {
        return (course as any).teachers.some((t: any) => {
          const tid = Number(t.teacherId ?? t.id ?? 0)
            const role = String(t.role || t.rol || t.roleName || '').toUpperCase()
            return tid === myId && (role.includes('AUXILIAR') || role.includes('AUX'))
        })
        }
      }

      // Fallback: use apiClient mock headers when profile is not available
      try {
        const mh: any = apiClient.getMockHeaders ? apiClient.getMockHeaders() : null
        if (mh && mh.teacherId) {
          const myId = Number(mh.teacherId)
          const rolesCsv = String(mh.roles || '')
          const hasAuxRoleGlobally = rolesCsv.split(',').map((s: string) => s.trim().toUpperCase()).includes('AUXILIAR') || rolesCsv.toUpperCase().includes('AUX')
          if (!hasAuxRoleGlobally) return false
          if (course && Array.isArray((course as any).teachers)) {
            return (course as any).teachers.some((t: any) => Number(t.teacherId ?? t.id ?? 0) === myId && String(t.role || '').toUpperCase().includes('AUX'))
          }
        }
      } catch {}

      return false
    } catch (err) {
      return false
    }
  }, [course, getProfile, currentTeacherRole])

  // Debug: log role detection info to help QA (remove in production)
  useEffect(() => {
    try {
      const profile = getProfile ? getProfile() : null
      const mh = apiClient.getMockHeaders ? apiClient.getMockHeaders() : null
      const myUUID = authService.getTeacherUUID()
      const courseTeachers = course && Array.isArray((course as any).teachers) ? (course as any).teachers : []
      // eslint-disable-next-line no-console
      console.debug('[CourseInfo] role-detect:', { 
        profile, 
        mockHeaders: mh, 
        currentTeacherRole,
        myUUID,
        courseTeachers: courseTeachers.map((t: any) => ({ uuid: t.uuid, id: t.id, role: t.role })),
        isUserAuxiliarInCourse 
      })
    } catch {}
  }, [course, getProfile, isUserAuxiliarInCourse, currentTeacherRole])

  // Helper to normalize condition/status values (function declaration so it's available to earlier code)
  function formatConditionKey(raw?: string | null): string {
    if (!raw) return ''
    const s = String(raw).trim().toUpperCase()
    if (!s) return ''
    if (s.includes('ACT')) return 'ACTIVA'
    if (s.includes('REG')) return 'REGULAR'
    if (s.includes('ADEUDA')) return 'ADEUDA FINAL'
    if (s.includes('PRESENTE')) return 'ACTIVA'
    return s
  }

  function getConditionBadgeClasses(condKey: string) {
    if (!condKey) return 'bg-orange-100 text-orange-800'
    if (condKey === 'ACTIVA') return 'bg-green-100 text-green-800'
    if (condKey === 'REGULAR') return 'bg-yellow-100 text-yellow-800'
    return 'bg-orange-100 text-orange-800'
  }

  // Fetch real course data + roster from backend and merge into the same shape
  useEffect(() => {
    let mounted = true

    const load = async () => {
        setLoadingCourse(true)
        try {
          // Detectar si courseId es un UUID (contiene guiones)
          const isUUID = courseId.includes('-')
          
          let partsResp: any
          
          if (isUUID) {
            // Usar API externa para cursos con UUID
            partsResp = await CoursesService.getCourseParticipantsByUUID(courseId)
          } else {
            // Usar API interna para cursos con ID numérico (legacy)
            setRealTeacherHeader()
            partsResp = await CoursesService.getCourseParticipants(Number(courseId))
          }
          
          if (!mounted) return

          if (partsResp && partsResp.success && partsResp.data) {
            const backendCourse: any = partsResp.data.course || {}
            
            // Debug: log raw backend response
            console.debug('[CourseInfo] getCourseParticipants response', partsResp)
            console.debug('[CourseInfo] backendCourse raw', backendCourse)
            
            // Mapear estudiantes - Ahora viene uuid/studentId
            const rawStudents: any[] = Array.isArray(partsResp.data.students) ? partsResp.data.students : []
            const studentsData: any[] = rawStudents.map((s: any) => ({
              id: s.uuid || s.studentId || s.id,
              uuid: s.uuid || s.studentId || s.id,
              name: s.name || s.studentName || 'Alumno',
              legajo: s.legajo?.toString?.() || '',
              email: s.email || '',
              condition: formatConditionKey(s.condition || s.status || ''),
              attendance: s.attendance || '',
              dni: s.dni,
              telefono: s.telefono,
              carreraUuid: s.carreraUuid,
              activo: s.activo
            }))
            
            const teachersFromBackend: any[] = Array.isArray(partsResp.data.teachers) ? partsResp.data.teachers : []
            
            // Normalizar docentes
            const normalizedTeachers = teachersFromBackend.map((t: any) => ({
              id: t.uuid || t.teacherId || t.id,
              uuid: t.uuid || t.teacherId || t.id,
              name: t.name || t.fullName || '',
              legajo: t.legajo?.toString?.() || '',
              email: t.email || '',
              role: t.role || 'Docente',
              dni: t.dni
            }))

            // Detectar el rol del docente actual en este curso
            const myUUID = authService.getTeacherUUID()
            if (myUUID && teachersFromBackend.length > 0) {
              const myTeacher = teachersFromBackend.find((t: any) => 
                (t.uuid || t.teacherId || t.id) === myUUID
              )
              if (myTeacher) {
                // El rol puede venir como 'Titular', 'TITULAR', 'Auxiliar', 'AUXILIAR'
                const role = (myTeacher.role || '').toUpperCase()
                const normalizedRole = role.includes('TITULAR') ? 'TITULAR' : 
                                       role.includes('AUXILIAR') ? 'AUXILIAR' : 
                                       role.includes('AUX') ? 'AUXILIAR' : undefined
                setCurrentTeacherRole(normalizedRole)
              } else {
              }
            }

            // Para cursos con UUID, los datos ya vienen normalizados
            if (isUUID) {
              const merged = {
                ...placeholderCourse,
                ...backendCourse,
                uuid: courseId,
                title: backendCourse.title || backendCourse.materia || placeholderCourse.title,
                teachers: normalizedTeachers,
                studentsData,
                students: studentsData.length,
                stats: placeholderCourse.stats,
              }
              
              setCourse(merged)
              setCourseLoadError(null)
              setCourseNotFound(false)
            } else {
              // Flujo legacy para IDs numericos
              const rawDay = String(backendCourse.diaSemana || backendCourse.day || '').toUpperCase()
              const dayLabel = rawDay ? (rawDay[0] + rawDay.slice(1).toLowerCase()) : placeholderCourse.day

              const turno = String(backendCourse.turno || backendCourse.shift || '').toUpperCase()
              const shiftMap: Record<string, string> = { 'MANIANA': 'TM', 'MAÑANA': 'TM', 'TARDE': 'TT', 'NOCHE': 'TN', 'TN': 'TN', 'TT': 'TT', 'TM': 'TM' }
              const shiftAbbr = shiftMap[turno] || (turno || placeholderCourse.shift)

              const schedule = backendCourse.horario || backendCourse.schedule || backendCourse.horarioAgenda || backendCourse.scheduleRange || placeholderCourse.schedule

              const datesStr = backendCourse.dates || (backendCourse.fechaInicio && backendCourse.fechaFin ? `${backendCourse.fechaInicio} - ${backendCourse.fechaFin}` : placeholderCourse.dates)

              const location = backendCourse.aula || backendCourse.location || backendCourse.sede || backendCourse.campus || placeholderCourse.location
              const isVirtual = (String(backendCourse.modalidad || backendCourse.isVirtual || '') || '').toUpperCase().includes('VIRTUAL') || Boolean(backendCourse.isVirtual)

              const mapped = mapBackendCourseToFrontend(backendCourse)
              
              const finalDates = (mapped as any).dates || datesStr || placeholderCourse.dates
              let fechaInicio: string | undefined = undefined
              let fechaFin: string | undefined = undefined
              if (finalDates && typeof finalDates === 'string' && finalDates.includes('-')) {
                const parts = finalDates.split('-').map((p: string) => p.trim())
                if (parts.length >= 2) {
                  fechaInicio = parts[0]
                  fechaFin = parts[1]
                }
              }

              const finalSchedule = (mapped as any).schedule || schedule || placeholderCourse.schedule
              let horarioInicio: string | undefined = undefined
              let horarioFin: string | undefined = undefined
              if (finalSchedule && typeof finalSchedule === 'string' && finalSchedule.includes('-')) {
                const hp = finalSchedule.split('-').map((h: string) => h.trim())
                if (hp.length >= 2) {
                  horarioInicio = hp[0]
                  horarioFin = hp[1]
                }
              }

              const merged = {
                ...placeholderCourse,
                ...mapped,
                title: String(mapped.title || placeholderCourse.title),
                teachers: normalizedTeachers.length > 0 ? normalizedTeachers : mapped.teachers || placeholderCourse.teachers,
                studentsData,
                students: studentsData.length || (mapped as any).students || 0,
                dates: finalDates,
                fechaInicio,
                fechaFin,
                horarioInicio,
                horarioFin,
                promocionable: Boolean(backendCourse.promocionable ?? true),
                stats: (mapped as any).stats || placeholderCourse.stats,
              }

              setCourse(merged)
              setCourseLoadError(null)
              setCourseNotFound(false)
            }
          } else {
            // Course not found - show 404
            setCourseNotFound(true)
          }
        } catch (err: any) {
          // Check if it's a 404 error from the API
          const errorMessage = String(err)
          const isNotFoundError = 
            err?.response?.status === 404 ||
            err?.status === 404 ||
            errorMessage.includes('404') ||
            errorMessage.toLowerCase().includes('not found') ||
            errorMessage.toLowerCase().includes('no encontrado')
          
          if (isNotFoundError) {
            // Show the not-found page
            setCourseNotFound(true)
          } else {
            setCourseLoadError(errorMessage)
          }
        } finally {
          if (mounted) setLoadingCourse(false)
        }
      }

    load()

    return () => { mounted = false }
  }, [courseId])

  // Cargar preview del acta para obtener estadísticas (independiente de la carga del curso)
  useEffect(() => {
    let mounted = true
    const loadPreview = async () => {
      try {
        const previewResp = await CoursesService.getCourseActsPreview(getCourseIdForApi())
        
        if (mounted && previewResp && previewResp.success && previewResp.data) {
          setActsPreviewData(previewResp.data)
        } else if (mounted) {
          // Si el preview falla, los estados de loading se actualizarán cuando se carguen los datos de calificaciones/asistencia
        }
      } catch (previewErr) {
      }
    }
    
    if (courseId) {
      loadPreview()
    }
    
    return () => { mounted = false }
  }, [courseId])

  // Calcular estadísticas basadas en datos reales
  const computeTimeProgress = (): number => {
    try {
      let start: Date | null = null
      let end: Date | null = null

      // Prioridad 1: Usar campos desde/hasta (ISO format: YYYY-MM-DD)
      if (course.desde && course.hasta) {
        try {
          start = new Date(course.desde)
          end = new Date(course.hasta)
          // Validar que las fechas sean válidas
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            start = null
            end = null
          }
        } catch {
          start = null
          end = null
        }
      }

      // Prioridad 2: Usar fechaInicio/fechaFin si están disponibles
      if (!start || !end) {
        if (course.fechaInicio && course.fechaFin) {
          try {
            // Pueden venir en formato DD/MM/YYYY o ISO
            const parseDate = (dateStr: string): Date => {
              if (dateStr.includes('/')) {
                // Formato DD/MM/YYYY
                const [day, month, year] = dateStr.split('/').map((s) => s.trim())
                return new Date(Number(year), Number(month) - 1, Number(day))
              } else {
                // Formato ISO
                return new Date(dateStr)
              }
            }
            start = parseDate(course.fechaInicio)
            end = parseDate(course.fechaFin)
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              start = null
              end = null
            }
          } catch {
            start = null
            end = null
          }
        }
      }

      // Prioridad 3: Parsear course.dates (formato: "DD/MM/YYYY - DD/MM/YYYY")
      if (!start || !end) {
        if (course.dates && course.dates.includes('-')) {
          try {
            const [startStr, endStr] = course.dates.split("-").map((s) => s.trim())
            const parse = (d: string) => {
              const [day, month, year] = d.split("/")
              return new Date(Number(year), Number(month) - 1, Number(day))
            }
            start = parse(startStr)
            end = parse(endStr)
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return 0
            }
          } catch {
            return 0
          }
        } else {
          return 0
        }
      }

      if (!start || !end) {
        return 0
      }

      const now = new Date()
      const total = Math.max(1, end.getTime() - start.getTime())
      const elapsed = Math.min(Math.max(0, now.getTime() - start.getTime()), total)
      return Math.round((elapsed / total) * 100)
    } catch {
      return 0
    }
  }

  const computeAverageAttendance = (): number => {
    // Si no hay alumnos, retornar 0
    if (!students || students.length === 0) {
      return 0
    }

    // 1) Preferir datos del preview del acta (más preciso)
    if (actsPreviewData && Array.isArray(actsPreviewData.items) && actsPreviewData.items.length > 0) {
      const items = actsPreviewData.items
      const validItems = items.filter((item: any) => 
        item.asistenciaPct !== null && item.asistenciaPct !== undefined && !isNaN(Number(item.asistenciaPct))
      )
      if (validItems.length > 0) {
        const sum = validItems.reduce((acc: number, item: any) => acc + Number(item.asistenciaPct), 0)
        const avg = Math.round(sum / validItems.length)
        return avg
      }
    }

    // 2) Fallback: usar asistencias reales cargadas (attendanceData)
    const dateEntries = Object.values(attendanceData || {}) as Array<Record<string, "P" | "1/2" | "A">>
    let counted = 0
    let score = 0
    for (const perDate of dateEntries) {
      for (const status of Object.values(perDate)) {
        counted += 1
        if (status === "P") score += 1
        else if (status === "1/2") score += 0.5
      }
    }
    if (counted > 0) {
      return Math.round((score / counted) * 100)
    }

    // 3) Fallback: usar estado simple de studentsData
    const present = students.filter((s: any) => (s.attendance === "Presente")).length
    const half = students.filter((s: any) => (s.attendance === "1/2" || s.attendance === "1/2 Falta")).length
    if (students.length > 0) {
      return Math.round(((present + half * 0.5) / students.length) * 100)
    }

    // Si llegamos aquí, no hay datos de asistencia
    return 0
  }

  const computeAverageGrade = (): number => {
    // Si no hay alumnos, retornar 0
    if (!students || students.length === 0) {
      return 0
    }

    // 1) Preferir datos del preview del acta (más preciso, no considera ausentes)
    if (actsPreviewData && actsPreviewData.items && Array.isArray(actsPreviewData.items) && actsPreviewData.items.length > 0) {
      const items = actsPreviewData.items
      // Filtrar items con notaMateria válida (no null, no undefined, no NaN, excluir "A")
      const validItems = items.filter((item: any) => {
        const nota = item.notaMateria
        if (nota === null || nota === undefined || nota === '') return false
        const upper = String(nota).trim().toUpperCase()
        // Excluir "A" (ausente) del cálculo del promedio
        if (upper === "A") return false
        const numNota = Number(String(nota).replace(",", "."))
        return !isNaN(numNota) && Number.isFinite(numNota)
      })
      if (validItems.length > 0) {
        const sum = validItems.reduce((acc: number, item: any) => {
          const nota = Number(String(item.notaMateria).replace(",", "."))
          return acc + nota
        }, 0)
        const average = Math.round((sum / validItems.length) * 100) / 100
        return average
      }
      // Si hay items pero ninguno tiene nota válida, retornar 0
      return 0
    }

    // 2) Fallback: usar gradesData local (solo si está disponible)
    const ids = Object.keys(gradesData)
    if (ids.length > 0) {
      let sum = 0
      let count = 0
      for (const id of ids) {
        const g = gradesData[id] || {}
        const keys = ["FINAL", "2P", "1P", "REC"]
        // Filtrar "A" (ausente) - no se cuenta en el promedio
        const nums = keys
          .map((k) => {
            const val = g[k]
            if (!val || String(val).trim() === "") return NaN
            const upper = String(val).trim().toUpperCase()
            // Excluir "A" del cálculo del promedio
            if (upper === "A") return NaN
            return Number(String(val).replace(",", "."))
          })
          .filter((n) => Number.isFinite(n)) as number[]
        if (nums.length > 0) {
          sum += nums.reduce((a, b) => a + b, 0) / nums.length
          count += 1
        }
      }
      if (count > 0) {
        return Math.round((sum / count) * 100) / 100
      }
    }

    // 3) Último fallback: stats del curso o 0
    return course.stats?.averageGrade ?? 0
  }

  

  // Calcular tiempo transcurrido usando las fechas del curso (desde/hasta o dates)
  const timeProgress = useMemo(() => {
    return computeTimeProgress()
  }, [course.desde, course.hasta, course.fechaInicio, course.fechaFin, course.dates])
  
  // Usar useMemo para recalcular cuando cambien los datos del preview
  const averageAttendance = useMemo(() => {
    return computeAverageAttendance()
  }, [actsPreviewData, attendanceData, students])
  
  const averageGrade = useMemo(() => {
    return computeAverageGrade()
  }, [actsPreviewData, gradesData, course.stats])

  const studentConditionOptions = useMemo(() => {
    const set = new Set<string>()
    ;(course.studentsData || []).forEach((s: any) => {
      const k = formatConditionKey(s.condition)
      if (k) set.add(k)
    })
    return Array.from(set)
  }, [course.studentsData])

  // Detect missing fields for debugging: useful to know what backend omitted
  const requiredFieldsForUI = ["title", "code", "dates", "teachers"]
  const missingFields = requiredFieldsForUI.filter((f) => {
    const v = (course as any)[f]
    if (v === undefined || v === null) return true
    if (typeof v === 'string') return v.trim() === '' || v === 'MISSING'
    if (Array.isArray(v)) return v.length === 0
    return false
  })

  // Rango real del curso para bloquear fechas de asistencia fuera del período
  // monthToIndex redefinido más arriba con todos los meses

  const [courseStartStr, courseEndStr] = course.dates.split("-").map((s) => s.trim())
  const parseDmy = (d: string) => {
    const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10))
    return new Date(yyyy, mm - 1, dd)
  }
  const courseStartDate = parseDmy(courseStartStr)
  const courseEndDate = parseDmy(courseEndStr)

  const isDateInCourseRange = (monthName: string, day: number) => {
    const monthIdx = monthToIndex[monthName]
    if (monthIdx === undefined) return false
    const date = new Date(courseStartDate.getFullYear(), monthIdx, day)
    // Verificar que esté en el rango (ya no verificamos courseWeekday porque usamos fechas reales)
    return date >= courseStartDate && date <= courseEndDate
  }

  // --- CSV Preview (export) helpers ---
  // studentId es UUID string
  // Calcular porcentaje de asistencia basado en TODAS las clases del curso (fechas reales)
  const computeAttendancePercentByStudent = (): Record<string, number> => {
    const totals: Record<string, { score: number; count: number }> = {}
    
    // Usar fechas reales de clases individuales si están disponibles, sino usar fechas teóricas
    const datesToCheck = individualClasses.length > 0 
      ? individualClasses.map(c => c.fecha_clase).filter(Boolean)
      : allCourseDates.map(d => d.toISOString().split('T')[0])
    
    // Inicializar contadores para todos los estudiantes con todas las fechas
    students.forEach((student) => {
      const sid = String(student.id)
      totals[sid] = { score: 0, count: datesToCheck.length }
    })
    
    // Crear un mapa de fecha -> asistencia para acceso rápido
    const attendanceByDate: Record<string, Record<string, "P" | "1/2" | "A">> = {}
    const dateEntries = Object.entries(attendanceData || {})
    for (const [dateKey, perDate] of dateEntries) {
      // dateKey puede ser "Agosto-11" o "2025-08-11", normalizar
      let normalizedDate = dateKey
      if (dateKey.includes('-') && !dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Formato "Mes-día", convertir a YYYY-MM-DD
        const [monthName, day] = dateKey.split('-')
        const monthIdx = monthToIndex[monthName] ?? 0
        const year = courseStartDate.getFullYear()
        normalizedDate = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      attendanceByDate[normalizedDate] = perDate as Record<string, "P" | "1/2" | "A">
    }
    
    // Para cada fecha de clase, verificar asistencia de cada estudiante
    datesToCheck.forEach((dateStr) => {
      const dateAttendance = attendanceByDate[dateStr] || {}
      students.forEach((student) => {
        const sid = String(student.id)
        const status = dateAttendance[sid]
        const current = totals[sid]
        if (current) {
          if (status === "P") {
            current.score += 1
          } else if (status === "1/2") {
            current.score += 0.5
          }
          // Si no hay status o es "A", no suma puntos (pero cuenta como clase)
        }
      })
    })
    
    const result: Record<string, number> = {}
    for (const [studentId, { score, count }] of Object.entries(totals)) {
      result[studentId] = count > 0 ? Math.round((score / count) * 100) : 0
    }
    return result
  }

  const escapeCsv = (value: string | number) => {
    const s = String(value ?? "")
    if (s.includes(",") || s.includes("\n") || s.includes("\"")) {
      return '"' + s.replace(/\"/g, '""') + '"'
    }
    return s
  }

  const getSemesterLabel = (): string => {
    // Prioridad 1: Usar el campo period del curso si está disponible
    if (course.period) {
      const periodLower = course.period.toLowerCase().trim()
      
      // Detectar "1er Cuatr." o "Primer Cuatrimestre"
      if (periodLower.includes('1er') || periodLower.includes('primer') || periodLower.includes('q1')) {
        // Extraer el año si está presente
        const yearMatch = course.period.match(/\d{4}/)
        const year = yearMatch ? yearMatch[0] : ''
        return year ? `Primer Cuatrimestre ${year}` : "Primer Cuatrimestre"
      }
      
      // Detectar "2do Cuatr." o "Segundo Cuatrimestre"
      if (periodLower.includes('2do') || periodLower.includes('segundo') || periodLower.includes('q2')) {
        const yearMatch = course.period.match(/\d{4}/)
        const year = yearMatch ? yearMatch[0] : ''
        return year ? `Segundo Cuatrimestre ${year}` : "Segundo Cuatrimestre"
      }
      
      // Detectar "Verano"
      if (periodLower.includes('verano')) {
        const yearMatch = course.period.match(/\d{4}/)
        const year = yearMatch ? yearMatch[0] : ''
        return year ? `Verano ${year}` : "Verano"
      }
    }
    
    // Fallback: Calcular basándose en el mes de inicio
    const start = courseStartDate
    const month = start.getMonth() + 1
    const year = start.getFullYear()
    return month >= 8 ? `Segundo Cuatrimestre ${year}` : `Primer Cuatrimestre ${year}`
  }

  const getShiftLabel = (): string => {
    // Usar el campo shift del curso (datos reales)
    if (course.shift) {
      const shiftUpper = course.shift.toUpperCase()
      if (shiftUpper === "TM" || shiftUpper.includes("MAÑANA") || shiftUpper.includes("MANANA")) {
        return "Turno - Mañana"
      }
      if (shiftUpper === "TT" || shiftUpper.includes("TARDE")) {
        return "Turno - Tarde"
      }
      if (shiftUpper === "TN" || shiftUpper.includes("NOCHE")) {
        return "Turno - Noche"
      }
      // Si viene como texto completo, devolverlo tal cual
      if (shiftUpper.length > 2) {
        return `Turno - ${course.shift}`
      }
    }
    return "Turno"
  }

  const getTeachersSummary = (): { titulares: string; auxiliares: string } => {
    // Filtrar docentes TITULARES (van en "Profesor")
    const titulares = (course.teachers || [])
      .filter((t: any) => {
        const role = (t.role || "").toLowerCase().trim()
        return role.includes("titular") && !role.includes("auxiliar")
      })
      .map((t: any) => t.name || t.fullName || "")
      .filter((name: string) => name.trim() !== "")
      .join("; ")
    
    // Filtrar docentes AUXILIARES (van en "Ayudante")
    const auxiliares = (course.teachers || [])
      .filter((t: any) => {
        const role = (t.role || "").toLowerCase().trim()
        return role.includes("auxiliar") || role.includes("aux")
      })
      .map((t: any) => t.name || t.fullName || "")
      .filter((name: string) => name.trim() !== "")
      .join("; ")
    
    return { titulares, auxiliares }
  }

  const downloadCSVPreview = () => {
    const attendancePercent = computeAttendancePercentByStudent()
    const headers = [
      "Nombre",
      "Mail",
      "Nota 1",
      "Nota 2",
      "Recuperatorio",
      "Final",
      "Condición",
      "Asistencia",
    ]

    const rows = (students || []).map((st) => {
      const g = gradesData[st.id] || {}
      const condition = calculateFinalCondition(g)
      const asistencia = attendancePercent[st.id] ?? 0
      return [
        st.name,
        st.email,
        g["1P"] ?? "",
        g["2P"] ?? "",
        g["REC"] ?? "",
        g["FINAL"] ?? "",
        condition,
        `${asistencia}%`,
      ]
    })

    const { titulares, auxiliares } = getTeachersSummary()
    const headerBlock: string[][] = [
      [getSemesterLabel()],
      [getShiftLabel(), "", "", "", "", "", "", "cantidad de alumnos:", String(students.length)],
      [
        `Profesor: ${titulares || "-"}`,
        `Ayudantes: ${auxiliares || "-"}`,
      ],
      [],
      [course.title],
      [],
    ]

    const csvContent = [...headerBlock, headers, ...rows]
      .map((r) => r.map(escapeCsv).join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${course.title.replace(/\s+/g, "_")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const ensureXLSX = (): Promise<any | null> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(null)
      const g: any = window as any
      if (g.XLSX) return resolve(g.XLSX)
      const script = document.createElement('script')
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
      script.async = true
      script.onload = () => resolve((window as any).XLSX)
      script.onerror = () => resolve(null)
      document.body.appendChild(script)
    })
  }

  const downloadXlsxPreview = async () => {
    try {
      const XLSX: any = await ensureXLSX()
      if (!XLSX) throw new Error('XLSX not available')
      const attendancePercent = computeAttendancePercentByStudent()
      const { titulares, auxiliares } = getTeachersSummary()

      const headers = [
        "Nombre y Apellido",
        "Mail",
        "Nota 1",
        "Nota 2",
        "Recuperatorio",
        "Final",
        "Condición",
        "Asistencia",
      ]

      const rows = (students || []).map((st) => {
        const g = gradesData[st.id] || {}
        const condition = calculateFinalCondition(g)
        const asistencia = attendancePercent[st.id] ?? 0
        return [
          st.name,
          st.email,
          g["1P"] ?? "",
          g["2P"] ?? "",
          g["REC"] ?? "",
          g["FINAL"] ?? "",
          condition,
          `${asistencia}%`,
        ]
      })

      const aoa: any[][] = []
      // Fila 1: Nombre de la materia (merge A1:I1)
      aoa.push([course.title])
      // Fila 2: Turno (merge A2:B2)
      aoa.push([getShiftLabel()])
      // Fila 3: Cuatrimestre (merge A3:B3)
      aoa.push([getSemesterLabel()])
      // Fila 4: Docentes (Profesor y Ayudantes)
      aoa.push([`Profesor: ${titulares || "-"}`, `Ayudantes: ${auxiliares || "-"}`])
      // Fila 5: Cantidad de alumnos (merge A5:B5)
      aoa.push([`Cantidad de alumnos: ${String(students.length)}`])
      // Fila 6: vacía
      aoa.push([])
      aoa.push(headers)
      rows.forEach((r) => aoa.push(r))

      const ws = XLSX.utils.aoa_to_sheet(aoa)
      // Merges y estilos básicos del header
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // A1:I1 Materia
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // A2:B2 Turno
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // A3:B3 Cuatrimestre
        { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // A5:B5 Cantidad alumnos
      ]
      ;["A1","A2","A3","A5"].forEach((addr) => {
        if (ws[addr]) ws[addr].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "center" } }
      })
      ws["!cols"] = [
        { wch: 28 }, // Nombre
        { wch: 34 }, // Mail
        { wch: 8 },
        { wch: 8 },
        { wch: 12 },
        { wch: 8 },
        { wch: 14 },
        { wch: 12 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Acta")
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true })
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Usar el mismo formato que generateActaFilename
      const filename = generateActaFilename()
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      // Si no está la dependencia, caemos a CSV
      downloadCSVPreview()
    }
  }

  const dayShiftColor = getDayShiftColors(course.day, course.shift)

  const tabs = ["Información", "Alumnos", "Asistencia", "Calificaciones"]

  // Meses y fechas dinámicas según rango del curso y día de cursada
  const monthNamesEs = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ]
  const monthToIndex: Record<string, number> = monthNamesEs.reduce((acc, name, idx) => {
    acc[name] = idx
    return acc
  }, {} as Record<string, number>)

  const weekdayMap: Record<string, number> = {
    'DOMINGO': 0,
    'LUNES': 1,
    'MARTES': 2,
    'MIÉRCOLES': 3,
    'MIERCOLES': 3,
    'JUEVES': 4,
    'VIERNES': 5,
    'SÁBADO': 6,
    'SABADO': 6,
  }
  const courseWeekday = weekdayMap[(course.day || '').toUpperCase()] ?? 0

  // Fechas reales de asistencia según backend (records), indexadas por mes -> días
  const [attendanceRecordsByMonth, setAttendanceRecordsByMonth] = useState<Record<number, Set<number>>>({})
  
  // Clases individuales del curso (fechas reales de clases) - DECLARAR ANTES DE allCourseDates
  const [individualClasses, setIndividualClasses] = useState<ClaseIndividual[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  // Generar TODAS las fechas válidas del curso - SOLO fechas reales de clases individuales
  const allCourseDates = useMemo(() => {
    const dates: Date[] = []
    individualClasses.forEach((clase) => {
      if (clase.fecha_clase) {
        // Parsear fecha sin timezone para evitar problemas de día anterior
        // fecha_clase viene como "2025-08-11" (YYYY-MM-DD)
        const [year, month, day] = clase.fecha_clase.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day) // month es 0-indexed
        if (!Number.isNaN(dateObj.getTime())) {
          dates.push(dateObj)
        }
      }
    })
    // Ordenar fechas
    dates.sort((a, b) => a.getTime() - b.getTime())
    return dates
  }, [individualClasses])

  // Fecha seleccionada como objeto Date completo
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null)

  const availableMonthsIdx = useMemo(() => {
    // Solo incluir meses que tengan clases reales
    const monthsSet = new Set<number>()
    individualClasses.forEach((clase) => {
      if (clase.fecha_clase) {
        const [y, m] = clase.fecha_clase.split('-').map(Number)
        monthsSet.add(m - 1) // month es 0-indexed
      }
    })
    return Array.from(monthsSet).sort((a, b) => a - b)
  }, [individualClasses])

  const months = useMemo(() => availableMonthsIdx.map((m) => monthNamesEs[m]), [availableMonthsIdx])

  // Cargar clases individuales del curso para obtener fechas reales
  useEffect(() => {
    let mounted = true
    const loadClasses = async () => {
      if (!course.uuid) {
        // Si no hay UUID, establecer como vacío y no cargar
        setIndividualClasses([])
        setLoadingClasses(false)
        return
      }
      
      setLoadingClasses(true)
      try {
        // Usar el mismo método que CalendarService para obtener clases individuales
        const token = authService.getToken()
        const url = `/api/clases-individuales/curso/${course.uuid}?skip=0&limit=100`
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        })

        if (!mounted) return

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setIndividualClasses(data) // Puede ser un array vacío si no hay clases
          } else {
            setIndividualClasses([]) // Si no es un array, establecer como vacío
          }
        } else {
          setIndividualClasses([]) // Si hay error, establecer como vacío
        }
      } catch (err) {
        console.warn('Error obteniendo clases individuales:', err)
        setIndividualClasses([]) // En caso de error, establecer como vacío
      } finally {
        if (mounted) {
          setLoadingClasses(false)
        }
      }
    }

      loadClasses()
    
    return () => { mounted = false }
  }, [course.uuid])

  // Cargar los registros de asistencia una sola vez al montar el componente (no al cambiar de pestaña)
  // Solo cargar si hay clases individuales, de lo contrario no tiene sentido cargar registros
  useEffect(() => {
    let mounted = true
    const loadRecords = async () => {
      // Si no hay clases individuales, no cargar registros de asistencia
      if (individualClasses.length === 0) {
        setAttendanceRecordsByMonth({})
        return
      }
      
      // Cargar siempre para poder calcular estadísticas, no solo cuando activeTab === 'Asistencia'
      try {
        const resp = await CoursesService.getAttendanceRecords(getCourseIdForApi())
        if (!mounted) return
        if (resp && resp.success && Array.isArray(resp.data)) {
          const map: Record<number, Set<number>> = {}
          for (const rec of resp.data as any[]) {
            const d = new Date(String(rec?.date || ''))
            if (Number.isNaN(d.getTime())) continue
            const m = d.getMonth()
            const day = d.getDate()
            if (!map[m]) map[m] = new Set<number>()
            map[m].add(day)
          }
          setAttendanceRecordsByMonth(map)
          
          // También cargar las asistencias por fecha para calcular el promedio
          // Limitar a las últimas 10 fechas para no hacer demasiadas llamadas
          const allDates = new Set<string>()
          for (const rec of resp.data as any[]) {
            const d = new Date(String(rec?.date || ''))
            if (!Number.isNaN(d.getTime())) {
              const dateStr = d.toISOString().split('T')[0]
              allDates.add(dateStr)
            }
          }
          
          // Ordenar fechas y tomar las más recientes (máximo 10 para no sobrecargar)
          const sortedDates = Array.from(allDates).sort().reverse().slice(0, 10)
          
          // Cargar asistencia para cada fecha
          const attendancePromises = sortedDates.map(async (dateStr) => {
            try {
              const attendanceResp = await CoursesService.getAttendanceByDate(getCourseIdForApi(), dateStr)
              if (attendanceResp && attendanceResp.success && attendanceResp.data) {
                const items = attendanceResp.data.items || []
                const dateKey = dateStr
                // studentId es UUID string
                const dateData: Record<string, "P" | "1/2" | "A"> = {}
                for (const item of items) {
                  if (item.studentId && item.status) {
                    const status = item.status.toUpperCase()
                    const sid = String(item.studentId)  // UUID string
                    if (status === 'P' || status === 'PRESENTE') {
                      dateData[sid] = "P"
                    } else if (status === '1/2' || status === 'MEDIA' || status === 'M') {
                      dateData[sid] = "1/2"
                    } else if (status === 'A' || status === 'AUSENTE' || status === 'FALTA') {
                      dateData[sid] = "A"
                    }
                  }
                }
                if (Object.keys(dateData).length > 0) {
                  return { dateKey, dateData }
                }
              }
            } catch (err) {
            }
            return null
          })
          
          const attendanceResults = await Promise.all(attendancePromises)
          const newAttendanceData: { [key: string]: { [key: number]: "P" | "1/2" | "A" } } = {}
          for (const result of attendanceResults) {
            if (result) {
              newAttendanceData[result.dateKey] = result.dateData
            }
          }
          
          if (Object.keys(newAttendanceData).length > 0) {
            setAttendanceData(prev => ({ ...prev, ...newAttendanceData }))
          }
        } else {
          setAttendanceRecordsByMonth({})
        }
      } catch (err) {
        setAttendanceRecordsByMonth({})
      } finally {
        // Loading completado
      }
    }

    // Solo cargar registros si ya terminó de cargar las clases individuales
    if (!loadingClasses) {
    loadRecords()
    }
    return () => { mounted = false }
  }, [courseId, individualClasses, loadingClasses]) // Agregar individualClasses y loadingClasses como dependencias

  // Mapear tipo de clase a texto legible (sin el nombre del curso)
  const mapClaseTypeToLabel = (tipo: string): string => {
    switch (tipo) {
      case 'regular':
        return 'Clase Regular'
      case 'parcial_1':
        return 'Primer Parcial'
      case 'parcial_2':
        return 'Segundo Parcial'
      case 'recuperatorio':
        return 'Recuperatorio'
      case 'final':
        return 'Examen Final'
      default:
        return 'Clase'
    }
  }

  // Mapa de fecha (YYYY-MM-DD) -> tipo de clase
  const classTypeByDate = useMemo(() => {
    const map: Record<string, string> = {}
    individualClasses.forEach((clase) => {
      if (clase.fecha_clase) {
        // Usar fecha_clase directamente como key (ya viene en formato YYYY-MM-DD)
        map[clase.fecha_clase] = clase.tipo
      }
    })
    return map
  }, [individualClasses])

  // Mapa de fecha (mes-día) -> tipo de clase para el mes actual
  const classTypeByMonthDay = useMemo(() => {
    const map: Record<string, string> = {}
    const monthIdx = monthToIndex[selectedMonth] ?? courseStartDate.getMonth()
    const year = courseStartDate.getFullYear()
    
    individualClasses.forEach((clase) => {
      if (clase.fecha_clase) {
        // Parsear fecha sin timezone
        const [y, m, d] = clase.fecha_clase.split('-').map(Number)
        const dateObj = new Date(y, m - 1, d) // month es 0-indexed
        if (dateObj.getMonth() === monthIdx && dateObj.getFullYear() === year) {
          const day = dateObj.getDate()
          map[day] = clase.tipo
        }
      }
    })
    return map
  }, [individualClasses, selectedMonth, courseStartDate])

  const getDatesForMonthIdx = (monthIdx: number): number[] => {
    const year = courseStartDate.getFullYear()
    const datesSet = new Set<number>()
    // Solo mostrar días que existen en las clases reales
    individualClasses.forEach((clase) => {
      if (clase.fecha_clase) {
        // Parsear fecha sin timezone para evitar problemas de día anterior
        const [y, m, d] = clase.fecha_clase.split('-').map(Number)
        const dateObj = new Date(y, m - 1, d) // month es 0-indexed
        if (dateObj.getMonth() === monthIdx && dateObj.getFullYear() === year) {
          datesSet.add(dateObj.getDate())
        }
      }
    })
    return Array.from(datesSet).sort((a, b) => a - b)
  }

  const dates = useMemo(() => {
    const idx = monthToIndex[selectedMonth] ?? courseStartDate.getMonth()
    return getDatesForMonthIdx(idx)
  }, [selectedMonth, courseStartDate, courseEndDate, attendanceRecordsByMonth, individualClasses])

  // Seleccionabilidad: clases pasadas y la de hoy (solo si ya pasó la hora de la clase)
  const getThisWeekClassDate = (): Date => {
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Extraer hora de inicio de la clase del curso (ej: "18:00" de "18:00 - 22:00")
    const timeMatch = course.schedule?.match(/(\d{1,2}):\d{2}/)
    const classHour = timeMatch ? parseInt(timeMatch[1], 10) : 18 // Default 18hs si no se encuentra
    const classMinute = timeMatch ? parseInt(course.schedule.match(/\d{1,2}:(\d{2})/)?.[1] || '0', 10) : 0
    
    // Crear fecha/hora de la clase de hoy
    const todayClassTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), classHour, classMinute)
    
    // Verificar si hay una clase hoy en allCourseDates
    const hasClassToday = allCourseDates.some(date => 
      date.getFullYear() === todayDate.getFullYear() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getDate() === todayDate.getDate()
    )
    
    // Si hay clase hoy
    if (hasClassToday) {
      // Si ya pasó la hora de la clase, permitir seleccionar hoy
      if (today.getTime() >= todayClassTime.getTime()) {
        return todayDate
      }
      // Si aún no es la hora, retornar ayer para bloquear hoy
      const yesterday = new Date(todayDate)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    }
    
    // Si no hay clase hoy, permitir todas las fechas pasadas (hasta ayer)
    // Esto permite seleccionar cualquier fecha pasada del curso, no solo de esta semana
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }

  // Cargar TODAS las asistencias de TODAS las fechas de una vez al entrar a la pestaña de asistencia
  useEffect(() => {
    if (activeTab !== 'Asistencia') {
      setIsLoadingAttendance(false)
      return
    }
    
    // Si aún se están cargando las clases, mostrar loading
    if (loadingClasses) {
      setIsLoadingAttendance(true)
      return
    }
    
    // Si ya terminó de cargar y no hay fechas, no mostrar loading (mostrar mensaje de "no hay clases")
    if (allCourseDates.length === 0) {
      setIsLoadingAttendance(false)
      return
    }
    
    let mounted = true
    const loadAllAttendance = async () => {
      // Mostrar loading desde el principio
      setIsLoadingAttendance(true)
      
      try {
        const normalize = (raw: any): "P" | "1/2" | "A" | null => {
          if (raw === null || raw === undefined) return null
          const s = String(raw).trim().toUpperCase()
          if (s === 'P' || s === 'PRESENTE') return 'P'
          if (s === 'A' || s === 'AUSENTE') return 'A'
          if (s === 'M' || s === 'TARDE') return '1/2'
          return null
        }

        // Cargar asistencia para todas las fechas del curso en paralelo
        const attendancePromises = allCourseDates.map(async (dateObj) => {
          try {
            const iso = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
            const key = `${monthNamesEs[dateObj.getMonth()]}-${dateObj.getDate()}`
            
            const resp = await CoursesService.getAttendanceByDate(getCourseIdForApi(), iso)
            if (!mounted) return null
            
            if (resp && resp.success && resp.data) {
              const payload = resp.data as any
              const items: any[] = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload.flatMap((r: any) => r?.items || []) : []
              
              const dateData: { [key: string]: "P" | "1/2" | "A" } = {}
              for (const it of items) {
                const mapped = normalize((it as any).status)
                const sid = String((it as any).studentId)  // studentId es UUID string
                if (mapped && sid) {
                  dateData[sid] = mapped
                }
              }
              
              if (Object.keys(dateData).length > 0) {
                return { key, iso, dateData }
              }
            }
          } catch (err) {
            // Ignorar errores individuales
          }
          return null
        })
        
        const results = await Promise.all(attendancePromises)
        if (!mounted) return
        
        const newAttendanceData: { [key: string]: { [key: string]: "P" | "1/2" | "A" } } = {}
        for (const result of results) {
          if (result) {
            newAttendanceData[result.key] = result.dateData
            newAttendanceData[result.iso] = result.dateData // También guardar con formato ISO
          }
        }
        
        setAttendanceData(prev => ({ ...prev, ...newAttendanceData }))
        setHasUnsavedAttendance(false)
      } catch (err) {
        console.error('Error cargando asistencias:', err)
      } finally {
        if (mounted) {
          setIsLoadingAttendance(false)
        }
      }
    }

    loadAllAttendance()
    return () => { mounted = false }
  }, [activeTab, allCourseDates, courseId, loadingClasses])

  const isDateSelectable = (monthName: string, day: number): boolean => {
    if (!isDateInCourseRange(monthName, day)) return false
    const year = courseStartDate.getFullYear()
    const monthIdx = monthToIndex[monthName] ?? courseStartDate.getMonth()
    const d = new Date(year, monthIdx, day)
    
    const limit = getThisWeekClassDate()
    // Si la fecha existe en los registros del backend, permitir seleccionarla siempre
    const extra = attendanceRecordsByMonth[monthIdx]
    if (extra && extra.has(day)) return true
    // Solo bloquear fechas futuras (después de esta semana)
    return d.getTime() <= limit.getTime()
  }

  const isDateObjSelectable = (dateObj: Date): boolean => {
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dateObjDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
    
    // Si es hoy, verificar la hora
    if (dateObjDate.getTime() === todayDate.getTime()) {
      const timeMatch = course.schedule?.match(/(\d{1,2}):\d{2}/)
      const classHour = timeMatch ? parseInt(timeMatch[1], 10) : 18
      const classMinute = timeMatch ? parseInt(course.schedule.match(/\d{1,2}:(\d{2})/)?.[1] || '0', 10) : 0
      const todayClassTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), classHour, classMinute)
      // Solo permitir si ya pasó la hora de la clase
      return today.getTime() >= todayClassTime.getTime()
    }
    
    // Para otros días, usar la lógica normal
    const limit = getThisWeekClassDate()
    return dateObj.getTime() <= limit.getTime()
  }

  // Navegar entre fechas (día por día) - permite navegar a fechas futuras para verlas, aunque estén bloqueadas
  const navigateDate = (direction: "prev" | "next") => {
    if (!selectedDateObj) return
    
    const currentIndex = allCourseDates.findIndex(
      d => d.getTime() === selectedDateObj.getTime()
    )
    
    if (currentIndex === -1) return
    
    if (direction === "prev" && currentIndex > 0) {
      const newDate = allCourseDates[currentIndex - 1]
      setSelectedDateObj(newDate)
      setSelectedMonth(monthNamesEs[newDate.getMonth()])
      setSelectedDate(newDate.getDate())
    } else if (direction === "next" && currentIndex < allCourseDates.length - 1) {
      // Permitir navegar a fechas futuras (aunque estén bloqueadas) para poder verlas
      const newDate = allCourseDates[currentIndex + 1]
      setSelectedDateObj(newDate)
      setSelectedMonth(monthNamesEs[newDate.getMonth()])
      setSelectedDate(newDate.getDate())
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const currentIndex = months.indexOf(selectedMonth)
    if (direction === "prev" && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1])
    } else if (direction === "next" && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1])
    }
  }

  // Ajustar mes/día iniciales dinámicamente
  const [attendanceInit, setAttendanceInit] = useState(false)
  const [dateInit, setDateInit] = useState(false)

  // Elegir por defecto la última fecha seleccionable (clase de esta semana o anterior)
  useEffect(() => {
    if (attendanceInit) return
    if (allCourseDates.length === 0) return
    
    const limit = getThisWeekClassDate()
    
    // Buscar la última fecha que sea <= limit
    let targetDate = allCourseDates[0]
    for (const date of allCourseDates) {
      if (date.getTime() <= limit.getTime()) {
        targetDate = date
      } else {
        break
      }
    }
    
    setSelectedDateObj(targetDate)
    setSelectedMonth(monthNamesEs[targetDate.getMonth()])
    setSelectedDate(targetDate.getDate())
    setAttendanceInit(true)
  }, [allCourseDates, attendanceInit])

  // studentId es UUID string
  const setAttendance = (studentId: string, status: "P" | "1/2" | "A") => {
    // Prevent edits when the course is locked (has acta / closed)
    if (isCourseLocked) return
    if (!isDateSelectable(selectedMonth, selectedDate)) return
    const key = `${selectedMonth}-${selectedDate}`
    setAttendanceData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [studentId]: status,
      },
    }))
    setHasUnsavedAttendance(true)
  }

  const handleSaveAttendance = async () => {
    // Guard against saving when course is locked
    if (isCourseLocked) return
    if (!selectedDateObj) return
    
    const key = `${selectedMonth}-${selectedDate}`
    const dataForDate = attendanceData[key] || {}
    
    // Construir fecha ISO (YYYY-MM-DD)
    const year = courseStartDate.getFullYear()
    const monthIdx = monthToIndex[selectedMonth] ?? 0
    const dateIso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    
    // Mapear UI status a valores del backend
    // NOTA: El backend devuelve studentId como UUID string, NO como número
    // EstadoAsistencia: PRESENTE | AUSENTE | MEDIA_FALTA | P | A | M
    const items = students
      .map((student) => {
        const uiStatus = dataForDate[student.id] || null
        let backendStatus: string | null = null
        if (uiStatus === 'P') backendStatus = 'P'
        else if (uiStatus === 'A') backendStatus = 'A'
        else if (uiStatus === '1/2') backendStatus = 'M'
        
        // studentId viene del backend como UUID string, NO convertir a número
        if (!student.id) {
          return null
        }
        
        return {
          studentId: student.id,  // Mantener como string (UUID)
          status: backendStatus
        }
      })
      .filter((item): item is { studentId: string; status: string } => 
        item !== null && item.status !== null
      )
    
    if (items.length === 0) {
      alert('Debe marcar al menos un alumno antes de guardar')
      return
    }
    
    // Activar loader de pantalla completa
    setIsSavingAttendance(true)
    
    try {
      const resp = await CoursesService.saveAttendanceByDate(getCourseIdForApi(), dateIso, items)
      
      // Desactivar loader
      setIsSavingAttendance(false)
      
      if (resp && resp.success) {
        setHasUnsavedAttendance(false)
        setShowAttendanceSavedModal(true)
      } else {
        alert(`Error al guardar: ${resp?.error || resp?.message || 'Error desconocido'}`)
      }
    } catch (err) {
      // Desactivar loader en caso de error
      setIsSavingAttendance(false)
      alert(`Error al guardar: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // studentId es UUID string
  const getAttendance = (studentId: string): "P" | "1/2" | "A" | null => {
    const key = `${selectedMonth}-${selectedDate}`
    return attendanceData[key]?.[studentId] || null
  }

  // Validar y redondear nota a incrementos de 0.5
  // Helper para mostrar "-" cuando la nota es null, undefined o vacía
  const formatGradeForDisplay = (grade: string | undefined | null): string => {
    if (grade === undefined || grade === null || String(grade).trim() === "") {
      return "-"
    }
    return String(grade)
  }

  const validateAndRoundGrade = (value: string): string => {
    if (!value || value.trim() === "") return ""
    
    const trimmed = value.trim().toUpperCase()
    
    // Permitir "A" para ausente
    if (trimmed === "A") return "A"
    
    // Remover caracteres no numéricos excepto punto y signo negativo
    let cleanValue = value.replace(/[^\d.-]/g, "")
    
    // Convertir a número
    const num = Number.parseFloat(cleanValue)
    
    // Validar que sea un número válido
    if (!Number.isFinite(num)) return ""
    
    // Prevenir valores negativos
    if (num < 0) return ""
    
    // Validar rango 1-10
    if (num < 1) return "1"
    if (num > 10) return "10"
    
    // Redondear a 0.5: 4.4 -> 4, 4.5 -> 5, 4.6 -> 5
    const rounded = Math.round(num * 2) / 2
    
    return rounded.toString()
  }

  const calculateFinalCondition = (studentGrades: Record<string, string>) => {
    const getVal = (k: string) => {
      const v = studentGrades[k]
      if (v === undefined || v === null || String(v).trim() === "") return null
      const upper = String(v).trim().toUpperCase()
      // Si es "A" (ausente), tratarlo como desaprobado (equivalente a 1, 2 o 3)
      if (upper === "A") return 1 // Retornar 1 para que se considere desaprobado
      const n = Number.parseFloat(String(v))
      return Number.isFinite(n) ? n : null
    }
    
    const isAusente = (k: string): boolean => {
      const v = studentGrades[k]
      if (v === undefined || v === null || String(v).trim() === "") return false
      return String(v).trim().toUpperCase() === "A"
    }

    const p1 = getVal("1P")
    const p2 = getVal("2P")
    const rec = getVal("REC")
    const final = getVal("FINAL")

    const hasP1 = p1 !== null || isAusente("1P")
    const hasP2 = p2 !== null || isAusente("2P")
    const hasRec = rec !== null || isAusente("REC")
    const hasFinal = final !== null || isAusente("FINAL")

    // Sin datos aún
    if (!hasP1 && !hasP2 && !hasRec && !hasFinal) return ""

    // Obtener si el curso es promocionable
    const esPromocionable = course.promocionable !== false // Por defecto true

    // Necesitamos ambos parciales para decidir estados definitivos/promoción
    if (hasP1 && hasP2) {
      // Promoción directa: solo si el curso es promocionable y ambas notas >= 8
      if (esPromocionable && (p1 as number) >= 8 && (p2 as number) >= 8) {
        // Calcular promedio de todas las evaluaciones cargadas
        const grades = [p1 as number, p2 as number]
        if (hasRec && (rec as number) >= 8) grades.push(rec as number)
        const average = grades.reduce((a, b) => a + b, 0) / grades.length
        const roundedAverage = Math.round(average * 2) / 2
        // Auto-asignar la nota final (se hará en updateGrade)
        return "PROMOCIONA"
      }

      const p1Approved = (p1 as number) >= 4
      const p2Approved = (p2 as number) >= 4

      // Ambos desaprobados -> Recursa
      if (!p1Approved && !p2Approved) return "RECURSA"

      // Uno desaprobado
      if ((p1Approved && !p2Approved) || (!p1Approved && p2Approved)) {
        // Esperar recuperatorio si aún no lo cargaron
        if (!hasRec) return ""
        if ((rec as number) >= 4) {
          // Habilita final: si no hay final o final <4, queda pendiente
          if (!hasFinal || (final as number) < 4) return "FINAL PENDIENTE"
          return "APROBADO"
        }
        // Recuperatorio desaprobado -> Recursa
        return "RECURSA"
      }

      // Ambas aprobadas pero no promociona: requiere final
      if (p1Approved && p2Approved) {
        if (!hasFinal || (final as number) < 4) return "FINAL PENDIENTE"
        return "APROBADO"
      }
    }

    // Con solo un parcial cargado aún no mostramos condición
    return ""
  }

  type GradePermissions = { recEnabled: boolean; finalEnabled: boolean; finalAutoCalculated: boolean }

  const getGradePermissions = (studentGrades: Record<string, string>): GradePermissions => {
    const getVal = (k: string) => {
      const v = studentGrades[k]
      if (v === undefined || v === null || String(v).trim() === "") return null
      const upper = String(v).trim().toUpperCase()
      // Si es "A" (ausente), tratarlo como desaprobado (equivalente a 1, 2 o 3)
      if (upper === "A") return 1 // Retornar 1 para que se considere desaprobado
      const n = Number.parseFloat(String(v))
      return Number.isFinite(n) ? n : null
    }
    
    const isAusente = (k: string): boolean => {
      const v = studentGrades[k]
      if (v === undefined || v === null || String(v).trim() === "") return false
      return String(v).trim().toUpperCase() === "A"
    }

    const p1 = getVal("1P")
    const p2 = getVal("2P")
    const rec = getVal("REC")

    const p1Num = p1 ?? 0
    const p2Num = p2 ?? 0
    const recNum = rec ?? 0

    const p1Approved = (p1 !== null && p1Num >= 4) && !isAusente("1P")
    const p2Approved = (p2 !== null && p2Num >= 4) && !isAusente("2P")
    
    // Obtener si el curso es promocionable
    const esPromocionable = course.promocionable !== false // Por defecto true

    // Si ambas notas están entre 4 y 10 (y no son "A"), REC debe estar deshabilitado (null)
    const bothValid = p1 !== null && p2 !== null && !isAusente("1P") && !isAusente("2P") && p1Num >= 4 && p1Num <= 10 && p2Num >= 4 && p2Num <= 10
    if (bothValid) {
      // Solo si es promocionable Y ambas >= 8, FINAL se calcula automáticamente
      if (esPromocionable && p1Num >= 8 && p2Num >= 8) {
        return { recEnabled: false, finalEnabled: false, finalAutoCalculated: true }
      }
      // En cualquier otro caso (no promocionable o < 8), FINAL se puede modificar
      return { recEnabled: false, finalEnabled: true, finalAutoCalculated: false }
    }

    // Ambos desaprobados (incluyendo "A"): bloquea REC y FINAL
    if (p1 !== null && p2 !== null && !p1Approved && !p2Approved) {
      return { recEnabled: false, finalEnabled: false, finalAutoCalculated: false }
    }

    // REC habilitado solo si exactamente uno desaprobado
    const recEnabled = p1 !== null && p2 !== null && ((p1Approved && !p2Approved) || (!p1Approved && p2Approved))

    // FINAL habilitado si ambas aprobadas (puras) o si una fue aprobada vía REC
    const finalEnabled = (p1 !== null && p2 !== null && p1Approved && p2Approved) || (recEnabled && rec !== null && recNum >= 4 && !isAusente("REC"))

    return { recEnabled, finalEnabled, finalAutoCalculated: false }
  }

  const calculateAutoFinalGrade = (studentGrades: Record<string, string>): string => {
    const getVal = (k: string) => {
      const v = studentGrades[k]
      if (v === undefined || v === null || String(v).trim() === "") return null
      const upper = String(v).trim().toUpperCase()
      // Si es "A" (ausente), no se cuenta en el cálculo del promedio
      if (upper === "A") return null
      const n = Number.parseFloat(String(v))
      return Number.isFinite(n) ? n : null
    }

    const p1 = getVal("1P")
    const p2 = getVal("2P")
    
    // Obtener si el curso es promocionable
    const esPromocionable = course.promocionable !== false // Por defecto true

    // Solo calcular promedio si es promocionable Y ambas notas >= 8 (y no son "A")
    if (esPromocionable && p1 !== null && p2 !== null && p1 >= 8 && p2 >= 8) {
      const average = (p1 + p2) / 2
      const rounded = Math.round(average * 2) / 2
      return rounded.toString()
    }

    return ""
  }

  const updateGrade = (studentId: string, field: string, value: string) => {
    setGradesData((prev) => {
      // Validar y redondear el valor si no está vacío
      const validatedValue = value.trim() === "" ? "" : validateAndRoundGrade(value)
      
      const currentGrades = prev[studentId] || {}
      const isDeleting = validatedValue === ""
      
      const updated = {
        ...prev,
        [studentId]: {
          ...currentGrades,
          [field]: validatedValue,
        },
      }

      // Lógica de eliminación en cascada
      if (isDeleting) {
        // Si se elimina P1 o P2 y hay REC y FINAL, eliminar ambos
        if ((field === "1P" || field === "2P")) {
          const hasRec = currentGrades["REC"] && currentGrades["REC"].trim() !== ""
          const hasFinal = currentGrades["FINAL"] && currentGrades["FINAL"].trim() !== ""
          
          if (hasRec) {
            updated[studentId]["REC"] = ""
          }
          if (hasFinal) {
            updated[studentId]["FINAL"] = ""
          }
        }
        
        // Si se elimina REC y hay P1, P2, REC y FINAL, eliminar también FINAL
        if (field === "REC") {
          const hasP1 = currentGrades["1P"] && currentGrades["1P"].trim() !== ""
          const hasP2 = currentGrades["2P"] && currentGrades["2P"].trim() !== ""
          const hasFinal = currentGrades["FINAL"] && currentGrades["FINAL"].trim() !== ""
          
          if (hasP1 && hasP2 && hasFinal) {
            updated[studentId]["FINAL"] = ""
          }
        }
        
        // Si se elimina FINAL, solo recalcular condición (no pasa nada más)
        // Esto se maneja más abajo
      }

      // Obtener permisos para este estudiante
      const permissions = getGradePermissions(updated[studentId])

      // Si REC está bloqueado, limpiar su valor
      if (!permissions.recEnabled && updated[studentId]["REC"]) {
        updated[studentId]["REC"] = ""
      }

      // Si promociona, calcular FINAL automáticamente
      if (permissions.finalAutoCalculated) {
        const autoFinal = calculateAutoFinalGrade(updated[studentId])
        if (autoFinal) {
          updated[studentId]["FINAL"] = autoFinal
        }
      }

      // Recalcular condición final
      if (field !== "CONDICIÓN FINAL") {
        updated[studentId]["CONDICIÓN FINAL"] = calculateFinalCondition(updated[studentId])
      }

      return updated
    })
  }

  const validateGradesBeforeSave = (): { valid: boolean; message: string } => {
    // Validar que todas las notas cargadas estén entre 1 y 10, o sean "A" (ausente)
    for (const [studentId, grades] of Object.entries(gradesData)) {
      for (const [field, value] of Object.entries(grades)) {
        if (field === "CONDICIÓN FINAL") continue
        if (!value || value.trim() === "") continue
        
        const upper = String(value).trim().toUpperCase()
        // Permitir "A" para ausente
        if (upper === "A") continue
        
        const numValue = Number.parseFloat(value)
        if (!Number.isFinite(numValue)) {
          return { valid: false, message: `Valor inválido encontrado para un estudiante en ${field}` }
        }
        
        if (numValue < 1 || numValue > 10) {
          return { valid: false, message: `Las notas deben estar entre 1 y 10. Se encontró ${numValue} en ${field}` }
        }

        // Validar incrementos de 0.5
        const remainder = (numValue * 2) % 1
        if (remainder !== 0) {
          return { valid: false, message: `Las notas deben ser múltiplos de 0.5. Se encontró ${numValue} en ${field}` }
        }
      }
    }

    return { valid: true, message: "" }
  }

  const handleSaveGradesClick = () => {
    const validation = validateGradesBeforeSave()
    
    if (!validation.valid) {
      setGradesAlertType('error')
      setGradesAlertMessage(validation.message)
      setShowGradesAlertModal(true)
      return
    }

    // Mostrar modal de confirmación
    setShowGradesSaveModal(true)
  }

  const confirmSaveGrades = () => {
    // Close confirmation modal and start saving
    setShowGradesSaveModal(false)
    const doSave = async () => {
      try {
        
        setSavingGrades(true)
        // Build payload: array of assessments with grades per student
        const keys = ["1P", "2P", "REC", "FINAL"]
        const mapKeyToTipo = (k: string) => {
          // Mapear a los tipos exactos que usa el backend
          if (k === '1P') return 'PARCIAL_1'
          if (k === '2P') return 'PARCIAL_2'
          if (k === 'REC') return 'RECUPERATORIO'
          if (k === 'FINAL') return 'FINAL'
          return k
        }

        const assessments: any[] = []
        const today = new Date().toISOString()

        for (const k of keys) {
          const gradesArr: any[] = []
          let hasChanges = false
          
          for (const s of students) {
            const sid = String(s.id)
            const currentVal = gradesData[sid]?.[k]
            const originalVal = originalGradesData[sid]?.[k]
            
            // Comparar valor actual con el original
            // Normalizar para comparación: tratar vacío/null como iguales
            const currentNormalized = currentVal === null || currentVal === "" || currentVal === undefined 
              ? null 
              : String(currentVal).trim()
            const originalNormalized = originalVal === null || originalVal === "" || originalVal === undefined 
              ? null 
              : String(originalVal).trim()
            
            // Solo incluir si el valor cambió o es nuevo (no existía en original)
            const hasChanged = currentNormalized !== originalNormalized || 
                              (currentVal !== undefined && originalVal === undefined)
            
            if (hasChanged) {
              hasChanges = true
              
              // studentId es UUID string
              const studentId = s.uuid || s.id
              
              // Si está vacío o es null, enviar null
              if (currentVal === null || currentVal === "" || String(currentVal).trim() === "") {
                gradesArr.push({ studentId, grade: null })
              } else {
                // Si tiene valor, parsearlo y enviarlo
                const parsed = Number.parseFloat(String(currentVal))
                if (Number.isFinite(parsed)) {
                  gradesArr.push({ studentId, grade: String(parsed) })
                } else {
                  // Si no es un número válido, enviar null
                  gradesArr.push({ studentId, grade: null })
                }
              }
            }
          }

          // Solo incluir si hay cambios reales
          if (hasChanges && gradesArr.length > 0) {
            const assessmentId = assessmentIds[k] || null
            assessments.push({ assessmentId, tipo: mapKeyToTipo(k), fecha: today, grades: gradesArr })
          }
        }

        if (assessments.length === 0) {
          setGradesAlertType('info')
          setGradesAlertMessage('No hay cambios en las calificaciones para guardar')
          setShowGradesAlertModal(true)
          setSavingGrades(false)
          // Salir del modo edición si no hay cambios
          setIsEditingGrades(false)
          return
        }

        const resp = await CoursesService.saveCourseGrades(getCourseIdForApi(), assessments)
        
        if (resp && resp.success) {
          // NOTA: El PUT a /grades:publish ya guarda y publica en un solo paso
          // No es necesario hacer un POST adicional de publicación

          // Actualizar las calificaciones originales después de guardar exitosamente
          // Esto asegura que solo se envíen cambios futuros, no las que ya se guardaron
          const updatedOriginal: Record<string, Record<string, string>> = {}
          Object.keys(gradesData).forEach((sid) => {
            updatedOriginal[sid] = { ...gradesData[sid] }
          })
          setOriginalGradesData(updatedOriginal)

          setSavingGrades(false)
          setIsEditingGrades(false)
          setGradesAlertType('success')
          
          // Mensaje simple de éxito (el PUT a /grades:publish guarda y publica en un solo paso)
          const message = 'Calificaciones guardadas y publicadas correctamente'
          
          setGradesAlertMessage(message)
          setShowGradesAlertModal(true)
        } else {
          setSavingGrades(false)
          setGradesAlertType('error')
          setGradesAlertMessage(resp?.error || 'Error guardando calificaciones')
          setShowGradesAlertModal(true)
        }
      } catch (err) {
        setSavingGrades(false)
        setGradesAlertType('error')
        setGradesAlertMessage(err instanceof Error ? err.message : 'Error desconocido al guardar')
        setShowGradesAlertModal(true)
      }
    }

    void doSave()
  }

  const generateActaFilename = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const dateTime = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
    const courseName = course.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    return `${courseName}_${dateTime}.xlsx`
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
    const matchesCondition =
      studentsFilterConditions.length === 0 || studentsFilterConditions.includes(student.condition)
    return matchesSearch && matchesCondition
  })

  const filteredAttendanceStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(attendanceSearchTerm.toLowerCase())
    
    // Obtener el status de asistencia para el estudiante en la fecha seleccionada
    const attendanceStatus = getAttendance(student.id)
    const statusLabel = attendanceStatus === "P" ? "Presente" : attendanceStatus === "1/2" ? "1/2 Falta" : attendanceStatus === "A" ? "Ausente" : null
    
    const matchesAttendance =
      attendanceFilterStatuses.length === 0 || 
      (statusLabel && attendanceFilterStatuses.includes(statusLabel))
    
    return matchesSearch && matchesAttendance
  })

  const filteredGradesStudents =
    course.studentsData?.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(gradesSearchTerm.toLowerCase()) || student.email.toLowerCase().includes(gradesSearchTerm.toLowerCase())
      const finalCondition = calculateFinalCondition(gradesData[student.id] || {})
      const matchesFilter = gradesFilterConditions.length === 0 || gradesFilterConditions.includes(finalCondition)
      return matchesSearch && matchesFilter
    }) || []

  const resetStudentsFilters = () => {
    setStudentSearchTerm("")
    setStudentsFilterConditions([])
    setShowStudentsFilter(false)
  }

  const resetAttendanceFilters = () => {
    setAttendanceSearchTerm("")
    setAttendanceFilterStatuses([])
    setShowAttendanceFilter(false)
  }

  const resetGradesFilters = () => {
    setGradesSearchTerm("")
    setGradesFilterConditions([])
    setShowGradesFilter(false)
  }

  const toggleStudentCondition = (condition: string) => {
    setStudentsFilterConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const toggleAttendanceStatus = (status: string) => {
    setAttendanceFilterStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  const toggleGradeCondition = (condition: string) => {
    setGradesFilterConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  const removeStudentCondition = (condition: string) => {
    setStudentsFilterConditions((prev) => prev.filter((c) => c !== condition))
  }

  const removeAttendanceStatus = (status: string) => {
    setAttendanceFilterStatuses((prev) => prev.filter((s) => s !== status))
  }

  const removeGradeCondition = (condition: string) => {
    setGradesFilterConditions((prev) => prev.filter((c) => c !== condition))
  }

  // Show 404 page if course was not found
  if (courseNotFound) {
    return <CourseNotFound />
  }

  // Show loading skeleton while course data is being fetched
  if (loadingCourse) {
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

        {/* Content Area Skeleton */}
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

  return (
    <div className="min-h-screen">
      {/* Hero Section with Course Header */}
      <div
        className="relative h-32 lg:h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 overflow-hidden"
        style={{
          backgroundImage: `url('/geometric-architectural-pattern-dark-blue-building.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/20"></div>
        
        {/* Back Button */}
        <button
          onClick={() => router.push("/cursos")}
          className="absolute top-2 left-2 lg:top-4 lg:left-4 p-1.5 lg:p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
      </div>

      <div className="bg-white px-3 py-4 lg:px-6 lg:py-6 border-b">
        <h1 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 text-gray-900 line-clamp-2">{course.title}</h1>

        <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm mb-3">
          <div className="flex items-center space-x-1">
            <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-600 flex-shrink-0" />
            <span className="text-gray-600 whitespace-nowrap">{course.students} alumnos</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {course.teachers.map((teacher) => (
                <div
                  key={teacher.uuid || teacher.id}
                  className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white flex items-center justify-center ${getTeacherColor(teacher.uuid || teacher.id)}`}
                  title={teacher.name}
                >
                  <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(teacher.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs lg:text-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
            <div className="flex items-center flex-wrap gap-2">
              <span className={`${dayShiftColor} text-white text-xs font-semibold px-2 py-0.5 lg:py-1 rounded flex-shrink-0`}>{course.day}</span>
              <span className={`${dayShiftColor} text-white text-xs font-semibold px-2 py-0.5 lg:py-1 rounded flex-shrink-0`}>
                {course.shift}
              </span>
              <span className="font-medium text-gray-900 whitespace-nowrap">{course.schedule}</span>
            </div>
            <span className="text-gray-600">{course.dates}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-600 flex-shrink-0" />
              <span className="text-gray-600 truncate">{course.isVirtual ? "VIRTUAL" : course.location}</span>
            </div>
          </div>
          <button
            onClick={() => setShowActaModal(true)}
            disabled={isCourseLocked || isUserAuxiliarInCourse}
            title={
              isCourseLocked 
                ? 'Curso cerrado: no se permiten modificaciones ni generación de acta' 
                : isUserAuxiliarInCourse 
                  ? 'Rol Auxiliar: no permitido gestionar actas'
                  : 'Gestionar acta'
            }
            className={`flex items-center space-x-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${(isCourseLocked || isUserAuxiliarInCourse) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800'}`}
          >
            <ClipboardCheck className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
            <span>Gestionar Acta</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-200 border-b overflow-x-auto">
        <div className="px-3 lg:px-6">
          <div className="flex space-x-0 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-slate-700 text-slate-700 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 lg:p-6 bg-gray-100 min-h-screen">
        {activeTab === "Información" && (
          <div className="space-y-4 lg:space-y-6">
            {/* Teachers Section */}
            <div className="bg-white rounded-lg p-4 lg:p-6">
              <h3 className="font-medium text-gray-900 text-sm lg:text-base mb-3 lg:mb-4">Docentes</h3>

              {/* Teachers Table */}
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Nombre</th>
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Mail</th>
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.teachers.map((teacher) => (
                      <tr key={teacher.uuid || teacher.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 lg:py-3 px-3 lg:px-4">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div
                              className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTeacherColor(teacher.uuid || teacher.id)}`}
                            >
                              <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(teacher.name)}</span>
                            </div>
                            <span className="font-medium text-xs lg:text-sm">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="py-2 lg:py-3 px-3 lg:px-4 text-gray-600 text-xs lg:text-sm">{teacher.email}</td>
                        <td className="py-2 lg:py-3 px-3 lg:px-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] lg:text-xs font-medium ${
                              String(teacher.role || '').toUpperCase() === "TITULAR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {teacher.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-lg p-4 lg:p-6">
              <h3 className="font-medium text-gray-900 text-sm lg:text-base mb-4 lg:mb-6">Estadísticas</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
                {/* Time Progress */}
                <div className="text-center">
                  <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Tiempo transcurrido</h4>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3 mb-2">
                      <div
                        className="bg-slate-800 h-2 lg:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${timeProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xl lg:text-2xl font-bold text-gray-600">{timeProgress}%</span>
                  </div>
                </div>

                {/* Average Attendance */}
                <div className="flex flex-col items-center justify-center text-center">
                  <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Asistencia Promedio</h4>
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-2">
                    <svg className="w-20 h-20 lg:w-24 lg:h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-slate-800"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${averageAttendance}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base lg:text-lg font-bold text-gray-600">{averageAttendance}%</span>
                    </div>
                  </div>
                </div>

                {/* Average Grade */}
                <div className="text-center">
                  <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Calificación Promedio</h4>
                  <div className="mb-2">
                    <span className="text-3xl lg:text-4xl font-bold text-slate-800">{averageGrade}</span>
                  </div>
                  <span className="text-[10px] lg:text-xs text-gray-500">(no considera ausentes)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Alumnos" && (
          <div className="bg-white rounded-lg p-4 lg:p-6">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 text-sm lg:text-base mb-3">Alumnos</h3>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-3">
                <div className="relative flex-1 lg:flex-initial">
                  <Search className="h-3.5 w-3.5 lg:h-4 lg:w-4 absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full lg:w-64 pl-8 lg:pl-10 pr-3 lg:pr-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Buscar estudiantes por nombre o email"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowStudentsFilter(!showStudentsFilter)}
                    className="flex items-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Filtrar por condición"
                    aria-expanded={showStudentsFilter}
                  >
                    <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span>Condición</span>
                    {studentsFilterConditions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        {studentsFilterConditions.length}
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                  </button>
                  {showStudentsFilter && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Condición</label>
                          <div className="flex items-center gap-2">
                            {studentsFilterConditions.length > 0 && (
                              <button
                                onClick={() => {
                                  setStudentsFilterConditions([])
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                aria-label="Limpiar filtros"
                              >
                                Limpiar
                              </button>
                            )}
                            <button
                              onClick={() => setShowStudentsFilter(false)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label="Cerrar filtro"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {studentConditionOptions.map((condition) => (
                            <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={studentsFilterConditions.includes(condition)}
                                onChange={() => toggleStudentCondition(condition)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{condition}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {studentsFilterConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {studentsFilterConditions.map((condition) => {
                    const badge = getConditionBadgeClasses(condition)
                    return (
                      <span
                        key={condition}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge}`}
                      >
                        {condition}
                        <button
                          onClick={() => removeStudentCondition(condition)}
                          className="rounded-full p-0.5 hover:opacity-80"
                          aria-label={`Remover filtro ${condition}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Students Table */}
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm lg:text-base">Aún no hay alumnos asignados al curso</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Nombre</th>
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Mail</th>
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Condición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.uuid || student.id}
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="py-2 lg:py-3 px-3 lg:px-4">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div
                              className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStudentColor(student.uuid || student.id)}`}
                            >
                              <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(student.name)}</span>
                            </div>
                            <span className="font-medium text-xs lg:text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-2 lg:py-3 px-3 lg:px-4 text-gray-600 text-xs lg:text-sm">{student.email}</td>
                        <td className="py-2 lg:py-3 px-3 lg:px-4">
                            <span className={`px-2 py-1 rounded text-[10px] lg:text-xs font-medium whitespace-nowrap ${getConditionBadgeClasses(student.condition)}`}>
                              {student.condition}
                            </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "Asistencia" && (
          <div className="space-y-4 lg:space-y-6">
            {isLoadingAttendance || loadingClasses ? (
              <div className="bg-white rounded-lg p-4 lg:p-6">
                <Skeleton className="h-6 lg:h-7 w-48 mb-4 lg:mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex gap-2">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-8 h-8 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !loadingClasses && allCourseDates.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Calendar className="h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1.5">
                    El curso aún no tiene clases creadas
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md">
                    No se han registrado clases individuales para este curso. Una vez que se creen las clases, podrás tomar asistencia.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Carga de Asistencia</h2>

              <div className="mb-4 lg:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1.5 lg:p-2 w-full max-w-full lg:w-auto overflow-x-auto" style={{ maxWidth: '100%' }}>
                    <div className="flex items-center min-w-max lg:min-w-0" style={{ width: '500px', maxWidth: '100%' }}>
                      <span className="text-sm lg:text-base font-bold text-slate-800 whitespace-nowrap text-center flex-shrink-0" style={{ width: '90px', minWidth: '90px' }}>
                        {selectedMonth}
                      </span>
                      <div className="h-6 w-px bg-gray-300 mx-2 lg:mx-3 flex-shrink-0"></div>
                      <span className="text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:inline mr-1 lg:mr-2">Fecha</span>

                      <button
                        onClick={() => navigateDate("prev")}
                        disabled={!selectedDateObj || allCourseDates.findIndex(d => d.getTime() === selectedDateObj.getTime()) === 0}
                        className="p-0.5 lg:p-1 mx-0.5 sm:mx-1 lg:mx-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Clase anterior"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-600" />
                      </button>

                      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mx-0.5 sm:mx-1 lg:mx-2 flex-1" style={{ minWidth: '180px', maxWidth: '240px' }}>
                        {dates.map((date) => {
                          const inRange = isDateInCourseRange(selectedMonth, date)
                          const selectable = inRange && isDateSelectable(selectedMonth, date)
                          return (
                            <button
                              key={date}
                              onClick={() => {
                                if (selectable) {
                                  setSelectedDate(date)
                                  // Actualizar selectedDateObj - buscar la fecha exacta en allCourseDates
                                  const year = courseStartDate.getFullYear()
                                  const monthIdx = monthToIndex[selectedMonth] ?? courseStartDate.getMonth()
                                  const dateObj = new Date(year, monthIdx, date)
                                  const exactDate = allCourseDates.find(d => 
                                    d.getFullYear() === dateObj.getFullYear() &&
                                    d.getMonth() === dateObj.getMonth() &&
                                    d.getDate() === dateObj.getDate()
                                  )
                                  if (exactDate) {
                                    setSelectedDateObj(exactDate)
                                  }
                                }
                              }}
                              disabled={!selectable}
                              className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                                selectedDate === date
                                  ? "bg-slate-800 text-white shadow-md"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                               } ${!selectable ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              {date}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => navigateDate("next")}
                        disabled={!selectedDateObj || allCourseDates.findIndex(d => d.getTime() === selectedDateObj.getTime()) === allCourseDates.length - 1}
                        className="p-0.5 lg:p-1 mx-0.5 sm:mx-1 lg:mx-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Clase siguiente"
                      >
                        <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
                
              </div>
              
              {/* Tipo de clase para la fecha seleccionada - Diseño más sutil e integrado */}
              {selectedDateObj && (() => {
                // Formatear fecha como YYYY-MM-DD para buscar en classTypeByDate
                const year = selectedDateObj.getFullYear()
                const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0')
                const day = String(selectedDateObj.getDate()).padStart(2, '0')
                const selectedDateStr = `${year}-${month}-${day}`
                const selectedClassType = classTypeByDate[selectedDateStr]
                const selectedClassTypeLabel = selectedClassType ? mapClaseTypeToLabel(selectedClassType) : null
                
                return selectedClassTypeLabel ? (
                  <div className="mt-2 mb-3 lg:mb-4">
                    <span className="text-xs lg:text-sm text-gray-500 font-medium">Tipo de Clase: </span>
                    <span className="text-xs lg:text-sm text-gray-700 font-semibold">{selectedClassTypeLabel}</span>
                  </div>
                ) : null
              })()}

              {/* Students Section */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 text-sm lg:text-base mb-3 lg:mb-4">Alumnos</h3>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-3">
                  <div className="relative flex-1 lg:flex-initial">
                    <Search className="h-3.5 w-3.5 lg:h-4 lg:w-4 absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email"
                      value={attendanceSearchTerm}
                      onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                      className="w-full lg:w-64 pl-8 lg:pl-10 pr-3 lg:pr-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Buscar estudiantes por nombre o email"
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowAttendanceFilter(!showAttendanceFilter)}
                      className="flex items-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label="Filtrar por asistencia"
                      aria-expanded={showAttendanceFilter}
                    >
                      <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                      <span>Asistencia</span>
                      {attendanceFilterStatuses.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          {attendanceFilterStatuses.length}
                        </span>
                      )}
                      <ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                    </button>
                    {showAttendanceFilter && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Asistencia</label>
                            <div className="flex items-center gap-2">
                              {attendanceFilterStatuses.length > 0 && (
                                <button
                                  onClick={() => {
                                    setAttendanceFilterStatuses([])
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  aria-label="Limpiar filtros"
                                >
                                  Limpiar
                                </button>
                              )}
                              <button
                                onClick={() => setShowAttendanceFilter(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Cerrar filtro"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {["Presente", "1/2 Falta", "Ausente"].map((status) => (
                              <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceFilterStatuses.includes(status)}
                                  onChange={() => toggleAttendanceStatus(status)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón Guardar - Desktop: margen izquierdo auto para empujarlo a la derecha, Mobile: full width */}
                  {hasUnsavedAttendance && isCourseLocked && (
                    <button
                      disabled
                      title="No se puede editar asistencia: el curso tiene acta o está cerrado"
                      className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-gray-300 text-white font-medium rounded-md transition-colors lg:ml-auto opacity-60 cursor-not-allowed"
                    >
                      <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                      <span>Guardar</span>
                    </button>
                  )}
                  {hasUnsavedAttendance && !isCourseLocked && (
                    <button
                      onClick={handleSaveAttendance}
                      className="flex items-center justify-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-md transition-colors lg:ml-auto"
                    >
                      <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>

                {attendanceFilterStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {attendanceFilterStatuses.map((status) => {
                      const colors = status === "Presente"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : status === "1/2 Falta"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      return (
                        <span
                          key={status}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${colors}`}
                        >
                          {status}
                          <button
                            onClick={() => removeAttendanceStatus(status)}
                            className="rounded-full p-0.5 hover:opacity-80"
                            aria-label={`Remover filtro ${status}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Attendance Table */}
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm lg:text-base">Aún no hay alumnos asignados al curso</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 lg:mx-0">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Nombre</th>
                        <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Mail</th>
                        <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Shimmer loading effect mientras carga la asistencia */}
                      {isLoadingAttendance ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr
                            key={`attendance-skeleton-${index}`}
                            className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                            <td className="py-2 lg:py-3 px-3 lg:px-4">
                              <div className="flex items-center space-x-2 lg:space-x-3">
                                <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </td>
                            <td className="py-2 lg:py-3 px-3 lg:px-4">
                              <Skeleton className="h-4 w-40" />
                            </td>
                            <td className="py-2 lg:py-3 px-3 lg:px-4">
                              <div className="flex space-x-1.5 lg:space-x-2">
                                <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-full" />
                                <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-full" />
                                <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-full" />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        filteredAttendanceStudents.map((student, index) => (
                          <tr
                            key={student.uuid || student.id}
                            className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                            <td className="py-2 lg:py-3 px-3 lg:px-4">
                              <div className="flex items-center space-x-2 lg:space-x-3">
                                <div
                                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStudentColor(student.uuid || student.id)}`}
                                >
                                  <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(student.name)}</span>
                                </div>
                                <span className="font-medium text-xs lg:text-sm">{student.name}</span>
                              </div>
                            </td>
                            <td className="py-2 lg:py-3 px-3 lg:px-4 text-gray-600 text-xs lg:text-sm">{student.email}</td>
                            <td className="py-2 lg:py-3 px-3 lg:px-4">
                              <div className="flex space-x-1.5 lg:space-x-2">
                                <button
                                  onClick={() => setAttendance(student.id, "P")}
                                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full text-[10px] lg:text-xs font-semibold transition-colors flex-shrink-0 ${
                                    getAttendance(student.id) === "P"
                                      ? "bg-green-500 text-white shadow-md"
                                      : "bg-gray-200 text-gray-600 hover:bg-green-100"
                                  }`}
                                  title="Presente"
                                >
                                  P
                                </button>
                                <button
                                  onClick={() => setAttendance(student.id, "1/2")}
                                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full text-[10px] lg:text-xs font-semibold transition-colors flex-shrink-0 ${
                                    getAttendance(student.id) === "1/2"
                                      ? "bg-yellow-500 text-white shadow-md"
                                      : "bg-gray-200 text-gray-600 hover:bg-yellow-100"
                                  }`}
                                  title="Media falta"
                                >
                                  1/2
                                </button>
                                <button
                                  onClick={() => setAttendance(student.id, "A")}
                                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full text-[10px] lg:text-xs font-semibold transition-colors flex-shrink-0 ${
                                    getAttendance(student.id) === "A"
                                      ? "bg-red-500 text-white shadow-md"
                                      : "bg-gray-200 text-gray-600 hover:bg-red-100"
                                  }`}
                                  title="Ausente"
                                >
                                  A
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            )}
          </div>
        )}

        {activeTab === "Calificaciones" && (
          <div className="space-y-4 lg:space-y-6">
            {loadingGrades ? (
              <div className="bg-white rounded-lg p-4 lg:p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 lg:h-7 w-48 mb-4 lg:mb-6" />
                  <Skeleton className="h-12 w-full" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : !loadingGrades && assessments.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Calendar className="h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1.5">
                    El curso aún no tiene evaluaciones creadas
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md">
                    No se han registrado fechas de exámenes para este curso. Una vez que se creen las evaluaciones, podrás cargar calificaciones.
                  </p>
                </div>
              </div>
            ) : (
          <div className="bg-white rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold">Calificaciones</h2>
            </div>

            <div className="mb-4">
              <h3 className="text-base lg:text-lg font-medium mb-3 lg:mb-4">Alumnos</h3>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-3">
                <div className="relative flex-1 lg:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email"
                    value={gradesSearchTerm}
                    onChange={(e) => setGradesSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Buscar estudiantes por nombre o email"
                  />
                  <Search className="absolute left-2.5 top-2 lg:top-2.5 h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400" />
                </div>

                <button
                  onClick={() => {
                    if (isCourseLocked || isUserAuxiliarInCourse) return
                    if (isEditingGrades) {
                      handleSaveGradesClick()
                    } else {
                      setIsEditingGrades(true)
                    }
                  }}
                  disabled={isCourseLocked || isUserAuxiliarInCourse}
                  title={
                    isCourseLocked ? 'Curso cerrado: no se permiten modificaciones' :
                    isUserAuxiliarInCourse ? 'Rol Auxiliar: no permitido editar calificaciones' :
                    isEditingGrades ? 'Guardar' : 'Editar'
                  }
                  className={`flex items-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm rounded-md transition-colors ${
                    (isCourseLocked || isUserAuxiliarInCourse)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isEditingGrades
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <Edit className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span>{isEditingGrades ? "Guardar" : "Editar"}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowGradesFilter(!showGradesFilter)}
                    className="flex items-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Filtrar por condición final"
                    aria-expanded={showGradesFilter}
                  >
                    <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span>Condición</span>
                    {gradesFilterConditions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        {gradesFilterConditions.length}
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 flex-shrink-0" />
                  </button>
                  {showGradesFilter && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Condición Final</label>
                          <div className="flex items-center gap-2">
                            {gradesFilterConditions.length > 0 && (
                              <button
                                onClick={() => {
                                  setGradesFilterConditions([])
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                aria-label="Limpiar filtros"
                              >
                                Limpiar
                              </button>
                            )}
                            <button
                              onClick={() => setShowGradesFilter(false)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label="Cerrar filtro"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {["PROMOCIONA", "APROBADO", "FINAL PENDIENTE", "RECURSA"].map((condition) => (
                            <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={gradesFilterConditions.includes(condition)}
                                onChange={() => toggleGradeCondition(condition)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{condition}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {gradesFilterConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {gradesFilterConditions.map((condition) => {
                    const colors = condition === "PROMOCIONA"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : condition === "APROBADO"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : condition === "FINAL PENDIENTE"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                    return (
                      <span
                        key={condition}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${colors}`}
                      >
                        {condition}
                        <button
                          onClick={() => removeGradeCondition(condition)}
                          className="rounded-full p-0.5 hover:opacity-80"
                          aria-label={`Remover filtro ${condition}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Grades Table */}
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm lg:text-base">Aún no hay alumnos asignados al curso</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="w-full min-w-[700px] table-fixed">
                  <colgroup>
                    <col className="w-[35%]" /> {/* Nombre */}
                    <col className="w-[11%]" /> {/* Eval 1 */}
                    <col className="w-[11%]" /> {/* Eval 2 */}
                    <col className="w-[11%]" /> {/* REC */}
                    <col className="w-[11%]" /> {/* FINAL */}
                    <col className="w-[21%]" /> {/* CONDICIÓN */}
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-2 lg:py-3 px-3 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Nombre</th>
                      <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Eval. 1</th>
                      <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Eval. 2</th>
                      <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">REC</th>
                      <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">FINAL</th>
                      <th className="text-center py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">CONDICIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingGrades && Object.keys(gradesData).length === 0 ? (
                      // Skeleton loading rows - solo mostrar si no hay datos
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={`skeleton-${index}`}
                          className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        >
                          <td className="py-2 lg:py-3 px-3 lg:px-4">
                            <div className="flex items-center space-x-2 lg:space-x-3">
                              <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-full" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4">
                            <Skeleton className="h-6 w-12 mx-auto" />
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4">
                            <Skeleton className="h-6 w-12 mx-auto" />
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4">
                            <Skeleton className="h-6 w-12 mx-auto" />
                          </td>
                          <td className="py-2 lg:py-3 px-2 lg:px-4">
                            <Skeleton className="h-6 w-12 mx-auto" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredGradesStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            <p className="text-sm lg:text-base">Aún no hay alumnos asignados al curso</p>
                          </td>
                        </tr>
                      ) : (
                        filteredGradesStudents.map((student, index) => (
                          <tr
                            key={student.uuid || student.id}
                            className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                      <td className="py-2 lg:py-3 px-3 lg:px-4">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <div
                            className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStudentColor(student.uuid || student.id)}`}
                          >
                            <span className="text-white text-[10px] lg:text-xs font-semibold">{getInitials(student.name)}</span>
                          </div>
                          <span className="font-medium text-xs lg:text-sm">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="text"
                            disabled={isCourseLocked || isUserAuxiliarInCourse}
                            value={gradesData[student.id]?.["1P"] || ""}
                            onChange={(e) => updateGrade(String(student.id), "1P", e.target.value)}
                            onKeyDown={(e) => {
                              // Permitir "A" o "a" para ausente
                              if (e.key === 'a' || e.key === 'A') {
                                // Permitir que se escriba
                                return
                              }
                              // Bloquear caracteres no permitidos
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault()
                              }
                            }}
                            className={`w-12 lg:w-16 px-1 lg:px-2 py-1 border border-gray-300 rounded text-center text-xs lg:text-sm focus:outline-none ${(isCourseLocked || isUserAuxiliarInCourse) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                            placeholder="-"
                          />
                        ) : (
                          <span className="text-gray-600 text-xs lg:text-sm">{formatGradeForDisplay(gradesData[student.id]?.["1P"])}</span>
                        )}
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="text"
                            disabled={isCourseLocked || isUserAuxiliarInCourse}
                            value={gradesData[student.id]?.["2P"] || ""}
                            onChange={(e) => updateGrade(String(student.id), "2P", e.target.value)}
                            onKeyDown={(e) => {
                              // Permitir "A" o "a" para ausente
                              if (e.key === 'a' || e.key === 'A') {
                                // Permitir que se escriba
                                return
                              }
                              // Bloquear caracteres no permitidos
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault()
                              }
                            }}
                            className={`w-12 lg:w-16 px-1 lg:px-2 py-1 border border-gray-300 rounded text-center text-xs lg:text-sm focus:outline-none ${(isCourseLocked || isUserAuxiliarInCourse) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                            placeholder="-"
                          />
                        ) : (
                          <span className="text-gray-600 text-xs lg:text-sm">{formatGradeForDisplay(gradesData[student.id]?.["2P"])}</span>
                        )}
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-center">
                        {isEditingGrades ? (
                          (() => {
                            const perms = getGradePermissions(gradesData[student.id] || {})
                            return (
                              <input
                                type="text"
                                disabled={!perms.recEnabled || isCourseLocked || isUserAuxiliarInCourse}
                                value={gradesData[student.id]?.["REC"] || ""}
                                onChange={(e) => updateGrade(String(student.id), "REC", e.target.value)}
                                onKeyDown={(e) => {
                                  // Permitir "A" o "a" para ausente
                                  if (e.key === 'a' || e.key === 'A') {
                                    // Permitir que se escriba
                                    return
                                  }
                                  // Bloquear caracteres no permitidos
                                  if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault()
                                  }
                                }}
                                className={`w-12 lg:w-16 px-1 lg:px-2 py-1 border border-gray-300 rounded text-center text-xs lg:text-sm focus:outline-none ${(!perms.recEnabled || isCourseLocked || isUserAuxiliarInCourse) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                                placeholder="-"
                              />
                            )
                          })()
                        ) : (
                          <span className="text-gray-600 text-xs lg:text-sm">{formatGradeForDisplay(gradesData[student.id]?.["REC"])}</span>
                        )}
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-4 text-center">
                        {isEditingGrades ? (
                          (() => {
                            const perms = getGradePermissions(gradesData[student.id] || {})
                            const finalValue = gradesData[student.id]?.["FINAL"] || ""
                            
                            // Si es auto-calculado, mostrar solo lectura con estilo especial
                            if (perms.finalAutoCalculated) {
                              return (
                                <div className="relative">
                                  <input
                                    type="text"
                                    disabled
                                    value={finalValue || "-"}
                                    className="w-12 lg:w-16 px-1 lg:px-2 py-1 border-2 border-green-300 bg-green-50 rounded text-center text-xs lg:text-sm font-semibold text-green-700 cursor-not-allowed"
                                    title="Calculado automáticamente (Promoción)"
                                  />
                                </div>
                              )
                            }
                            
                            return (
                              <input
                                type="text"
                                disabled={!perms.finalEnabled || isCourseLocked || isUserAuxiliarInCourse}
                                value={finalValue}
                                onChange={(e) => updateGrade(String(student.id), "FINAL", e.target.value)}
                                onKeyDown={(e) => {
                                  // Permitir "A" o "a" para ausente
                                  if (e.key === 'a' || e.key === 'A') {
                                    // Permitir que se escriba
                                    return
                                  }
                                  // Bloquear caracteres no permitidos
                                  if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                    e.preventDefault()
                                  }
                                }}
                                className={`w-12 lg:w-16 px-1 lg:px-2 py-1 border border-gray-300 rounded text-center text-xs lg:text-sm focus:outline-none ${(!perms.finalEnabled || isCourseLocked || isUserAuxiliarInCourse) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                                placeholder="-"
                              />
                            )
                          })()
                        ) : (
                          <span className="text-gray-600 text-xs lg:text-sm">{formatGradeForDisplay(gradesData[student.id]?.["FINAL"])}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            gradesData[student.id]?.["CONDICIÓN FINAL"] === "PROMOCIONA"
                              ? "bg-green-100 text-green-800"
                              : gradesData[student.id]?.["CONDICIÓN FINAL"] === "APROBADO"
                                ? "bg-blue-100 text-blue-800"
                                : gradesData[student.id]?.["CONDICIÓN FINAL"] === "FINAL PENDIENTE"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : gradesData[student.id]?.["CONDICIÓN FINAL"] === "RECURSA"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {gradesData[student.id]?.["CONDICIÓN FINAL"] || ""}
                        </span>
                      </td>
                    </tr>
                  ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
            </div>
          )}

        {/* Other tabs content - Removed as all tabs are now implemented */}
      </div>

      {/* Acta Modal */}
      {showActaModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                {course.title}
              </h3>
              <button 
                onClick={() => setShowActaModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Acta generada correctamente</p>
                  <p className="text-sm text-gray-600">Lista para descargar</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-5 p-4 bg-gray-50 rounded-lg">
                <img src="/excel-icon.png" alt="Excel" className="w-10 h-10 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900 break-all">{generateActaFilename()}</span>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Recordá descargarla y revisar que los datos sean correctos. Una vez confirmado, no será posible modificar los datos.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  setShowActaPreviewModal(true)
                }}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span>Visualizar</span>
              </button>
              <button
                onClick={() => {
                  setShowActaModal(false)
                  setShowActaConfirmModal(true)
                }}
                className="flex items-center justify-center space-x-2 bg-slate-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                <span>Generar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Acta generada correctamente */}
      {showActaGeneratedModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de éxito */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">Acta generada correctamente</h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">Se generó el acta y se descargó una copia en tu dispositivo. El acta quedará registrada en el sistema.</p>

              <button
                onClick={() => {
                  setShowActaGeneratedModal(false)
                  // Redirigir a Mis Cursos después de cerrar el modal
                  router.push('/cursos')
                }}
                className="w-full bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Error al generar acta */}
      {showActaErrorModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de error */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">Error generando acta</h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">{actaErrorMessage || 'Ocurrió un error al generar el acta. Por favor intenta nuevamente.'}</p>

              <button
                onClick={() => setShowActaErrorModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización del Acta */}
      {showActaPreviewModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
          onClick={() => setShowActaPreviewModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-150 flex flex-col"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-slate-50">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                  Previsualización del Acta
                </h3>
                <p className="text-sm text-gray-600">{generateActaFilename()}</p>
              </div>
              <button 
                onClick={() => setShowActaPreviewModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
              {/* Encabezado del Acta */}
              <div className="bg-slate-700 text-white p-6 rounded-t-lg mb-0 flex-shrink-0">
                <h4 className="text-2xl font-bold text-center mb-6">{course.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-slate-300 text-xs mb-1">Turno</p>
                    <p className="font-semibold text-base">{getShiftLabel()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-300 text-xs mb-1">Cuatrimestre</p>
                    <p className="font-semibold text-base">{getSemesterLabel()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-300 text-xs mb-1">Alumnos</p>
                    <p className="font-semibold text-base">{students.length}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-600">
                  <div>
                    <p className="text-slate-300 text-xs mb-1">Profesor/es</p>
                    <p className="font-semibold">{getTeachersSummary().titulares || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-300 text-xs mb-1">Ayudante/s</p>
                    <p className="font-semibold">{getTeachersSummary().auxiliares || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Tabla de Datos con scroll */}
              <div className="flex-1 overflow-auto border border-t-0 rounded-b-lg">
                <table className="w-full min-w-[800px] table-fixed">
                  <colgroup>
                    <col className="w-[25%]" /> {/* Nombre */}
                    <col className="w-[22%]" /> {/* Mail */}
                    <col className="w-[8%]" /> {/* Nota 1 */}
                    <col className="w-[8%]" /> {/* Nota 2 */}
                    <col className="w-[8%]" /> {/* REC */}
                    <col className="w-[8%]" /> {/* Final */}
                    <col className="w-[13%]" /> {/* Condición */}
                    <col className="w-[8%]" /> {/* Asistencia */}
                  </colgroup>
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-3 font-bold text-gray-700 text-xs border-b border-r">Nombre y Apellido</th>
                      <th className="text-left py-3 px-3 font-bold text-gray-700 text-xs border-b border-r">Mail</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b border-r">Nota 1</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b border-r">Nota 2</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b border-r">REC</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b border-r">Final</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b border-r">Condición</th>
                      <th className="text-center py-3 px-2 font-bold text-gray-700 text-xs border-b">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const g = gradesData[student.id] || {}
                      const condition = calculateFinalCondition(g)
                      const attendancePercent = computeAttendancePercentByStudent()
                      const asistencia = attendancePercent[student.id] ?? 0
                      
                      return (
                        <tr key={student.uuid || student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="py-2.5 px-3 text-xs border-b border-r truncate">{student.name}</td>
                          <td className="py-2.5 px-3 text-xs border-b border-r truncate">{student.email}</td>
                          <td className="py-2.5 px-2 text-xs text-center border-b border-r font-medium">
                            {formatGradeForDisplay(g["1P"])}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center border-b border-r font-medium">
                            {formatGradeForDisplay(g["2P"])}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center border-b border-r font-medium">
                            {formatGradeForDisplay(g["REC"])}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center border-b border-r font-medium">
                            {formatGradeForDisplay(g["FINAL"])}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center border-b border-r">
                            {condition ? (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                condition === "PROMOCIONA" ? "bg-green-100 text-green-800" :
                                condition === "APROBADO" ? "bg-blue-100 text-blue-800" :
                                condition === "FINAL PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
                                condition === "RECURSA" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {condition}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center border-b font-medium">
                            {asistencia}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer con botón */}
            <div className="border-t bg-gray-50 p-4 flex justify-center">
              <button
                onClick={() => setShowActaPreviewModal(false)}
                className="px-8 py-2.5 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación - Generar Acta */}
      {showActaConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de advertencia */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <ClipboardCheck className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                ¿Confirmar Generación del Acta?
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mb-4 leading-relaxed">
                Estás por generar el acta oficial de <span className="font-semibold text-gray-900">{course.title}</span>.
              </p>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded text-left mb-6">
                <p className="text-sm text-amber-900 font-semibold mb-2">⚠️ Importante:</p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Una vez generada, <strong>no podrás modificar</strong> las calificaciones ni asistencias</li>
                  <li>El acta quedará registrada en el sistema</li>
                  <li>Se generará un archivo Excel con todos los datos</li>
                  <li>Asegúrate de haber revisado todos los datos antes de confirmar</li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowActaConfirmModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      setGeneratingAct(true)
                      const resp = await CoursesService.confirmAct(getCourseIdForApi())
                      if (resp && resp.success) {
                        // keep the preview download for offline copy
                        try { await downloadXlsxPreview() } catch (err) { /* ignore */ }
                        setShowActaConfirmModal(false)
                        // update UI to reflect the locked/closed acta
                        try {
                          setIsCourseLocked(true)
                          setCourse((c: any) => c ? ({ ...c, status: 'ACTA_GENERADA' }) : c)
                        } catch {}
                        // Mostrar modal de éxito
                        setShowActaGeneratedModal(true)
                      } else {
                        // close the confirm modal so the error modal is visible
                        setShowActaConfirmModal(false)
                        // show in-app error modal with message; map known backend error codes to friendly text
                        const backendCode = (resp && (resp as any).data && (resp as any).data.code) || null
                        if (backendCode === 'ACTA_WINDOW_CLOSED') {
                          setActaErrorMessage('El acta ya está cerrada')
                        } else {
                          setActaErrorMessage(resp?.error || resp?.message || 'Error desconocido')
                        }
                        setShowActaErrorModal(true)
                      }
                    } catch (err) {
                      // ensure confirm modal is closed before showing error
                      setShowActaConfirmModal(false)
                      setActaErrorMessage(err instanceof Error ? err.message : String(err))
                      setShowActaErrorModal(true)
                    } finally {
                      setGeneratingAct(false)
                    }
                  }}
                  disabled={generatingAct}
                  className={`flex-1 ${generatingAct ? 'opacity-70 cursor-wait' : 'bg-slate-700 hover:bg-slate-800 active:bg-slate-900'} text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150`}
                >
                  {generatingAct ? 'Generando...' : 'Confirmar y Generar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Loading - Guardando Asistencia */}
      {isSavingAttendance && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 transform"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            <div className="flex flex-col items-center">
              {/* Spinner animado */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full border-t-transparent animate-spin"></div>
              </div>
              
              {/* Texto */}
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Guardando asistencias
              </h2>
              <p className="text-sm text-gray-500 text-center">
                Por favor espere mientras se registran las asistencias...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación - Asistencia Guardada */}
      {showAttendanceSavedModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de éxito */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                Asistencias Registradas
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">
                Se registraron exitosamente las asistencias del día{" "}
                <span className="font-semibold text-gray-900">
                  {selectedDate} de {selectedMonth}
                </span>
                .
              </p>

              {/* Botón de confirmación */}
              <button
                onClick={() => setShowAttendanceSavedModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Loading - Guardando Calificaciones */}
      {savingGrades && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 transform"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            <div className="flex flex-col items-center">
              {/* Spinner animado */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full border-t-transparent animate-spin"></div>
              </div>
              
              {/* Texto */}
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Guardando calificaciones
              </h2>
              <p className="text-sm text-gray-500 text-center">
                Por favor espere mientras se registran las calificaciones...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación - Guardar Calificaciones */}
      {showGradesSaveModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de pregunta */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                ¿Confirmar guardado?
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">
                Estás a punto de guardar las calificaciones cargadas. Una vez guardadas, los datos serán permanentes.
              </p>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGradesSaveModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSaveGrades}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta - Calificaciones */}
      {showGradesAlertModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all duration-150"
            style={{ animation: 'scaleIn 0.15s ease-out' }}
          >
            {/* Icono de alerta */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                gradesAlertType === 'success' ? 'bg-green-100' : gradesAlertType === 'info' ? 'bg-blue-100' : 'bg-red-100'
              }`}>
                {gradesAlertType === 'success' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : gradesAlertType === 'info' ? (
                  <Info className="h-8 w-8 text-blue-600" />
                ) : (
                  <X className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                {gradesAlertType === 'success' ? 'Operación Exitosa' : gradesAlertType === 'info' ? 'Información' : 'Error de Validación'}
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">
                {gradesAlertMessage}
              </p>

              {/* Botón de confirmación */}
              <button
                onClick={() => setShowGradesAlertModal(false)}
                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${
                  gradesAlertType === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 active:bg-green-800' 
                    : gradesAlertType === 'info'
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                      : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                } text-white`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export { CourseInfo }

