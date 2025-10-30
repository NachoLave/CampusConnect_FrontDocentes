"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, RefreshCw, CreditCard, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useBalance } from "@/lib/hooks/useWallet"
import { GraduationCap, DollarSign, UtensilsCrossed } from "lucide-react"
import { InlineBalanceSkeleton } from "@/components/ui/loaders"

export default function BilleteraPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")
  
  // Usar el hook de balance para obtener datos reales
  const { balance, isLoading, error, refetch } = useBalance()

  useEffect(() => {
    const now = new Date()
    const formatted = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
    setLastUpdated(formatted)
    const t = setInterval(() => {
      const d = new Date()
      setLastUpdated(d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }))
    }, 1000 * 60 * 60) // refrescar cada hora por si queda abierta
    return () => clearInterval(t)
  }, [])

  const currentYear = new Date().getFullYear()
  const transactions = [
    {
      id: 1,
      type: "expense",
      description: "Pago de matrícula",
      date: `05/09/${currentYear}`,
      time: "14:30",
      amount: -350000.0,
      icon: GraduationCap,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      id: 2,
      type: "income",
      description: "Depósito",
      date: `08/09/${currentYear}`,
      time: "09:15",
      amount: 400000.0,
      icon: DollarSign,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      id: 3,
      type: "expense",
      description: "Cafetería universitaria",
      date: `12/09/${currentYear}`,
      time: "13:22",
      amount: -25000.0,
      icon: UtensilsCrossed,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      id: 4,
      type: "expense",
      description: "Librería universitaria",
      date: `18/09/${currentYear}`,
      time: "11:05",
      amount: -10000.0,
      icon: BookOpen,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      id: 5,
      type: "income",
      description: "Depósito",
      date: `23/09/${currentYear}`,
      time: "16:40",
      amount: 50000.0,
      icon: DollarSign,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
  ]

  // ---- Helpers para gráfico de gasto mensual ----
  const parseDmy = (d: string) => {
    const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10))
    return new Date(yyyy, mm - 1, dd)
  }

  const monthNow = new Date().getMonth()
  const yearNow = new Date().getFullYear()
  const expenseTx = transactions.filter((t) => t.amount < 0 && (() => {
    const dt = parseDmy(t.date)
    return dt.getMonth() === monthNow && dt.getFullYear() === yearNow
  })())
  const incomeTx = transactions.filter((t) => t.amount > 0 && (() => {
    const dt = parseDmy(t.date)
    return dt.getMonth() === monthNow && dt.getFullYear() === yearNow
  })())

  const categoryFor = (desc: string) => {
    const d = desc.toLowerCase()
    if (d.includes("matrícula") || d.includes("matricula")) return "Matrícula"
    if (d.includes("cafeter")) return "Cafetería"
    if (d.includes("librer")) return "Librería"
    return "Otros"
  }

  const expenseByCategory = expenseTx.reduce<Record<string, number>>((acc, t) => {
    const cat = categoryFor(t.description)
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
    return acc
  }, {})

  const pieData = Object.entries(expenseByCategory).map(([label, value]) => ({ label, value }))
  const totalExpenses = pieData.reduce((s, d) => s + d.value, 0)
  const totalIncomes = incomeTx.reduce((s, t) => s + t.amount, 0)
  const colors = ["#334155", "#64748B", "#94A3B8", "#CBD5E1"] // tonos slate

  const computeArcs = () => {
    let cumulative = 0
    return pieData.map((d, idx) => {
      const fraction = totalExpenses > 0 ? d.value / totalExpenses : 0
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
      cumulative += fraction
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
      const r = 38
      const cx = 50
      const cy = 50
      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)
      const largeArc = fraction > 0.5 ? 1 : 0
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
      return { path, color: colors[idx % colors.length], label: d.label, value: d.value }
    })
  }

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`
  }

  const formatBalance = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return amount >= 0 ? `$${formatted}` : `-$${formatted}`
  }

  // Usar el balance real del hook en lugar de calcularlo
  const totalBalance = balance

  useEffect(() => {
    try {
      localStorage.setItem("wallet_balance", String(totalBalance))
    } catch {}
  }, [totalBalance])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Saldo de cuenta</h1>
        <p className="text-sm md:text-base text-gray-600">Visualización de tu saldo actual y movimientos recientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Current Balance Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Saldo actual</h2>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-gray-100 rounded">
                  {showBalance ? (
                    <Eye className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-500">
                <button 
                  onClick={refetch}
                  disabled={isLoading}
                  className="hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                Actualizado: {lastUpdated}
              </div>
            </div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900">
              {isLoading ? (
                <InlineBalanceSkeleton />
              ) : error ? (
                <span className="text-red-600">No se pudo obtener el saldo</span>
              ) : showBalance ? (
                formatBalance(totalBalance)
              ) : (
                "••••••"
              )}
            </div>
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Movimientos recientes</h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100 last:border-b-0 gap-3"
                >
                  <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                    <div className={`p-1.5 md:p-2 rounded-lg bg-slate-100 flex-shrink-0`}>
                      <transaction.icon className={`h-4 w-4 md:h-5 md:w-5 text-slate-600`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">{transaction.description}</p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm md:text-base flex-shrink-0 ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Información de cuenta</h3>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
            <Link href="/billetera/cargar-saldo">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Cargar saldo
              </Button>
            </Link>
          </div>

          {/* Gasto del mes (gráfico dona) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Resumen del mes</h3>
            {totalExpenses === 0 ? (
              <div className="text-sm text-gray-500">Sin gastos registrados este mes</div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28">
                  {computeArcs().map((arc, i) => (
                    <path key={i} d={arc.path} fill={arc.color} />
                  ))}
                  {/* agujero para dona */}
                  <circle cx="50" cy="50" r="24" fill="#fff" />
                </svg>
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 gap-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="text-gray-700">{d.label}</span>
                        </div>
                        <span className="font-medium text-gray-900">${Math.round(d.value).toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-600">Total depositado</div>
                      <div className="text-slate-900 font-semibold">${Math.round(totalIncomes).toLocaleString("es-AR")}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-slate-600">Total gastado</div>
                      <div className="text-slate-900 font-semibold">${Math.round(totalExpenses).toLocaleString("es-AR")}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
