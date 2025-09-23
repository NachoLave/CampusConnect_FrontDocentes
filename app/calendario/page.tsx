"use client"

import { useMemo, useState } from "react"
import coursesData from "@/lib/data/courses.json"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale"

// Mock data for events (usar dd/mm/yyyy)
const mockEvents = [
  {
    id: 1,
    type: "clase",
    title: "Clase: Matemáticas",
    date: "14/02/2025",
    time: "10:00 - 11:30",
    location: "Aula 201",
    section: "Sede A",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  {
    id: 2,
    type: "evento",
    title: "Evento: Feria de ciencias",
    date: "14/02/2025",
    time: "14:00 - 17:30",
    location: "Microestadio",
    description:
      "Ven a participar de la 10° edición de nuestra feria de ciencias. Donde cientos de profesionales de la industria se reúnen a compartir sus experiencias",
    color: "bg-green-100 border-green-200 text-green-800",
  },
  {
    id: 3,
    type: "examen",
    title: "Examen Parcial - Física",
    date: "16/02/2025",
    time: "12:00 - 13:30",
    location: "Aula 105",
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
  {
    id: 4,
    type: "clase",
    title: "Clase: Literatura",
    date: "15/02/2025",
    time: "09:00 - 10:30",
    location: "Aula 302",
    color: "bg-purple-100 border-purple-200 text-purple-800",
  },
  {
    id: 5,
    type: "clase",
    title: "Clase: Programación I",
    date: "21/02/2025",
    time: "08:00 - 10:00",
    location: "Aula 401",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  {
    id: 6,
    type: "evento",
    title: "Charla: UX en la educación",
    date: "22/02/2025",
    time: "18:00 - 19:00",
    location: "Auditorio Central",
    description: "Diseño centrado en el estudiante: tendencias y casos de éxito.",
    color: "bg-green-100 border-green-200 text-green-800",
  },
  {
    id: 7,
    type: "examen",
    title: "Examen Final - Álgebra",
    date: "25/02/2025",
    time: "11:00 - 13:00",
    location: "Aula 210",
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
  {
    id: 8,
    type: "clase",
    title: "Clase: Química",
    date: "28/02/2025",
    time: "13:00 - 15:00",
    location: "Laboratorio 2",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
]

// Helpers para parsear dd/mm/yyyy y hora HH:MM
const parseDate = (d: string) => {
  const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10))
  return new Date(yyyy, mm - 1, dd)
}
const parseStartTime = (t: string) => {
  const start = t.split("-")[0].trim() // "10:00"
  const [hh, mi] = start.split(":").map((n) => parseInt(n, 10))
  return { hh, mi }
}

// Generar clases (mock) a partir de los cursos para una fecha exacta
const weekdayMapCourses: Record<string, number> = {
  'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SÁBADO': 6, 'SABADO': 6,
}
const toDdMmYyyy = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
const getCourseEventsForDate = (date: Date) => {
  const label = toDdMmYyyy(date)
  const weekday = date.getDay()
  return (coursesData as any[])
    .filter((c) => c.dates)
    .filter((c) => weekdayMapCourses[(c.day || '').toUpperCase()] === weekday)
    .filter((c) => {
      const [startStr, endStr] = String(c.dates).split('-').map((s) => s.trim())
      const [sd, sm, sy] = startStr.split('/').map((n: string) => parseInt(n, 10))
      const [ed, em, ey] = endStr.split('/').map((n: string) => parseInt(n, 10))
      const start = new Date(sy, sm - 1, sd)
      const end = new Date(ey, em - 1, ed)
      return date >= start && date <= end
    })
    .map((c) => ({
      id: `course-${c.id}-${label}`,
      type: 'clase',
      title: `Clase: ${c.title}`,
      date: label,
      time: c.schedule || '00:00 - 00:00',
      location: c.location,
      section: c.sede,
      color: 'bg-blue-100 border-blue-200 text-blue-800',
    }))
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [filters, setFilters] = useState({
    clases: true,
    examenes: true,
    eventos: true,
    comedor: true,
    inscripto: false,
    participacionObligatoria: false,
  })

  const handleFilterChange = (filterName: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: checked,
    }))
  }

  const resetFilters = () => {
    setFilters({
      clases: true,
      examenes: true,
      eventos: true,
      comedor: true,
      inscripto: false,
      participacionObligatoria: false,
    })
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  const selectedLabel = useMemo(() => {
    const d = selectedDate || new Date()
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }, [selectedDate])

  const isEventVisible = (e: any) => {
    if (e.type === 'clase') return filters.clases
    if (e.type === 'examen') return filters.examenes
    if (e.type === 'evento') return filters.eventos
    if (e.type === 'comedor') return filters.comedor
    return true
  }

  const eventsOfSelected = useMemo(() => {
    const label = selectedLabel
    const selected = selectedDate || new Date()
    const courseEvents = getCourseEventsForDate(selected)
    return [...mockEvents, ...courseEvents].filter((e) => e.date === label && isEventVisible(e))
  }, [selectedLabel, selectedDate, filters])

  const upcoming = useMemo(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    // Generar eventos mockeados a partir de los cursos en cursada
    const weekdayMap: Record<string, number> = {
      'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIÉRCOLES': 3, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SÁBADO': 6, 'SABADO': 6,
    }
    const toDdMmYyyy = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const courseEvents = (coursesData as any[])
      .filter((c) => c.dates)
      .flatMap((c) => {
        // convertir rango
        const [startStr, endStr] = String(c.dates).split('-').map((s) => s.trim())
        const [sd, sm, sy] = startStr.split('/').map((n: string) => parseInt(n, 10))
        const [ed, em, ey] = endStr.split('/').map((n: string) => parseInt(n, 10))
        const start = new Date(sy, sm - 1, sd)
        const end = new Date(ey, em - 1, ed)
        const targetWeekday = weekdayMap[(c.day || '').toUpperCase()] ?? -1
        const events: any[] = []
        for (let d = new Date(todayStart); d <= end; d.setDate(d.getDate() + 1)) {
          if (d >= start && d.getDay() === targetWeekday) {
            events.push({
              id: `course-${c.id}-${toDdMmYyyy(new Date(d))}`,
              type: 'clase',
              title: `Clase: ${c.title}`,
              date: toDdMmYyyy(new Date(d)),
              time: c.schedule || '00:00 - 00:00',
              location: c.location,
              color: 'bg-blue-100 border-blue-200 text-blue-800',
            })
          }
        }
        return events
      })

    const enriched = [...mockEvents, ...courseEvents].map((e) => {
      const d = parseDate(e.date)
      const { hh, mi } = parseStartTime(e.time)
      d.setHours(hh, mi, 0, 0)
      return { ...e, dt: d }
    })
    .filter((e) => e.dt >= todayStart && isEventVisible(e))
    .sort((a, b) => a.dt.getTime() - b.dt.getTime())
    .slice(0, 5)
    return enriched.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      color: e.type === 'clase' ? 'border-l-blue-500' : e.type === 'examen' ? 'border-l-orange-500' : 'border-l-green-500',
      time: `${e.dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short'})} • ${e.time}`,
    }))
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
        <p className="text-gray-600">Podes visualizar tus clases, eventos y turnos programados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          {/* Two Month Calendar View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 relative">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex items-center justify-center space-x-16">
                <h2 className="text-lg font-semibold text-gray-900">{capitalizeFirst(getMonthName(currentMonth))}</h2>
                <h2 className="text-lg font-semibold text-gray-900">
                  {capitalizeFirst(getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)))}
                </h2>
              </div>

              <button
                onClick={nextMonth}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Spanish locale added to both Calendar components */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={es}
                className="w-full [&_.rdp-nav]:hidden [&_.rdp-caption_button]:hidden"
                eventsByDay={useMemo(() => {
                  // construir mapa { dd/mm/yyyy: {clase:true,examen:true,...} }
                  const map: Record<string, any> = {}
                  const add = (e: any) => {
                    if (!isEventVisible(e)) return
                    const d = e.date
                    map[d] = map[d] || {}
                    if (e.type) map[d][e.type] = true
                  }
                  // eventos mock
                  mockEvents.forEach(add)
                  // eventos de cursos
                  const today = new Date()
                  const startRange = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                  const endRange = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)
                  for (let d = new Date(startRange); d <= endRange; d.setDate(d.getDate() + 1)) {
                    getCourseEventsForDate(new Date(d)).forEach(add)
                  }
                  return map
                }, [currentMonth, filters])}
              />
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
                locale={es}
                className="w-full [&_.rdp-nav]:hidden [&_.rdp-caption_button]:hidden"
                eventsByDay={useMemo(() => {
                  const map: Record<string, any> = {}
                  const add = (e: any) => {
                    if (!isEventVisible(e)) return
                    const d = e.date
                    map[d] = map[d] || {}
                    if (e.type) map[d][e.type] = true
                  }
                  mockEvents.forEach(add)
                  const startRange = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                  const endRange = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)
                  for (let d = new Date(startRange); d <= endRange; d.setDate(d.getDate() + 1)) {
                    getCourseEventsForDate(new Date(d)).forEach(add)
                  }
                  return map
                }, [currentMonth, filters])}
              />
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventos del {selectedLabel}</h2>

            <div className="space-y-4">
              {eventsOfSelected.length === 0 && (
                <p className="text-sm text-gray-500">No hay eventos para esta fecha.</p>
              )}
              {eventsOfSelected.map((event) => (
                <div key={event.id} className={`p-4 rounded-lg border ${event.color} relative`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {event.date} • {event.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {event.location} • {event.section}
                          </span>
                        </div>
                      </div>
                      {event.description && <p className="text-sm text-gray-700 mb-3">{event.description}</p>}
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                      VER MAS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Upcoming Events Sidebar */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="clases"
                  checked={filters.clases}
                  onCheckedChange={(checked) => handleFilterChange("clases", checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <label htmlFor="clases" className="text-sm font-medium text-gray-700">
                    Clases
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="examenes"
                  checked={filters.examenes}
                  onCheckedChange={(checked) => handleFilterChange("examenes", checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <label htmlFor="examenes" className="text-sm font-medium text-gray-700">
                    Exámenes
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="eventos"
                  checked={filters.eventos}
                  onCheckedChange={(checked) => handleFilterChange("eventos", checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <label htmlFor="eventos" className="text-sm font-medium text-gray-700">
                    Eventos
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="comedor"
                  checked={filters.comedor}
                  onCheckedChange={(checked) => handleFilterChange("comedor", checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <label htmlFor="comedor" className="text-sm font-medium text-gray-700">
                    Comedor
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="inscripto"
                  checked={filters.inscripto}
                  onCheckedChange={(checked) => handleFilterChange("inscripto", checked as boolean)}
                />
                <label htmlFor="inscripto" className="text-sm font-medium text-gray-700">
                  Inscripto
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="participacionObligatoria"
                  checked={filters.participacionObligatoria}
                  onCheckedChange={(checked) => handleFilterChange("participacionObligatoria", checked as boolean)}
                />
                <label htmlFor="participacionObligatoria" className="text-sm font-medium text-gray-700">
                  Participación obligatoria
                </label>
              </div>
            </div>

            {/* Botones removidos: los filtros aplican automáticamente al seleccionar */}
          </div>

          {/* Upcoming Events (dinámicos con base al día actual) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos eventos</h3>

            <div className="space-y-4">
              {upcoming.map((event) => (
                <div key={event.id} className={`p-3 border-l-4 ${event.color} bg-gray-50 rounded-r-lg`}>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{event.time}</p>
                  <p className="text-xs text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
