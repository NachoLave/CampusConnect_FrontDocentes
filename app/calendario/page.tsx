"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import coursesData from "@/lib/data/courses.json"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale/es"
import { CalendarService, CalendarEvent as BackendCalendarEvent } from '@/lib/api/services/calendar'

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
  {
    id: 9,
    type: "comedor",
    title: "Reserva Comedor - Almuerzo",
    date: "14/02/2025",
    time: "12:00 - 13:00",
    location: "Comedor Central",
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
  },
  {
    id: 10,
    type: "comedor",
    title: "Reserva Comedor - Cena",
    date: "16/02/2025",
    time: "19:00 - 20:00",
    location: "Comedor Central",
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
  },
  // Eventos para octubre 2025
  {
    id: 11,
    type: "clase",
    title: "Clase: Matemáticas Avanzadas",
    date: "15/10/2025",
    time: "10:00 - 11:30",
    location: "Aula 201",
    section: "Sede A",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  {
    id: 12,
    type: "examen",
    title: "Examen Parcial - Programación",
    date: "18/10/2025",
    time: "14:00 - 16:00",
    location: "Aula 105",
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
  {
    id: 13,
    type: "evento",
    title: "Conferencia: Inteligencia Artificial",
    date: "22/10/2025",
    time: "18:00 - 20:00",
    location: "Auditorio Central",
    description: "Tendencias actuales en IA y su aplicación en la educación",
    color: "bg-green-100 border-green-200 text-green-800",
  },
  {
    id: 14,
    type: "comedor",
    title: "Reserva Comedor - Almuerzo",
    date: "25/10/2025",
    time: "12:00 - 13:00",
    location: "Comedor Central",
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
  },
  // Eventos para noviembre 2025
  {
    id: 15,
    type: "clase",
    title: "Clase: Física Cuántica",
    date: "05/11/2025",
    time: "09:00 - 11:00",
    location: "Laboratorio 3",
    section: "Sede B",
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  {
    id: 16,
    type: "examen",
    title: "Examen Final - Matemáticas",
    date: "12/11/2025",
    time: "10:00 - 12:00",
    location: "Aula 210",
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
  {
    id: 17,
    type: "evento",
    title: "Workshop: Desarrollo Web",
    date: "18/11/2025",
    time: "15:00 - 17:00",
    location: "Sala de Computación",
    description: "Taller práctico de desarrollo web moderno",
    color: "bg-green-100 border-green-200 text-green-800",
  },
  {
    id: 18,
    type: "comedor",
    title: "Reserva Comedor - Cena",
    date: "20/11/2025",
    time: "19:00 - 20:00",
    location: "Comedor Central",
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
  },
  {
    id: 19,
    type: "clase",
    title: "Clase: Química Orgánica",
    date: "28/11/2025",
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
  
  const events = (coursesData as any[])
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
    
  if (events.length > 0) {
    console.log(`✅ Eventos para ${label}:`, events.map(e => e.title))
  }
  return events
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [backendEvents, setBackendEvents] = useState<BackendCalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    clases: true,
    examenes: true,
    eventos: true,
    comedor: true,
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

  // Helper: format YYYY-MM-DD to dd/MM/yyyy
  const formatIsoToDdMmYyyy = (iso: string) => {
    if (!iso) return ''
    // If iso is in YYYY-MM-DD format (no timezone), parse components to avoid timezone shift
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    if (isoDateOnly) {
      const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10))
      return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    const dt = new Date(iso)
    return dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Map backend event.type to page types
  const mapBackendType = (t: BackendCalendarEvent['type'], eventId?: string, title?: string): string => {
    if (t === 'class') return 'clase'
    if (t === 'exam') return 'examen'
    // Detectar eventos de comedor por el id o título
    if (eventId?.startsWith('canteen-') || title?.toLowerCase().includes('comedor')) return 'comedor'
    if (t === 'meeting') return 'evento'
    return 'evento'
  }

  // Función para obtener tipos de eventos por fecha (usa backend events when available)
  const getEventTypesForDate = (date: Date): Set<string> => {
    const types = new Set<string>()
    const label = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

    // Use only backend events
    backendEvents.forEach((evt) => {
      const key = formatIsoToDdMmYyyy(evt.date)
      const mappedType = mapBackendType(evt.type, evt.id, evt.title)
      if (key === label && isEventVisible({ type: mappedType })) types.add(mappedType)
    })

    return types
  }

  const eventsOfSelected = useMemo(() => {
    const label = selectedLabel
    // Prefer backend events
    const fromBackend = backendEvents.map((e) => {
      const mappedType = mapBackendType(e.type, e.id, e.title)
      return {
        id: e.id,
        courseId: (e as any).courseId,
        type: mappedType,
        title: e.title,
        date: formatIsoToDdMmYyyy(e.date),
        // build time range from start (time) and duration
        time: (() => {
          const start = e.time // HH:MM
          const [hh, mm] = start.split(':').map((n) => parseInt(n, 10))
          const startDt = new Date(e.date + 'T' + start + ':00')
          const endDt = new Date(startDt.getTime() + (e.duration || 60) * 60000)
          const pad = (n: number) => n.toString().padStart(2, '0')
          return `${pad(startDt.getHours())}:${pad(startDt.getMinutes())} - ${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`
        })(),
        location: e.classroom || '',
        section: e.sede || '',
        color: mappedType === 'clase' ? 'bg-blue-100 border-blue-200 text-blue-800' : 
               mappedType === 'examen' ? 'bg-orange-100 border-orange-200 text-orange-800' : 
               mappedType === 'comedor' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
               'bg-green-100 border-green-200 text-green-800'
      }
    }).filter((ev) => ev.date === label && isEventVisible(ev))

    // Return backend-derived events (may be empty)
    return fromBackend
  }, [selectedLabel, selectedDate, filters, backendEvents])

  const router = useRouter()

  const handleViewMore = (event: any) => {
    if (!event) return
    if (event.type === 'clase' || event.type === 'examen') {
      const id = event.courseId || event.courseId === 0 ? String(event.courseId) : null
      if (id && id !== '0') {
        router.push(`/cursos/${id}`)
        return
      }
      // fallback: try to extract numeric id from event.id if present
      const m = String(event.id || '').match(/(\d+)/)
      if (m) {
        router.push(`/cursos/${m[1]}`)
        return
      }
      // otherwise go to cursos list
      router.push('/cursos')
      return
    }

    if (event.type === 'comedor') {
      router.push('/comedor')
      return
    }

    // Default: go to calendar (no-op alternative)
    router.push('/calendario')
  }

  // Fetch backend events for the two-month window (currentMonth and next month)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      setEventsError(null)
      try {
        // Fetch a slightly wider window (previous month -> next month) to avoid missing events
        const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0) // last day of next month
        const fromIso = from.toISOString().split('T')[0]
        const toIso = to.toISOString().split('T')[0]
        
        console.log('📅 CalendarioPage - Fetching events', { fromIso, toIso, currentMonth: currentMonth.toISOString() })
        
        const res = await CalendarService.getWeeklyEvents(fromIso, toIso)
        
        console.log('📅 CalendarioPage - Response recibida', {
          success: res.success,
          dataLength: Array.isArray(res.data) ? res.data.length : 'No es array',
          message: res.message,
          sampleData: Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null
        })
        
        if (res.success && Array.isArray(res.data)) {
          console.log('✅ CalendarioPage - Estableciendo eventos:', res.data.length, res.data)
          setBackendEvents(res.data)
        } else {
          console.warn('⚠️ CalendarioPage - Respuesta no exitosa o no es array', res)
          setBackendEvents([])
          setEventsError(res.message || 'No events')
        }
      } catch (err: any) {
        console.error('❌ CalendarioPage - Error fetching calendar events', err)
        console.error('❌ Error details:', {
          message: err?.message,
          stack: err?.stack,
          name: err?.name
        })
        setBackendEvents([])
        setEventsError(String(err?.message || err))
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [currentMonth, selectedDate])

  const upcoming = useMemo(() => {
    // Show backend events for the current day only (no mocks)
    const today = new Date()
    const todayLabel = today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const todays = backendEvents
      .map((e) => ({
        id: e.id,
        type: mapBackendType(e.type, e.id, e.title),
        title: e.title,
        date: formatIsoToDdMmYyyy(e.date),
        time: (() => {
          const start = e.time // HH:MM
          const [hh, mm] = start.split(':').map((n) => parseInt(n, 10))
          const startDt = new Date(e.date + 'T' + start + ':00')
          const endDt = new Date(startDt.getTime() + (e.duration || 60) * 60000)
          const pad = (n: number) => n.toString().padStart(2, '0')
          return `${pad(startDt.getHours())}:${pad(startDt.getMinutes())} - ${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`
        })(),
        location: e.classroom || '',
        color: (() => {
          const t = mapBackendType(e.type, e.id, e.title)
          if (t === 'clase') return 'border-l-blue-500'
          if (t === 'examen') return 'border-l-orange-500'
          if (t === 'comedor') return 'border-l-yellow-500'
          return 'border-l-green-500' // evento
        })(),
        dt: new Date((e.date || '') + 'T' + (e.time || '00:00') + ':00')
      }))
      .filter((ev) => ev.date === todayLabel && isEventVisible(ev))
      .sort((a, b) => a.dt.getTime() - b.dt.getTime())

    return todays.map((e) => ({ id: e.id, title: e.title, location: e.location, color: e.color, time: `${todayLabel} • ${e.time}` }))
  }, [backendEvents, filters])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
        <p className="text-sm md:text-base text-gray-600">Podes visualizar tus clases, eventos y turnos programados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        {/* Filters - Mobile: Above Calendar */}
        <div className="lg:hidden space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Filtros</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clases-mobile"
                  checked={filters.clases}
                  onCheckedChange={(checked) => handleFilterChange("clases", checked as boolean)}
                />
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <label htmlFor="clases-mobile" className="text-xs font-medium text-gray-700">
                    Clases
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="examenes-mobile"
                  checked={filters.examenes}
                  onCheckedChange={(checked) => handleFilterChange("examenes", checked as boolean)}
                />
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                  <label htmlFor="examenes-mobile" className="text-xs font-medium text-gray-700">
                    Exámenes
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eventos-mobile"
                  checked={filters.eventos}
                  onCheckedChange={(checked) => handleFilterChange("eventos", checked as boolean)}
                />
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <label htmlFor="eventos-mobile" className="text-xs font-medium text-gray-700">
                    Eventos
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comedor-mobile"
                  checked={filters.comedor}
                  onCheckedChange={(checked) => handleFilterChange("comedor", checked as boolean)}
                />
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <label htmlFor="comedor-mobile" className="text-xs font-medium text-gray-700">
                    Comedor
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="lg:col-span-3">
          {/* Two Month Calendar View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6 relative">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button
                onClick={prevMonth}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={goToToday}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400"
              >
                Hoy
              </button>

              <button
                onClick={nextMonth}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Primer mes */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {capitalizeFirst(getMonthName(currentMonth))}
                </h2>
                <Calendar
                  mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                    // Si se deselecciona (date es undefined), ir al día actual
                    if (!date) {
                      const today = new Date()
                      setSelectedDate(today)
                      setCurrentMonth(today)
                    } else {
                      setSelectedDate(date)
                    }
                  }}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={es}
                // Pass per-type modifiers computed from backendEvents so DayPicker
                // marks days regardless of custom Day renderer.
                modifiers={useMemo(() => {
                  const clase: Date[] = []
                  const examen: Date[] = []
                  const evento: Date[] = []
                  const comedor: Date[] = []
                  backendEvents.forEach((e) => {
                    const key = formatIsoToDdMmYyyy(e.date)
                    // parse dd/mm/yyyy -> Date
                    const parts = key.split('/')
                    if (parts.length !== 3) return
                    const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
                    const t = mapBackendType(e.type, e.id, e.title)
                    // Respect active filters: only add modifiers for visible event types
                    if (!isEventVisible({ type: t })) return
                    if (t === 'clase') clase.push(d)
                    if (t === 'examen') examen.push(d)
                    if (t === 'evento') evento.push(d)
                    if (t === 'comedor') comedor.push(d)
                  })
                  return { clase, examen, evento, comedor }
                }, [backendEvents, filters])}
                modifiersClassNames={useMemo(() => ({
                  clase: 'cc-clase',
                  examen: 'cc-examen',
                  evento: 'cc-evento',
                  comedor: 'cc-comedor'
                }), [])}
                className="w-full [&_.rdp-nav]:hidden [&_.rdp-caption_button]:hidden"
                eventsByDay={useMemo(() => {
                  const map: Record<string, any> = {}
                  console.log('📅 Building eventsByDay map (first calendar) - backendEvents:', backendEvents.length)
                  
                  backendEvents.forEach((e) => {
                    const key = formatIsoToDdMmYyyy(e.date)
                    const mappedType = mapBackendType(e.type, e.id, e.title)
                    if (!isEventVisible({ type: mappedType })) return
                    map[key] = map[key] || {}
                    map[key][mappedType] = true
                  })

                  console.log('📅 eventsByDay map construido (first calendar):', Object.keys(map).length, 'días con eventos', map)
                  return map
                }, [currentMonth, filters, backendEvents])}
              />
              </div>

              {/* Segundo mes */}
              <div className="hidden md:block">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {capitalizeFirst(getMonthName(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)))}
                </h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    // Si se deselecciona (date es undefined), ir al día actual
                    if (!date) {
                      const today = new Date()
                      setSelectedDate(today)
                      setCurrentMonth(today)
                    } else {
                      setSelectedDate(date)
                    }
                  }}
                  month={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
                locale={es}
                modifiers={useMemo(() => {
                  const clase: Date[] = []
                  const examen: Date[] = []
                  const evento: Date[] = []
                  const comedor: Date[] = []
                  backendEvents.forEach((e) => {
                    const key = formatIsoToDdMmYyyy(e.date)
                    const parts = key.split('/')
                    if (parts.length !== 3) return
                    const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
                    const t = mapBackendType(e.type, e.id, e.title)
                    // Respect active filters: only add modifiers for visible event types
                    if (!isEventVisible({ type: t })) return
                    if (t === 'clase') clase.push(d)
                    if (t === 'examen') examen.push(d)
                    if (t === 'evento') evento.push(d)
                    if (t === 'comedor') comedor.push(d)
                  })
                  return { clase, examen, evento, comedor }
                }, [backendEvents, filters])}
                modifiersClassNames={useMemo(() => ({
                  clase: 'cc-clase',
                  examen: 'cc-examen',
                  evento: 'cc-evento',
                  comedor: 'cc-comedor'
                }), [])}
                className="w-full [&_.rdp-nav]:hidden [&_.rdp-caption_button]:hidden"
                eventsByDay={useMemo(() => {
                  const map: Record<string, any> = {}
                  console.log('📅 Building eventsByDay map (second calendar) - backendEvents:', backendEvents.length)
                  
                  backendEvents.forEach((e) => {
                    const key = formatIsoToDdMmYyyy(e.date)
                    const mappedType = mapBackendType(e.type, e.id, e.title)
                    if (!isEventVisible({ type: mappedType })) return
                    map[key] = map[key] || {}
                    map[key][mappedType] = true
                  })

                  console.log('📅 eventsByDay map construido (second calendar):', Object.keys(map).length, 'días con eventos', map)
                  return map
                }, [currentMonth, filters, backendEvents])}
              />
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Eventos del {selectedLabel}</h2>

            <div className="space-y-4">
              {eventsOfSelected.length === 0 && (
                <p className="text-sm text-gray-500">No hay eventos para esta fecha.</p>
              )}
              {eventsOfSelected.map((event) => (
                <div key={event.id} className={`p-3 md:p-4 rounded-lg border ${event.color} relative`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{event.title}</h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>
                            {event.date} • {event.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          <span>
                            {event.location} • {event.section}
                          </span>
                        </div>
                      </div>
                      { (event as any).description ? <p className="text-xs md:text-sm text-gray-700 mb-3">{(event as any).description}</p> : null }
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="md:ml-4 bg-transparent w-full md:w-auto text-xs md:text-sm"
                      onClick={() => handleViewMore(event)}
                    >
                      VER MAS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Upcoming Events Sidebar - Desktop Only */}
        <div className="hidden lg:block space-y-4 md:space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Filtros</h3>

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

            {/* Removed 'Inscripto' and 'Participación obligatoria' filters per request */}

            {/* Botones removidos: los filtros aplican automáticamente al seleccionar */}
          </div>

          {/* Upcoming Events (dinámicos con base al día actual) - Desktop Only */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Próximos eventos</h3>

            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500">No hay eventos hoy</p>
              ) : (
                upcoming.map((event) => (
                  <div key={event.id} className={`p-3 border-l-4 ${event.color} bg-gray-50 rounded-r-lg`}>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{event.time}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Upcoming Events - Mobile: Below Events */}
        <div className="lg:hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Próximos eventos</h3>

            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500">No hay eventos hoy</p>
              ) : (
                upcoming.map((event) => (
                  <div key={event.id} className={`p-2.5 border-l-4 ${event.color} bg-gray-50 rounded-r-lg`}>
                    <h4 className="font-medium text-gray-900 text-xs mb-1">{event.title}</h4>
                    <p className="text-xs text-gray-600 mb-0.5">{event.time}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
