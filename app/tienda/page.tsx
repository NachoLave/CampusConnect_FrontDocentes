'use client'

import { useStoreOrders } from '@/lib/hooks'
import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-range-picker'
import { Calendar, Search, Filter, ShoppingBag, ExternalLink, X, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TiendaPage() {
  const { orders, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useStoreOrders()
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  // allow selecting multiple sedes like Comedor's Estado filter
  const [selectedSedes, setSelectedSedes] = useState<string[]>([])
  const [showSedeFilter, setShowSedeFilter] = useState(false)

  const deriveSede = (address?: string | null) => {
    if (!address) return 'Monserrat'
    const a = String(address).toLowerCase()
    if (a.includes('belgrano')) return 'Belgrano'
    if (a.includes('monserrat')) return 'Monserrat'
    // If contains building like B- or A- treat as Belgrano (heuristic)
    if (/\b[bB]-\d+/.test(address)) return 'Belgrano'
    return address
  }

  const rows = useMemo(() => {
    return (orders || []).flatMap(order => {
      const sede = deriveSede(order.deliveryAddress)
      return (order.items || []).map((item: any) => ({ order, item, sede }))
    })
  }, [orders])

  const availableSedes = useMemo(() => {
    const s = new Set<string>()
    for (const o of orders || []) {
      s.add(deriveSede(o.deliveryAddress))
    }
    return Array.from(s).sort()
  }, [orders])

  const filteredRows = useMemo(() => {
  const from = fromDate ? fromDate : null
  const to = toDate ? toDate : null
    const st = (searchTerm || '').toLowerCase()

    return rows.filter(({ order, item, sede }) => {
      // Date filter
      if (from) {
        const od = new Date(order.date)
        if (isNaN(od.getTime()) || od < from) return false
      }
      if (to) {
        const od = new Date(order.date)
        if (isNaN(od.getTime()) || od > to) return false
      }

    // Sede filter (multiple selection)
    if (selectedSedes.length > 0 && !selectedSedes.includes(sede)) return false

      // SearchTerm filter (item name or code)
      if (st) {
        const name = String(item.productName || '').toLowerCase()
        const code = String(item.productCode || '').toLowerCase()
        if (!name.includes(st) && !code.includes(st)) return false
      }

      return true
    })
  }, [rows, fromDate, toDate, searchTerm, selectedSedes])

  const toggleSede = (sede: string) => {
    setSelectedSedes(prev => prev.includes(sede) ? prev.filter(x => x !== sede) : [...prev, sede])
  }

  // Close the sede dropdown when clicking outside (mimics Comedor behavior)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const btn = document.querySelector('[aria-label="Filtrar por sede"]')
      const dropdown = btn?.nextElementSibling
      if (showSedeFilter && btn && dropdown) {
        if (!btn.contains(target) && !dropdown.contains(target)) {
          setShowSedeFilter(false)
        }
      }
    }
    if (showSedeFilter) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [showSedeFilter])

  // Función helper para formatear fechas de manera segura
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString || 'Fecha no disponible'
      }
      return format(date, 'dd/MM/yyyy', { locale: es })
    } catch (error) {
      return dateString || 'Fecha no disponible'
    }
  }

  if (ordersError) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Historial de Tienda</h1>
          <p className="text-red-600 mb-4">Error al cargar los datos: {ordersError}</p>
          <Button onClick={() => { refetchOrders() }} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Historial de Tienda</h1>
          <p className="text-sm md:text-base text-gray-600">
            Desde acá podes ver el historial más reciente de la tienda.
            <br />
            Para ver más información visitá el{" "}
            <span className="text-blue-600 underline cursor-pointer">sitio oficial</span>
          </p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white mt-4 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Visitar Tienda</span>
          <span className="sm:hidden">Tienda</span>
        </Button>
      </div>

  {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        
    <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Desde</label>
                <DatePicker
                  selectedDate={fromDate}
                  onChange={(d) => setFromDate(d)}
                  placeholder="Seleccionar fecha"
                  maxDate={toDate || undefined}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Hasta</label>
                <DatePicker
                  selectedDate={toDate}
                  onChange={(d) => setToDate(d)}
                  placeholder="Seleccionar fecha"
                  minDate={fromDate || undefined}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Buscar Ítem</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nombre, código..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sede</label>
                <div className="relative">
                  <button
                    onClick={() => setShowSedeFilter(!showSedeFilter)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full"
                    aria-label="Filtrar por sede"
                    aria-expanded={showSedeFilter}
                  >
                    <Filter className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">
                      {selectedSedes.length === 0 ? 'Todas' : `${selectedSedes.length} seleccionado${selectedSedes.length > 1 ? 's' : ''}`}
                    </span>
                    {selectedSedes.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">{selectedSedes.length}</span>
                    )}
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </button>
                  {showSedeFilter && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Sedes</label>
                          <div className="flex items-center gap-2">
                            {selectedSedes.length > 0 && (
                              <button
                                onClick={() => { setSelectedSedes([]); setShowSedeFilter(false) }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                aria-label="Limpiar sedes"
                              >
                                Limpiar
                              </button>
                            )}
                            <button
                              onClick={() => setShowSedeFilter(false)}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label="Cerrar filtro"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {availableSedes.map((s) => (
                            <label key={s} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSedes.includes(s)}
                                onChange={() => toggleSede(s)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{s}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>


      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {ordersLoading || orders.length === 0 ? null : (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ítem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersLoading ? (
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
                      <p className="text-gray-600">Aún no has realizado ninguna compra en la tienda.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
                      <p className="text-gray-600">No se encontraron órdenes que coincidan con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ order, item, sede }, idx) => (
                  <tr key={`${order.id}-${item.id}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.productName || 'Producto sin nombre'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(item.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sede || order.deliveryAddress || 'Monserrat'}
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