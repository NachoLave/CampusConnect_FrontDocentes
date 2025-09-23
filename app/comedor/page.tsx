"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ExternalLink, RotateCcw } from "lucide-react"

interface DiningReservation {
  id: string
  fecha: string
  tipoReserva: string
  horario: string
  sede: string
  total: string
  estado: "Finalizado" | "Cancelado" | "Pendiente"
}

const mockReservations: DiningReservation[] = [
  {
    id: "1",
    fecha: "15/08/2023",
    tipoReserva: "ALMUERZO",
    horario: "13:00 - 14:00",
    sede: "Belgrano",
    total: "$10.000",
    estado: "Finalizado",
  },
  {
    id: "2",
    fecha: "14/08/2023",
    tipoReserva: "DESAYUNO",
    horario: "8:00 - 9:00",
    sede: "Belgrano",
    total: "-",
    estado: "Cancelado",
  },
  {
    id: "3",
    fecha: "13/08/2023",
    tipoReserva: "ALMUERZO",
    horario: "13:00 - 14:00",
    sede: "Centro",
    total: "$12.000",
    estado: "Pendiente",
  },
  {
    id: "4",
    fecha: "12/08/2023",
    tipoReserva: "CENA",
    horario: "20:00 - 21:00",
    sede: "Belgrano",
    total: "$15.000",
    estado: "Finalizado",
  },
]

export default function ComedorPage() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [tipo, setTipo] = useState("")
  const [estado, setEstado] = useState("")
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    tipo: "",
    estado: "",
  })

  const convertDateForComparison = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const filteredReservations = useMemo(() => {
    return mockReservations.filter((reservation) => {
      // Date filtering
      if (appliedFilters.fromDate) {
        const reservationDate = convertDateForComparison(reservation.fecha)
        if (reservationDate < appliedFilters.fromDate) return false
      }

      if (appliedFilters.toDate) {
        const reservationDate = convertDateForComparison(reservation.fecha)
        if (reservationDate > appliedFilters.toDate) return false
      }

      // Type filtering
      if (appliedFilters.tipo) {
        const filterTipo = appliedFilters.tipo.toUpperCase()
        if (!reservation.tipoReserva.toUpperCase().includes(filterTipo)) return false
      }

      // Status filtering
      if (appliedFilters.estado) {
        const filterEstado = appliedFilters.estado.toLowerCase()
        const reservationEstado = reservation.estado.toLowerCase()
        if (reservationEstado !== filterEstado) return false
      }

      return true
    })
  }, [appliedFilters])

  const applyFilters = () => {
    setAppliedFilters({
      fromDate,
      toDate,
      tipo,
      estado,
    })
  }

  const resetFilters = () => {
    setFromDate("")
    setToDate("")
    setTipo("")
    setEstado("")
    setAppliedFilters({
      fromDate: "",
      toDate: "",
      tipo: "",
      estado: "",
    })
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Historial de Comedor</h1>
          <p className="text-gray-600">
            Desde acá podes ver el historial más reciente del comedor.
            <br />
            Para ver mas información visitá el{" "}
            <span className="text-blue-600 underline cursor-pointer">sitio oficial</span>
          </p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white mt-4">
          <ExternalLink className="h-4 w-4 mr-2" />
          Visitar Comedor
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_200px] gap-4 items-end">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desayuno">Desayuno</SelectItem>
                <SelectItem value="almuerzo">Almuerzo</SelectItem>
                <SelectItem value="merienda">Merienda</SelectItem>
                <SelectItem value="cena">Cena</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de reserva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sede</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.tipoReserva}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.horario}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.sede}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusColor(reservation.estado)}>{reservation.estado}</span>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron reservas que coincidan con los filtros aplicados.
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
