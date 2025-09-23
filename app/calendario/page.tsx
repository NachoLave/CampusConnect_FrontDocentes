"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale"

// Mock data for events
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
]

const upcomingEvents = [
  {
    id: 1,
    type: "clase",
    title: "Clase: Matemáticas",
    time: "Hoy • 10:00 - 11:30",
    location: "Aula 201",
    color: "border-l-blue-500",
  },
  {
    id: 2,
    type: "clase",
    title: "Clase: Literatura",
    time: "Hoy • 9:00 - 10:30",
    location: "Aula 302",
    color: "border-l-purple-500",
  },
  {
    id: 3,
    type: "examen",
    title: "Examen: Física",
    time: "Hoy • 12:00 - 13:30",
    location: "Aula 105",
    color: "border-l-orange-500",
  },
]

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
              />
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
                locale={es}
                className="w-full [&_.rdp-nav]:hidden [&_.rdp-caption_button]:hidden"
              />
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventos del 14/02/2025</h2>

            <div className="space-y-4">
              {mockEvents.map((event) => (
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

            <Button className="w-full bg-slate-800 hover:bg-slate-700">Aplicar filtros</Button>

            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
            >
              Restaurar filtros
            </Button>

            <Button
              onClick={goToToday}
              variant="outline"
              className="w-full mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
            >
              Ir a hoy
            </Button>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos eventos</h3>

            <div className="space-y-4">
              {upcomingEvents.map((event) => (
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
