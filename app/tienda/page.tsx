'use client'

import { useStoreOrders } from '@/lib/hooks'
import { useMemo, useState, useEffect } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-range-picker'
import { Calendar, Search, Filter, ShoppingBag, ExternalLink, X, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { authService } from '@/lib/api/services/auth'

export default function TiendaPage() {
  const { orders, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useStoreOrders()
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Obtener el token JWT para incluirlo en el enlace al mรณdulo de tienda
  const getStoreModuleUrl = () => {
    const token = authService.getToken()
    const baseUrl = 'https://uade-store.vercel.app/'
    return token ? `${baseUrl}?JWT=${token}` : baseUrl
  }

  const filteredOrders = useMemo(() => {
    const from = fromDate ? fromDate : null
    const to = toDate ? toDate : null
    const st = (searchTerm || '').toLowerCase()

    return (orders || []).filter(order => {
      // Date filter
      if (from) {
        const od = new Date(order.created_at)
        if (isNaN(od.getTime()) || od < from) return false
      }
      if (to) {
        const od = new Date(order.created_at)
        if (isNaN(od.getTime()) || od > to) return false
      }

      // Search filter (search in product names)
      if (st) {
        const hasMatchingProduct = order.Item_compra.some(item => {
          const productName = (item.Stock?.Articulo?.Titulo || '').toLowerCase()
          return productName.includes(st)
        })
        if (!hasMatchingProduct) return false
      }

      return true
    })
  }, [orders, fromDate, toDate, searchTerm])

  // Paginaciรณn
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [fromDate, toDate, searchTerm])

  // Funciรณn helper para formatear fechas de manera segura
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

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrderIds)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
      // Pre-cargar imรกgenes cuando se expande
      const order = orders?.find(o => o.id === orderId)
      if (order) {
        order.Item_compra.forEach(item => {
          const imagen = item.Stock?.Articulo?.Imagen?.[0]?.imagen
          if (imagen) {
            const img = new Image()
            img.src = imagen
          }
        })
      }
    }
    setExpandedOrderIds(newExpanded)
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
            Desde acรก podes ver el historial mรกs reciente de la tienda.
          </p>
        </div>
          <a
            href={getStoreModuleUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-white mt-4 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors"
          >
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Visitar Tienda</span>
          <span className="sm:hidden">Tienda</span>
        </a>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Buscar Producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Nombre del producto..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              {ordersLoading || orders.length === 0 ? null : (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="relative overflow-hidden h-12 bg-gray-100 rounded">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay รณrdenes</h3>
                      <p className="text-gray-600">Aรบn no has realizado ninguna compra en la tienda.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay รณrdenes</h3>
                      <p className="text-gray-600">No se encontraron รณrdenes que coincidan con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isExpanded = expandedOrderIds.has(order.id)
                  return (
                    <React.Fragment key={`order-${order.id}`}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            {order.Item_compra.map((item, idx) => (
                              <div key={`${order.id}-title-${idx}`}>
                                <span className="font-medium">{item.Stock?.Articulo?.Titulo}</span>
                                <span className="text-gray-500 ml-2">({item.cantidad})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          ${(order.total_compra || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center justify-center"
                            title={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 border-t">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 mb-3">Productos en esta compra:</h4>
                              {order.Item_compra.map((item, idx) => {
                                const articulo = item.Stock?.Articulo
                                const color = item.Stock?.Color
                                const imagen = articulo?.Imagen?.[0]?.imagen
                                return (
                                  <div key={`${order.id}-item-${idx}`} className="flex gap-4 p-3 bg-white rounded border border-gray-200">
                                    {imagen && (
                                      <img 
                                        src={imagen} 
                                        alt={articulo?.Titulo}
                                        className="h-16 w-16 object-cover rounded"
                                        loading="eager"
                                        decoding="async"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">{articulo?.Titulo}</h5>
                                      <p className="text-sm text-gray-600 mt-1">{articulo?.descripcion}</p>
                                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                        <span>Color: {color?.nombre}</span>
                                        <span>Cantidad: {item.cantidad}</span>
                                        <span className="font-medium text-gray-900">Subtotal: ${item.subtotal.toLocaleString('es-AR')}</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!ordersLoading && filteredOrders.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length} resultados
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