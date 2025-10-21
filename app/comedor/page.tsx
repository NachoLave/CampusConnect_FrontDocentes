"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, Filter, ChevronDown } from "lucide-react"
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

  // Debug logs
  console.log('🍽️ ComedorPage - Estado:', { 
    reservations: reservations.length, 
    isLoading, 
    error,
    reservationsData: reservations 
  })

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
    console.log('🔍 Filtrado - Reservas originales:', reservations.length)
    console.log('🔍 Filtros aplicados:', { fromDate, toDate, tipos, estados })
    
    const filtered = reservations.filter((reservation) => {
      const reservationDate = convertDateForComparison(formatDate(reservation.date))
      console.log('🔍 Procesando reserva:', { 
        id: reservation.id, 
        date: reservation.date, 
        formattedDate: reservationDate,
        type: reservation.type,
        status: reservation.status 
      })

      // Date filtering - Desde (mayor o igual)
      if (fromDate) {
        const fromDateStr = fromDate.toISOString().split('T')[0]
        if (reservationDate < fromDateStr) {
          console.log('❌ Filtrado por fecha desde:', reservationDate, '<', fromDateStr)
          return false
        }
      }

      // Date filtering - Hasta (menor o igual)
      if (toDate) {
        const toDateStr = toDate.toISOString().split('T')[0]
        if (reservationDate > toDateStr) {
          console.log('❌ Filtrado por fecha hasta:', reservationDate, '>', toDateStr)
          return false
        }
      }

      // Type filtering
      if (tipos.length > 0) {
        const matchesTipo = tipos.some(tipo => 
          (reservation.type || '').toUpperCase() === tipo.toUpperCase()
        )
        if (!matchesTipo) {
          console.log('❌ Filtrado por tipo:', reservation.type, 'no coincide con', tipos)
          return false
        }
      }

      // Status filtering
      if (estados.length > 0) {
        const matchesEstado = estados.some(estado => 
          (reservation.status || '').toLowerCase() === estado.toLowerCase()
        )
        if (!matchesEstado) {
          console.log('❌ Filtrado por estado:', reservation.status, 'no coincide con', estados)
          return false
        }
      }

      console.log('✅ Reserva pasa todos los filtros')
      return true
    })
    
    console.log('🔍 Reservas filtradas:', filtered.length)
    return filtered
  }, [reservations, fromDate, toDate, tipos, estados])

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
        <Button className="bg-slate-800 hover:bg-slate-700 text-white mt-4 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Visitar Comedor</span>
          <span className="sm:hidden">Comedor</span>
        </Button>
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
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filtros de fecha */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <DatePicker
                selectedDate={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholder="Seleccionar fecha"
                maxDate={toDate}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <DatePicker
                selectedDate={toDate}
                onChange={(date) => setToDate(date)}
                placeholder="Seleccionar fecha"
                minDate={fromDate}
              />
            </div>
          </div>

          {/* Filtros con dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
            {/* Filtro Tipo */}
            <div className="relative flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <button
                onClick={() => setShowTipoFilter(!showTipoFilter)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto min-w-[160px]"
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

            {/* Filtro Estado */}
            <div className="relative flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <button
                onClick={() => setShowEstadoFilter(!showEstadoFilter)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto min-w-[160px]"
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

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
            {fromDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Desde: {formatDateForTag(fromDate)}
                <button
                  onClick={() => setFromDate(null)}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label="Remover filtro desde"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {toDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Hasta: {formatDateForTag(toDate)}
                <button
                  onClick={() => setToDate(null)}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label="Remover filtro hasta"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {tipos.map((tipo) => (
              <span key={tipo} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {tipo}
                <button
                  onClick={() => toggleTipo(tipo)}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label={`Remover filtro ${tipo}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {estados.map((estado) => (
              <span 
                key={estado}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                  estado === "Finalizado" 
                    ? "bg-green-100 text-green-800"
                    : estado === "Cancelado"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {estado}
                <button
                  onClick={() => toggleEstado(estado)}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label={`Remover filtro ${estado}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Cargando reservas...</span>
                    </div>
                  </td>
                </tr>
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
                    <div className="space-y-2">
                      <p>No hay reservas disponibles.</p>
                      <p className="text-sm">Las reservas aparecerán aquí una vez que hagas alguna.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <p>No se encontraron reservas que coincidan con los filtros aplicados.</p>
                      <p className="text-sm">Total de reservas: {reservations.length}</p>
                      <button 
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(reservation.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.timeRange || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.sede || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.total || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(reservation.status)}>{reservation.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
