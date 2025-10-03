"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Search, X, Filter, ChevronDown } from "lucide-react"
import { DatePicker } from "@/components/ui/date-range-picker"

interface StorePurchase {
  id: string
  fecha: string
  item: string
  codigo: string
  cantidad: number
  precioUnitario: string
  total: string
  sede: string
}

const yearNow = new Date().getFullYear()
const mockPurchases: StorePurchase[] = [
  {
    id: "1",
    fecha: `05/09/${yearNow}`,
    item: "Escritorio de oficina",
    codigo: "#PRD-2023-001",
    cantidad: 2,
    precioUnitario: "$120.000",
    total: "$240.000",
    sede: "Monserrat",
  },
  {
    id: "2",
    fecha: `12/09/${yearNow}`,
    item: "Lapicera",
    codigo: "#PRD-2023-122",
    cantidad: 12,
    precioUnitario: "$1.000",
    total: "$12.000",
    sede: "Monserrat",
  },
  {
    id: "3",
    fecha: `18/09/${yearNow}`,
    item: "Cuaderno",
    codigo: "#PRD-2023-400",
    cantidad: 2,
    precioUnitario: "$4.000",
    total: "$8.000",
    sede: "Monserrat",
  },
  {
    id: "4",
    fecha: `23/09/${yearNow}`,
    item: "Marcadores",
    codigo: "#PRD-2023-450",
    cantidad: 5,
    precioUnitario: "$2.500",
    total: "$12.500",
    sede: "Belgrano",
  },
]

export default function TiendaPage() {
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [searchItem, setSearchItem] = useState("")
  const [sedes, setSedes] = useState<string[]>([])
  const [showSedeFilter, setShowSedeFilter] = useState(false)

  // Cerrar filtros al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      const sedeButton = document.querySelector('[aria-label="Filtrar por sede"]')
      const sedeDropdown = sedeButton?.nextElementSibling
      if (showSedeFilter && sedeButton && sedeDropdown) {
        if (!sedeButton.contains(target) && !sedeDropdown.contains(target)) {
          setShowSedeFilter(false)
        }
      }
    }

    if (showSedeFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSedeFilter])

  const convertDateForComparison = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter((purchase) => {
      const purchaseDate = convertDateForComparison(purchase.fecha)

      // Date filtering - Desde (mayor o igual)
      if (fromDate) {
        const fromDateStr = fromDate.toISOString().split('T')[0]
        if (purchaseDate < fromDateStr) {
          return false
        }
      }

      // Date filtering - Hasta (menor o igual)
      if (toDate) {
        const toDateStr = toDate.toISOString().split('T')[0]
        if (purchaseDate > toDateStr) {
          return false
        }
      }

      // Item search filtering
      if (searchItem) {
        const searchTerm = searchItem.toLowerCase()
        const itemMatch = purchase.item.toLowerCase().includes(searchTerm)
        const codeMatch = purchase.codigo.toLowerCase().includes(searchTerm)
        if (!itemMatch && !codeMatch) return false
      }

      // Sede filtering
      if (sedes.length > 0) {
        const matchesSede = sedes.some(sede => 
          purchase.sede.toLowerCase() === sede.toLowerCase()
        )
        if (!matchesSede) return false
      }

      return true
    })
  }, [fromDate, toDate, searchItem, sedes])

  const toggleSede = (sede: string) => {
    setSedes(prev => 
      prev.includes(sede) ? prev.filter(s => s !== sede) : [...prev, sede]
    )
  }

  const clearFilters = () => {
    setFromDate(null)
    setToDate(null)
    setSearchItem("")
    setSedes([])
    setShowSedeFilter(false)
  }

  const hasActiveFilters = fromDate !== null || toDate !== null || searchItem || sedes.length > 0
  
  const formatDateForTag = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
          <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Visitar Tienda</span>
          <span className="sm:hidden">Tienda</span>
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

          {/* Búsqueda y filtro de sede */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Ítem</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nombre, código..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filtro Sede */}
            <div className="relative flex-shrink-0 sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sede</label>
              <button
                onClick={() => setShowSedeFilter(!showSedeFilter)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto min-w-[160px]"
                aria-label="Filtrar por sede"
                aria-expanded={showSedeFilter}
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">
                  {sedes.length === 0 ? "Todas" : `${sedes.length} seleccionada${sedes.length > 1 ? "s" : ""}`}
                </span>
                {sedes.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {sedes.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </button>
              {showSedeFilter && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Sede</label>
                      <div className="flex items-center gap-2">
                        {sedes.length > 0 && (
                          <button
                            onClick={() => {
                              setSedes([])
                              setShowSedeFilter(false)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            aria-label="Limpiar filtros"
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
                      {["Monserrat", "Belgrano"].map((sede) => (
                        <label key={sede} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sedes.includes(sede)}
                            onChange={() => toggleSede(sede)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{sede}</span>
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
            {searchItem && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Búsqueda: {searchItem}
                <button
                  onClick={() => setSearchItem("")}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label="Remover búsqueda"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sedes.map((sede) => (
              <span key={sede} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {sede}
                <button
                  onClick={() => toggleSede(sede)}
                  className="rounded-full p-0.5 hover:opacity-80"
                  aria-label={`Remover filtro ${sede}`}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ítem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sede</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{purchase.cantidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.precioUnitario}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.sede}</td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron compras que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
