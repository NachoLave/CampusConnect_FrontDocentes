'use client'

import { useStoreOrders } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Search, Filter, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TiendaPage() {
  const { orders, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useStoreOrders()

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
    <div className="max-w-7xl mx-auto px-4 bg-gray-50 min-h-screen">
      <div className="mb-6 md:mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Historial de Tienda</h1>
            <p className="text-gray-600">
              Desde acá podes ver el historial más reciente de la tienda. Para ver más información visitá el{' '}
              <a href="#" className="text-blue-600 hover:underline">sitio oficial</a>
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Visitar Tienda
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Seleccionar fecha" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Seleccionar fecha" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Buscar Ítem</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nombre, código..." 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sede</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Todas</option>
                    <option>Monserrat</option>
                    <option>Belgrano</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de historial */}
        <Card>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
                <p className="text-gray-600">Aún no has realizado ninguna compra en la tienda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FECHA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ÍTEM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CANTIDAD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PRECIO UNITARIO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TOTAL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SEDE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.flatMap(order => 
                      order.items.map((item, index) => (
                        <tr key={`${order.id}-${item.id}`} className="hover:bg-gray-50">
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
                            ${(item.totalPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.deliveryAddress || 'Monserrat'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}