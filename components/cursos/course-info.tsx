"use client"

import {
  ArrowLeft,
  FileText,
  Users,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  RotateCcw,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

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
      dates: "01/08/2025 - 30/11/2025",
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
      dates: "01/08/2025 - 30/11/2025",
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
      dates: "01/08/2025 - 30/11/2025",
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
      dates: "01/08/2025 - 30/11/2025",
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
      dates: "01/08/2025 - 30/11/2025",
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
      dates: "01/08/2025 - 30/11/2025",
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

function getStudentColor(studentId: number): string {
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
  return colors[studentId % colors.length]
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

  const [showActaModal, setShowActaModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("Septiembre")
  const [selectedDate, setSelectedDate] = useState(21)
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: { [key: number]: "P" | "1/2" | "A" } }>({})
  const [isEditingGrades, setIsEditingGrades] = useState(false)
  const [gradesData, setGradesData] = useState<Record<string, Record<string, string>>>({})

  const course = getCourseData(courseId)
  const students = course.studentsData || []

  const dayShiftColor = getDayShiftColors(course.day, course.shift)

  const tabs = ["Información", "Alumnos", "Asistencia", "Calificaciones"]

  const months = ["Agosto", "Septiembre", "Octubre", "Noviembre"]
  const dates = [7, 14, 21, 28]

  const navigateMonth = (direction: "prev" | "next") => {
    const currentIndex = months.indexOf(selectedMonth)
    if (direction === "prev" && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1])
    } else if (direction === "next" && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1])
    }
  }

  const setAttendance = (studentId: number, status: "P" | "1/2" | "A") => {
    const key = `${selectedMonth}-${selectedDate}`
    setAttendanceData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [studentId]: status,
      },
    }))
  }

  const getAttendance = (studentId: number): "P" | "1/2" | "A" | null => {
    const key = `${selectedMonth}-${selectedDate}`
    return attendanceData[key]?.[studentId] || null
  }

  const calculateFinalCondition = (studentGrades: Record<string, string>) => {
    const p1 = Number.parseFloat(studentGrades["1P"]) || 0
    const p2 = Number.parseFloat(studentGrades["2P"]) || 0
    const rec1p = Number.parseFloat(studentGrades["REC 1P"]) || 0
    const rec2p = Number.parseFloat(studentGrades["REC 2P"]) || 0
    const final = Number.parseFloat(studentGrades["FINAL"]) || 0

    // Use recuperatorio if it's higher than the original grade
    const finalP1 = Math.max(p1, rec1p)
    const finalP2 = Math.max(p2, rec2p)

    // Count failed instances (less than 4 or empty)
    const failedInstances = [studentGrades["1P"] === "" || p1 < 4, studentGrades["2P"] === "" || p2 < 4].filter(
      Boolean,
    ).length

    // If failed in 2 or more instances, DESAPROBADO
    if (failedInstances >= 2) {
      return "DESAPROBADO"
    }

    // If 8 or more in all evaluation instances (not FINAL), PROMOCIONA
    if (finalP1 >= 8 && finalP2 >= 8) {
      return "PROMOCIONA"
    }

    // If all instances approved but no final grade, REGULAR
    if (finalP1 >= 4 && finalP2 >= 4 && (!studentGrades["FINAL"] || final === 0)) {
      return "REGULAR"
    }

    // If all instances approved with less than 8 and final 4 or more, APROBADO
    if (finalP1 >= 4 && finalP2 >= 4 && final >= 4) {
      return "APROBADO"
    }

    return "LIBRE"
  }

  const updateGrade = (studentId: string, field: string, value: string) => {
    setGradesData((prev) => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value,
        },
      }

      if (field !== "CONDICIÓN FINAL") {
        updated[studentId]["CONDICIÓN FINAL"] = calculateFinalCondition(updated[studentId])
      }

      return updated
    })
  }

  const saveGrades = () => {
    setIsEditingGrades(false)
    // Here you would save to backend
    console.log("Saving grades:", gradesData)
  }

  const generateActaFilename = () => {
    const randomNumber = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")
    return `ACTA${randomNumber} ${course.title} - ${course.code}.xlsx`
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.legajo.toString().includes(studentSearchTerm)
    const matchesCondition =
      studentsFilterConditions.length === 0 || studentsFilterConditions.includes(student.condition)
    return matchesSearch && matchesCondition
  })

  const filteredAttendanceStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      student.legajo.toString().includes(attendanceSearchTerm)
    const matchesAttendance =
      attendanceFilterStatuses.length === 0 || attendanceFilterStatuses.includes(student.attendance)
    return matchesSearch && matchesAttendance
  })

  const filteredGradesStudents =
    course.studentsData?.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(gradesSearchTerm.toLowerCase()) || student.legajo.includes(gradesSearchTerm)
      const finalCondition = calculateFinalCondition(student.id)
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

  return (
    <div className="min-h-screen">
      {/* Hero Section with Course Header */}
      <div
        className="relative h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
        style={{
          backgroundImage: `url('/geometric-architectural-pattern-dark-blue-building.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => router.push("/cursos")}
          className="absolute top-4 left-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white px-6 py-6 border-b">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">{course.title}</h1>

        <div className="flex items-center space-x-6 text-sm mb-3">
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">{course.code}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">{course.students} alumnos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-600" />
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

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className={`${dayShiftColor} text-white text-xs font-semibold px-2 py-1 rounded`}>{course.day}</span>
            <span className={`${dayShiftColor} text-white text-xs font-semibold px-2 py-1 rounded`}>
              {course.shift}
            </span>
            <span className="font-medium text-gray-900">{course.schedule}</span>
          </div>
          <span className="text-gray-600">{course.dates}</span>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">{course.isVirtual ? "VIRTUAL" : course.location}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-200 border-b">
        <div className="px-6">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-slate-700 text-slate-700 bg-white" // Changed from orange to slate-700 to match navbar
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
      <div className="p-6 bg-gray-100 min-h-screen">
        {activeTab === "Información" && (
          <div className="space-y-6">
            {/* Course Status */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Información general del curso</h2>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Estado del curso</h3>
                  <span className="text-gray-600">{course.status}</span>
                </div>
                <button
                  onClick={() => setShowActaModal(true)}
                  className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  GESTIONAR ACTA
                </button>
              </div>
            </div>

            {/* Teachers Section */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-gray-900">Docentes</h3>

              {/* Teachers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Legajo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Mail</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.teachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${getTeacherColor(teacher.id)}`}
                            >
                              <span className="text-white text-xs font-semibold">{getInitials(teacher.name)}</span>
                            </div>
                            <span className="font-medium">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{teacher.legajo}</td>
                        <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              teacher.role === "Titular"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
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
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-6">Estadísticas</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Time Progress */}
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tiempo transcurrido</h4>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-slate-800 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${course.stats.timeProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">{course.stats.timeProgress}%</span>
                  </div>
                </div>

                {/* Average Attendance */}
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Asistencia Promedio</h4>
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-cyan-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${course.stats.averageAttendance}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">{course.stats.averageAttendance}%</span>
                    </div>
                  </div>
                </div>

                {/* Average Grade */}
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Calificación Promedio</h4>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-800">{course.stats.averageGrade}</span>
                  </div>
                  <span className="text-xs text-gray-500">(no considera ausentes)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Alumnos" && (
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Alumnos</h3>
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o legajo"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Buscar estudiantes por nombre o legajo"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowStudentsFilter(!showStudentsFilter)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Filtrar por condición"
                    aria-expanded={showStudentsFilter}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Condición</span>
                    {studentsFilterConditions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        {studentsFilterConditions.length}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showStudentsFilter && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Condición</label>
                          <button
                            onClick={() => setShowStudentsFilter(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar filtro"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {["Regular", "Adeuda final"].map((condition) => (
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

                <button
                  type="button"
                  onClick={resetStudentsFilters}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:bg-gray-50"
                  aria-label="Restaurar filtros"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurar</span>
                </button>
              </div>

              {studentsFilterConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {studentsFilterConditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {condition}
                      <button
                        onClick={() => removeStudentCondition(condition)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        aria-label={`Remover filtro ${condition}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Legajo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Mail</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Condición</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStudentColor(student.id)}`}
                          >
                            <span className="text-white text-xs font-semibold">{getInitials(student.name)}</span>
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.legajo}</td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            student.condition === "Adeuda final"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {student.condition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Asistencia" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Carga de Asistencia</h2>

              <div className="mb-6">
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-100 rounded-lg p-2">
                    <span className="text-sm font-medium text-gray-700 px-3">{selectedMonth}</span>
                    <span className="text-sm font-medium text-gray-500 px-2">•</span>
                    <span className="text-sm font-medium text-gray-700 px-1">Fecha</span>

                    <button
                      onClick={() => navigateMonth("prev")}
                      disabled={months.indexOf(selectedMonth) === 0}
                      className="p-1 mx-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>

                    <div className="flex space-x-1 mx-2">
                      {dates.map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedDate === date
                              ? "bg-slate-800 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => navigateMonth("next")}
                      disabled={months.indexOf(selectedMonth) === months.length - 1}
                      className="p-1 mx-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Students Section */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-4">Alumnos</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o legajo"
                      value={attendanceSearchTerm}
                      onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Buscar estudiantes por nombre o legajo"
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowAttendanceFilter(!showAttendanceFilter)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label="Filtrar por asistencia"
                      aria-expanded={showAttendanceFilter}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Asistencia</span>
                      {attendanceFilterStatuses.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          {attendanceFilterStatuses.length}
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showAttendanceFilter && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Asistencia</label>
                            <button
                              onClick={() => setShowAttendanceFilter(false)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label="Cerrar filtro"
                            >
                              <X className="h-4 w-4" />
                            </button>
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

                  <button
                    type="button"
                    onClick={resetAttendanceFilters}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:bg-gray-50"
                    aria-label="Restaurar filtros"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restaurar</span>
                  </button>
                </div>

                {attendanceFilterStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {attendanceFilterStatuses.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {status}
                        <button
                          onClick={() => removeAttendanceStatus(status)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                          aria-label={`Remover filtro ${status}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Legajo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Mail</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${getStudentColor(student.id)}`}
                            >
                              <span className="text-white text-xs font-semibold">{getInitials(student.name)}</span>
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{student.legajo}</td>
                        <td className="py-3 px-4 text-gray-600">{student.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setAttendance(student.id, "P")}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                                getAttendance(student.id) === "P"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-green-100"
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => setAttendance(student.id, "1/2")}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                                getAttendance(student.id) === "1/2"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-yellow-100"
                              }`}
                            >
                              1/2
                            </button>
                            <button
                              onClick={() => setAttendance(student.id, "A")}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                                getAttendance(student.id) === "A"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-red-100"
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Calificaciones" && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Calificaciones</h2>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-4">Alumnos</h3>
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o legajo"
                    value={gradesSearchTerm}
                    onChange={(e) => setGradesSearchTerm(e.target.value)}
                    className="w-64 pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Buscar estudiantes por nombre o legajo"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>

                <button
                  onClick={() => setIsEditingGrades(!isEditingGrades)}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    isEditingGrades
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditingGrades ? "Guardar" : "Editar"}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowGradesFilter(!showGradesFilter)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Filtrar por condición final"
                    aria-expanded={showGradesFilter}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Condición</span>
                    {gradesFilterConditions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        {gradesFilterConditions.length}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showGradesFilter && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Condición Final</label>
                          <button
                            onClick={() => setShowGradesFilter(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar filtro"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {["PROMOCIONA", "APRUEBA", "REGULAR", "LIBRE"].map((condition) => (
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

                <button
                  type="button"
                  onClick={resetGradesFilters}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:bg-gray-50"
                  aria-label="Restaurar filtros"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurar</span>
                </button>
              </div>

              {gradesFilterConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {gradesFilterConditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {condition}
                      <button
                        onClick={() => removeGradeCondition(condition)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        aria-label={`Remover filtro ${condition}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Legajo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">1P</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">REC 1P</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">2P</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">REC 2P</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">FINAL</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">CONDICIÓN FINAL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGradesStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStudentColor(student.id)}`}
                          >
                            <span className="text-white text-xs font-semibold">{getInitials(student.name)}</span>
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.legajo}</td>
                      <td className="py-3 px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradesData[student.id]?.["1P"] || ""}
                            onChange={(e) => updateGrade(student.id, "1P", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{gradesData[student.id]?.["1P"] || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradesData[student.id]?.["REC 1P"] || ""}
                            onChange={(e) => updateGrade(student.id, "REC 1P", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{gradesData[student.id]?.["REC 1P"] || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradesData[student.id]?.["2P"] || ""}
                            onChange={(e) => updateGrade(student.id, "2P", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{gradesData[student.id]?.["2P"] || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradesData[student.id]?.["REC 2P"] || ""}
                            onChange={(e) => updateGrade(student.id, "REC 2P", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{gradesData[student.id]?.["REC 2P"] || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditingGrades ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={gradesData[student.id]?.["FINAL"] || ""}
                            onChange={(e) => updateGrade(student.id, "FINAL", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">{gradesData[student.id]?.["FINAL"] || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            gradesData[student.id]?.["CONDICIÓN FINAL"] === "PROMOCIONA"
                              ? "bg-green-100 text-green-800"
                              : gradesData[student.id]?.["CONDICIÓN FINAL"] === "APROBADO"
                                ? "bg-blue-100 text-blue-800"
                                : gradesData[student.id]?.["CONDICIÓN FINAL"] === "REGULAR"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : gradesData[student.id]?.["CONDICIÓN FINAL"] === "DESAPROBADO"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {gradesData[student.id]?.["CONDICIÓN FINAL"] || "LIBRE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab !== "Información" &&
          activeTab !== "Alumnos" &&
          activeTab !== "Asistencia" &&
          activeTab !== "Calificaciones" && (
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contenido de {activeTab}</h3>
              <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
            </div>
          )}
      </div>

      {/* Acta Modal */}
      {showActaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {course.title} - {course.code}
              </h3>
              <button onClick={() => setShowActaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-900">Se generó correctamente el acta</span>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <img src="/excel-icon.png" alt="Excel" className="w-10 h-10" />
                <span className="text-gray-900 text-sm">{generateActaFilename()}</span>
              </div>

              <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                Recordá descargarla y revisar que los datos sean correctos. Una vez confirmado, no será posible
                modificar los datos.
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowActaModal(false)} className="text-red-600 hover:text-red-700 font-medium">
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Here you would implement the actual file download
                  console.log("Downloading acta file:", generateActaFilename())
                  setShowActaModal(false)
                }}
                className="bg-slate-800 text-white px-6 py-2 rounded font-medium hover:bg-slate-700 transition-colors"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { CourseInfo }
