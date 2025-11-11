"use client"

import { useEffect, useState, useMemo } from "react"
import { Eye, EyeOff, RefreshCw, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useBalance } from "@/lib/hooks/useWallet"
import { InlineBalanceSkeleton, Skeleton, TextSkeleton } from "@/components/ui/loaders"
import { WalletService, WalletHistoryItem } from "@/lib/api/services/wallet"
import { TeacherService } from "@/lib/api/services/teacher"
import { GraduationCap, DollarSign, UtensilsCrossed, BookOpen } from "lucide-react"

// Función para obtener icono según el nombre de la transacción
const getIconForTransaction = (nombre: string) => {
  const lower = nombre.toLowerCase()
  if (lower.includes("matrícula") || lower.includes("matricula") || lower.includes("buzo")) return GraduationCap
  if (lower.includes("menu") || lower.includes("cafeter") || lower.includes("comida")) return UtensilsCrossed
  if (lower.includes("librer") || lower.includes("papel") || lower.includes("a4")) return BookOpen
  return DollarSign
}

// Función para categorizar transacciones
const categoryFor = (nombre: string) => {
  const d = nombre.toLowerCase()
  if (d.includes("matrícula") || d.includes("matricula") || d.includes("buzo")) return "Matrícula"
  if (d.includes("menu") || d.includes("cafeter") || d.includes("comida")) return "Cafetería"
  if (d.includes("librer") || d.includes("papel") || d.includes("a4")) return "Librería"
  return "Otros"
}

export default function BilleteraPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")
  
  // Estados para historial
  const [historyItems, setHistoryItems] = useState<WalletHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Estados para gráfico del año
  const [yearHistoryItems, setYearHistoryItems] = useState<WalletHistoryItem[]>([])
  const [loadingYearHistory, setLoadingYearHistory] = useState(true)
  
  // Estados para información de cuenta
  const [teacherLegajo, setTeacherLegajo] = useState<string | null>(null)
  const [loadingAccountInfo, setLoadingAccountInfo] = useState(true)
  
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

  // Cargar historial del año completo
  useEffect(() => {
    let mounted = true
    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        const year = new Date().getFullYear()
        const resp = await WalletService.getWalletHistory(year)
        if (mounted && resp.success && resp.data) {
          setHistoryItems(resp.data)
        }
      } catch (err) {
        console.error('Error loading wallet history:', err)
      } finally {
        if (mounted) setLoadingHistory(false)
      }
    }
    loadHistory()
    return () => { mounted = false }
  }, [])

  // Cargar historial del año 2025 para el gráfico
  useEffect(() => {
    let mounted = true
    const loadYearHistory = async () => {
      setLoadingYearHistory(true)
      try {
        const year = 2025
        const resp = await WalletService.getWalletHistory(year)
        if (mounted && resp.success && resp.data) {
          setYearHistoryItems(resp.data)
        }
      } catch (err) {
        console.error('Error loading year history:', err)
      } finally {
        if (mounted) setLoadingYearHistory(false)
      }
    }
    loadYearHistory()
    return () => { mounted = false }
  }, [])

  // Cargar información del docente para obtener el legajo
  useEffect(() => {
    let mounted = true
    const loadTeacherProfile = async () => {
      setLoadingAccountInfo(true)
      try {
        const resp = await TeacherService.getProfile()
        if (mounted && resp.success && resp.data && resp.data.legajo) {
          setTeacherLegajo(resp.data.legajo)
        }
      } catch (err) {
        console.error('Error loading teacher profile:', err)
      } finally {
        if (mounted) setLoadingAccountInfo(false)
      }
    }
    loadTeacherProfile()
    return () => { mounted = false }
  }, [])

  // Paginación del historial
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return historyItems.slice(startIndex, endIndex)
  }, [historyItems, currentPage])

  const totalPages = Math.ceil(historyItems.length / itemsPerPage)

  // Convertir items del historial al formato de transacciones para mostrar
  const displayTransactions = useMemo(() => {
    return paginatedItems.map((item, idx) => {
      const fecha = new Date(item.fecha)
      const dateStr = fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
      const timeStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      const Icon = getIconForTransaction(item.nombre)
      
      return {
        id: (currentPage - 1) * itemsPerPage + idx + 1,
        type: item.tipo === 'EGRESO' ? 'expense' : 'income',
        description: item.nombre,
        date: dateStr,
        time: timeStr,
        amount: item.monto,
        icon: Icon,
        iconColor: "text-slate-600",
        iconBg: "bg-slate-100",
      }
    })
  }, [paginatedItems, currentPage])

  // Calcular datos del gráfico del año 2025
  const { pieData, totalExpenses, totalIncomes } = useMemo(() => {
    const expenseTx = yearHistoryItems.filter(item => item.tipo === 'EGRESO')
    const incomeTx = yearHistoryItems.filter(item => item.tipo === 'INGRESO')
    
    const expenseByCategory = expenseTx.reduce<Record<string, number>>((acc, item) => {
      const cat = categoryFor(item.nombre)
      acc[cat] = (acc[cat] || 0) + Math.abs(item.monto)
      return acc
    }, {})

    const pieData = Object.entries(expenseByCategory).map(([label, value]) => ({ label, value }))
    const totalExpenses = pieData.reduce((s, d) => s + d.value, 0)
    const totalIncomes = incomeTx.reduce((s, item) => s + item.monto, 0)

    return { pieData, totalExpenses, totalIncomes }
  }, [yearHistoryItems])

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
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Historial de movimientos</h2>
            </div>

            {loadingHistory ? (
              <div className="space-y-3 md:space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100 last:border-b-0 gap-3">
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-20 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : displayTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay movimientos registrados
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {displayTransactions.map((transaction) => (
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

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages} • {historyItems.length} movimientos totales
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Información de cuenta</h3>
            {loadingAccountInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de cuenta</span>
                  <span className="font-medium text-gray-900">Docente</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de cuenta</span>
                  <span className="font-medium text-gray-900">
                    {teacherLegajo ? `DOC-${teacherLegajo}` : 'DOC-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activa
                  </span>
                </div>
              </div>
            )}
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

          {/* Gasto del año (gráfico dona) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Resumen del año 2025</h3>
            {loadingYearHistory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Skeleton className="w-24 h-24 rounded-full" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              </div>
            ) : totalExpenses === 0 ? (
              <div className="text-sm text-gray-500">Sin gastos registrados este año</div>
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
