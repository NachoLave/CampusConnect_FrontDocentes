"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, Filter, ChevronDown, ShoppingBag } from "lucide-react"
import { DatePicker } from "@/components/ui/date-range-picker"
import { useCanteenReservations } from '@/lib/hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return format(d, 'dd/MM/yyyy', { locale: es })
  } catch { return iso }
}

export default function ComedorPage() {
  const { reservations, isLoading, error, refetch } = useCanteenReservations()
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [tipos, setTipos] = useState<string[]>([])
  const [estados, setEstados] = useState<string[]>([])
  const [showTipoFilter, setShowTipoFilter] = useState(false)
  const [showEstadoFilter, setShowEstadoFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5


  // Cerrar filtros al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      const tipoButton = document.querySelector('[aria-label="Filtrar por tipo"]')
      const tipoDropdown = tipoButton?.nextElementSibling
      if (showTipoFilter && tipoButton && tipoDropdown) {
        if (!tipoButton.contains(target) && !tipoDropdown.contains(target)) {
          setShowTipoFilter(false)
        }
      }
      
      const estadoButton = document.querySelector('[aria-label="Filtrar por estado"]')
      const estadoDropdown = estadoButton?.nextElementSibling
      if (showEstadoFilter && estadoButton && estadoDropdown) {
        if (!estadoButton.contains(target) && !estadoDropdown.contains(target)) {
          setShowEstadoFilter(false)
        }
      }
    }

    if (showTipoFilter || showEstadoFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTipoFilter, showEstadoFilter])

  const convertDateForComparison = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const filteredReservations = useMemo(() => {
    return (reservations || []).filter((reservation: any) => {
      const reservationDate = convertDateForComparison(formatDate(reservation.date))

      // Date filtering - Desde (mayor o igual)
      if (fromDate) {
        const fromDateStr = fromDate.toISOString().split('T')[0]
        if (reservationDate < fromDateStr) return false
      }

      // Date filtering - Hasta (menor o igual)
      if (toDate) {
        const toDateStr = toDate.toISOString().split('T')[0]
        if (reservationDate > toDateStr) return false
      }

      // Type filtering
      if (tipos.length > 0) {
        const matchesTipo = tipos.some(tipo => 
          (reservation.type || '').toUpperCase() === tipo.toUpperCase()
        )
        if (!matchesTipo) return false
      }

      // Status filtering
      if (estados.length > 0) {
        const matchesEstado = estados.some(estado => 
          (reservation.status || '').toLowerCase() === estado.toLowerCase()
        )
        if (!matchesEstado) return false
      }

      return true
    })
  }, [reservations, fromDate, toDate, tipos, estados])

  // Paginación
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredReservations.slice(startIndex, endIndex)
  }, [filteredReservations, currentPage])

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [fromDate, toDate, tipos, estados])

  const toggleTipo = (tipo: string) => {
    setTipos(prev => 
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    )
  }

  const toggleEstado = (estado: string) => {
    setEstados(prev => 
      prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]
    )
  }

  const clearFilters = () => {
    setFromDate(null)
    setToDate(null)
    setTipos([])
    setEstados([])
    setShowTipoFilter(false)
    setShowEstadoFilter(false)
  }

  const hasActiveFilters = fromDate !== null || toDate !== null || tipos.length > 0 || estados.length > 0
  
  const formatDateForTag = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"
      case "Cancelado":
        return "text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium"
      case "Pendiente":
        return "text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium"
      default:
        return "text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium"
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Historial de Comedor</h1>
          <p className="text-sm md:text-base text-gray-600">
            Desde acá podes ver el historial más reciente del comedor.
            <br />
            Para ver más información visitá el{" "}
            <span className="text-blue-600 underline cursor-pointer">sitio oficial</span>
          </p>
        </div>
        <a
          href="https://proyecto-react-shadcn.vercel.app/login"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-white mt-4 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors"
        >
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Visitar Comedor</span>
          <span className="sm:hidden">Comedor</span>
        </a>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Desde</label>
            <DatePicker
              selectedDate={fromDate}
              onChange={(date) => setFromDate(date)}
              placeholder="Seleccionar fecha"
              maxDate={toDate}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Hasta</label>
            <DatePicker
              selectedDate={toDate}
              onChange={(date) => setToDate(date)}
              placeholder="Seleccionar fecha"
              minDate={fromDate}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <div className="relative">
              <button
                onClick={() => setShowTipoFilter(!showTipoFilter)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full"
                aria-label="Filtrar por tipo"
                aria-expanded={showTipoFilter}
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">
                  {tipos.length === 0 ? "Todos" : `${tipos.length} seleccionado${tipos.length > 1 ? "s" : ""}`}
                </span>
                {tipos.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {tipos.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </button>
              {showTipoFilter && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Tipo de Reserva</label>
                      <div className="flex items-center gap-2">
                        {tipos.length > 0 && (
                          <button
                            onClick={() => {
                              setTipos([])
                              setShowTipoFilter(false)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            aria-label="Limpiar filtros"
                          >
                            Limpiar
                          </button>
                        )}
                        <button
                          onClick={() => setShowTipoFilter(false)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Cerrar filtro"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {["Desayuno", "Almuerzo", "Merienda", "Cena"].map((tipo) => (
                        <label key={tipo} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tipos.includes(tipo)}
                            onChange={() => toggleTipo(tipo)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{tipo}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <div className="relative">
              <button
                onClick={() => setShowEstadoFilter(!showEstadoFilter)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full"
                aria-label="Filtrar por estado"
                aria-expanded={showEstadoFilter}
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">
                  {estados.length === 0 ? "Todos" : `${estados.length} seleccionado${estados.length > 1 ? "s" : ""}`}
                </span>
                {estados.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {estados.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </button>
              {showEstadoFilter && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Estado</label>
                      <div className="flex items-center gap-2">
                        {estados.length > 0 && (
                          <button
                            onClick={() => {
                              setEstados([])
                              setShowEstadoFilter(false)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            aria-label="Limpiar filtros"
                          >
                            Limpiar
                          </button>
                        )}
                        <button
                          onClick={() => setShowEstadoFilter(false)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Cerrar filtro"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {["Finalizado", "Cancelado", "Pendiente"].map((estado) => (
                        <label key={estado} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={estados.includes(estado)}
                            onChange={() => toggleEstado(estado)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{estado}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filters removed per request */}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de reserva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sede</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menú
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="relative overflow-hidden h-12 bg-gray-100 rounded">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    <div className="space-y-2">
                      <p>Error al cargar las reservas: {error}</p>
                      <button 
                        onClick={refetch}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length === 0 && reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
                      <p className="text-gray-600">Aún no hay reservas en el comedor.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reservas</h3>
                      <p className="text-gray-600">Ninguna reserva coincide con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(reservation.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.timeRange || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.sede || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {typeof reservation.total === 'number' 
                        ? `$${reservation.total.toLocaleString()}` 
                        : reservation.total || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(reservation.status)}>{reservation.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredReservations.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredReservations.length)} de {filteredReservations.length} resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "bg-slate-800 hover:bg-slate-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
