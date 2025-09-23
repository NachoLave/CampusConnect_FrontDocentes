"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, ShoppingBag, RotateCcw, Search } from "lucide-react"

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

const mockPurchases: StorePurchase[] = [
  {
    id: "1",
    fecha: "15/08/2023",
    item: "Escritorio de oficina",
    codigo: "#PRD-2023-001",
    cantidad: 2,
    precioUnitario: "$120.000",
    total: "$240.000",
    sede: "Monserrat",
  },
  {
    id: "2",
    fecha: "15/10/2023",
    item: "Lapicera",
    codigo: "#PRD-2023-122",
    cantidad: 12,
    precioUnitario: "$1.000",
    total: "$12.000",
    sede: "Monserrat",
  },
  {
    id: "3",
    fecha: "17/11/2023",
    item: "Cuaderno",
    codigo: "#PRD-2023-400",
    cantidad: 2,
    precioUnitario: "$4.000",
    total: "$8.000",
    sede: "Monserrat",
  },
  {
    id: "4",
    fecha: "20/11/2023",
    item: "Marcadores",
    codigo: "#PRD-2023-450",
    cantidad: 5,
    precioUnitario: "$2.500",
    total: "$12.500",
    sede: "Belgrano",
  },
]

export default function TiendaPage() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [searchItem, setSearchItem] = useState("")
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    searchItem: "",
  })

  const convertDateForComparison = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter((purchase) => {
      // Date filtering
      if (appliedFilters.fromDate) {
        const purchaseDate = convertDateForComparison(purchase.fecha)
        if (purchaseDate < appliedFilters.fromDate) return false
      }

      if (appliedFilters.toDate) {
        const purchaseDate = convertDateForComparison(purchase.fecha)
        if (purchaseDate > appliedFilters.toDate) return false
      }

      // Item search filtering
      if (appliedFilters.searchItem) {
        const searchTerm = appliedFilters.searchItem.toLowerCase()
        const itemMatch = purchase.item.toLowerCase().includes(searchTerm)
        const codeMatch = purchase.codigo.toLowerCase().includes(searchTerm)
        if (!itemMatch && !codeMatch) return false
      }

      return true
    })
  }, [appliedFilters])

  const applyFilters = () => {
    setAppliedFilters({
      fromDate,
      toDate,
      searchItem,
    })
  }

  const resetFilters = () => {
    setFromDate("")
    setToDate("")
    setSearchItem("")
    setAppliedFilters({
      fromDate: "",
      toDate: "",
      searchItem: "",
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Historial de Tienda</h1>
          <p className="text-gray-600">
            Desde acá podes ver el historial más reciente de la tienda.
            <br />
            Para ver mas información visitá el{" "}
            <span className="text-blue-600 underline cursor-pointer">sitio oficial</span>
          </p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white mt-4">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Visitar Tienda
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_200px] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <div className="relative">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="pl-10" />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <div className="relative">
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="pl-10" />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Ítem</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Nombre, código o descripción"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" onClick={resetFilters} className="w-full bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar filtros
            </Button>
            <Button className="bg-slate-800 hover:bg-slate-700 text-white w-full" onClick={applyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{purchase.item}</div>
                      <div className="text-sm text-gray-500">{purchase.codigo}</div>
                    </div>
                  </td>
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
