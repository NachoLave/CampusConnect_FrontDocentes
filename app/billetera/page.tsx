"use client"

import { useState } from "react"
import { Eye, EyeOff, RefreshCw, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GraduationCap, DollarSign, UtensilsCrossed } from "lucide-react"

export default function BilleteraPage() {
  const [showBalance, setShowBalance] = useState(true)

  const transactions = [
    {
      id: 1,
      type: "expense",
      description: "Pago de matrícula",
      date: "08/08/2023",
      time: "14:30",
      amount: -3500.0,
      icon: GraduationCap,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      id: 2,
      type: "income",
      description: "Depósito beca",
      date: "05/08/2023",
      time: "09:15",
      amount: 5000.0,
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      id: 3,
      type: "expense",
      description: "Cafetería universitaria",
      date: "01/08/2023",
      time: "13:22",
      amount: -250.0,
      icon: UtensilsCrossed,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
    },
  ]

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saldo de cuenta</h1>
        <p className="text-gray-600">Visualización de tu saldo actual y movimientos recientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Saldo actual</h2>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-gray-100 rounded">
                  {showBalance ? (
                    <Eye className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizado: 10/08/2023
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{showBalance ? "$8.235,50" : "••••••"}</div>
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Movimientos recientes</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todos los movimientos
              </button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${transaction.iconBg}`}>
                      <transaction.icon className={`h-5 w-5 ${transaction.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de cuenta</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de cuenta</span>
                <span className="font-medium text-gray-900">Docente</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Número de cuenta</span>
                <span className="font-medium text-gray-900">DOC-11223344</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activa
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
            <Link href="/billetera/cargar-saldo">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Cargar saldo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Los saldos se sincronizan automáticamente con el sistema de la universidad
        </p>
      </div>
    </div>
  )
}
