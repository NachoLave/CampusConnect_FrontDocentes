import { WalletInfo, Transaction, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import walletData from '@/lib/data/wallet.json'
import { GraduationCap, DollarSign, UtensilsCrossed } from 'lucide-react'
import { postmanProxy } from '@/lib/utils/postmanProxy'

// Interfaz para las transacciones del historial del backend
export interface WalletHistoryItem {
  nombre: string
  tipo: 'EGRESO' | 'INGRESO'
  fecha: string
  monto: number
}

// Mapeo de iconos para los datos mock
const iconMap = {
  'GraduationCap': GraduationCap,
  'DollarSign': DollarSign,
  'UtensilsCrossed': UtensilsCrossed
}

export class WalletService {
  // Variable para almacenar el balance actualizado manualmente
  private static currentBalance: number | null = null

  // Método para actualizar el balance manualmente (desde Postman)
  static updateBalanceFromPostman(newBalance: number) {
    this.currentBalance = newBalance
    console.log(`💰 Balance actualizado desde Postman: $${newBalance}`)
  }
  // Obtener información de la billetera
  static async getWalletInfo(): Promise<ApiResponse<WalletInfo>> {
    try {
      // Obtener balance real del backend
      const balanceResponse = await this.getBalance()

      if (balanceResponse.success && balanceResponse.data !== null && balanceResponse.data !== undefined) {
        // Combinar balance real con información mock para el resto
        const walletInfo: WalletInfo = {
          ...walletData.walletInfo,
          balance: balanceResponse.data // Usar el balance real del backend
        }

        return {
          data: walletInfo,
          success: true,
          message: 'Información de billetera obtenida correctamente desde el backend'
        }
      } else {
        // No usar datos mock - devolver error real
        return {
          data: null as any,
          success: false,
          error: balanceResponse.error || 'No se pudo obtener el balance del backend',
          message: 'No se pudo obtener la información de la billetera'
        }
      }
    } catch (error) {
      console.error('Error obteniendo información de billetera real:', error)
      // Retornar error para que el usuario sepa que hay un problema
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'No se pudo obtener la información de la billetera'
      }
    }
  }

  // Obtener saldo actual
  static async getBalance(): Promise<ApiResponse<number>> {
    try {
      // Usar el proxy de Postman para obtener el balance real
      const balance = await postmanProxy.getBalance()
      
      return {
        data: balance,
        success: true,
        message: 'Saldo obtenido desde el backend'
      }
    } catch (error) {
      console.error('Error obteniendo saldo real:', error)
      
      // No usar datos mock como fallback - devolver error real
      return {
        data: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener el saldo del backend',
        message: 'No se pudo obtener el saldo del backend'
      }
    }
  }

  // Obtener transacciones
  static async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Convertir los datos JSON a objetos Transaction con iconos
      const transactions = walletData.transactions.map(transaction => ({
        ...transaction,
        icon: iconMap[transaction.iconType as keyof typeof iconMap]
      })) as Transaction[]

      return {
        data: transactions,
        success: true,
        message: 'Transacciones obtenidas correctamente'
      }
    }

    return apiClient.get<Transaction[]>(API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS)
  }

  // Obtener transacciones con paginación
  static async getTransactionsPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    transactions: Transaction[]
    total: number
    page: number
    totalPages: number
  }>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const allTransactions = walletData.transactions.map(transaction => ({
        ...transaction,
        icon: iconMap[transaction.iconType as keyof typeof iconMap]
      })) as Transaction[]

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const transactions = allTransactions.slice(startIndex, endIndex)
      const total = allTransactions.length
      const totalPages = Math.ceil(total / limit)

      return {
        data: {
          transactions,
          total,
          page,
          totalPages
        },
        success: true,
        message: 'Transacciones paginadas obtenidas correctamente'
      }
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS}?page=${page}&limit=${limit}`
    return apiClient.get<{
      transactions: Transaction[]
      total: number
      page: number
      totalPages: number
    }>(endpoint)
  }

  // Cargar saldo (para futuras funcionalidades)
  static async loadBalance(amount: number, paymentMethod: string): Promise<ApiResponse<{
    newBalance: number
    transactionId: string
  }>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simular proceso de pago
      
      const newBalance = walletData.walletInfo.balance + amount
      const transactionId = `TXN-${Date.now()}`

      return {
        data: {
          newBalance,
          transactionId
        },
        success: true,
        message: 'Saldo cargado correctamente'
      }
    }

    return apiClient.post<{
      newBalance: number
      transactionId: string
    }>(API_CONFIG.ENDPOINTS.WALLET_BALANCE, { amount, paymentMethod })
  }

  // Realizar pago (para futuras funcionalidades)
  static async makePayment(amount: number, description: string, category: string): Promise<ApiResponse<{
    newBalance: number
    transactionId: string
  }>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newBalance = walletData.walletInfo.balance - amount
      const transactionId = `PAY-${Date.now()}`

      if (newBalance < 0) {
        return {
          data: null as any,
          success: false,
          error: 'Saldo insuficiente'
        }
      }

      return {
        data: {
          newBalance,
          transactionId
        },
        success: true,
        message: 'Pago realizado correctamente'
      }
    }

    return apiClient.post<{
      newBalance: number
      transactionId: string
    }>(`${API_CONFIG.ENDPOINTS.WALLET}/payment`, { amount, description, category })
  }

  // Obtener historial de wallet del año completo
  static async getWalletHistory(year: number = new Date().getFullYear()): Promise<ApiResponse<WalletHistoryItem[]>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      
      const fromDate = `${year}-01-01`
      const toDate = `${year}-12-31`
      const endpoint = `${API_CONFIG.ENDPOINTS.WALLET_HISTORY}?from=${fromDate}&to=${toDate}`
      
      const resp = await apiClient.get<WalletHistoryItem[]>(endpoint)
      if (!resp || !resp.success) {
        return { data: [] as WalletHistoryItem[], success: false, error: resp?.error || 'Error obteniendo historial' }
      }
      
      // Ordenar del más reciente al más antiguo (por fecha descendente)
      const sorted = Array.isArray(resp.data) 
        ? [...resp.data].sort((a, b) => {
            const dateA = new Date(a.fecha).getTime()
            const dateB = new Date(b.fecha).getTime()
            return dateB - dateA // Más reciente primero
          })
        : []
      
      return { data: sorted, success: true, message: 'Historial obtenido correctamente' }
    } catch (error) {
      return { data: [] as WalletHistoryItem[], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Obtener historial de wallet del mes actual (para gráfico)
  static async getWalletHistoryCurrentMonth(): Promise<ApiResponse<WalletHistoryItem[]>> {
    try {
      try { apiClient.setMockHeaders(APP_CONFIG.MOCK_TEACHER_ID, APP_CONFIG.MOCK_TEACHER_ROLES) } catch {}
      
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const fromDate = `${year}-${month}-01`
      
      // Obtener último día del mes
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
      const toDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      const endpoint = `${API_CONFIG.ENDPOINTS.WALLET_HISTORY}?from=${fromDate}&to=${toDate}`
      
      const resp = await apiClient.get<WalletHistoryItem[]>(endpoint)
      if (!resp || !resp.success) {
        return { data: [] as WalletHistoryItem[], success: false, error: resp?.error || 'Error obteniendo historial del mes' }
      }
      
      return { data: Array.isArray(resp.data) ? resp.data : [], success: true, message: 'Historial del mes obtenido correctamente' }
    } catch (error) {
      return { data: [] as WalletHistoryItem[], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Acreditar saldo usando tarjeta de crédito
  static async creditBalance(amount: number, teacherId: number = 1010): Promise<ApiResponse<{
    newBalance: number
    transactionId: string
  }>> {
    try {
      // Validar que el monto sea mayor a 0
      if (amount <= 0) {
        return {
          data: null as any,
          success: false,
          error: 'El monto debe ser mayor a 0'
        }
      }

      console.log('💰 Intentando acreditar saldo:', { amount, teacherId })

      // Usar los mismos headers que postmanProxy para autenticación mock
      const headers = {
        'X-Teacher-Id': APP_CONFIG.MOCK_TEACHER_ID,
        'X-Teacher-Roles': APP_CONFIG.MOCK_TEACHER_ROLES,
        'Accept': '*/*',
        'User-Agent': 'PostmanRuntime/7.49.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json'
      }

      console.log('🔑 Headers de autenticación:', headers)

      // Usar fetch directamente con los mismos headers que postmanProxy
      const response = await fetch('https://modulodocentefinal-production.up.railway.app/teachers/me/account/balance', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          id: teacherId,
          amount: amount
        })
      })

      console.log('📡 Status de respuesta:', response.status)
      console.log('📡 Headers de respuesta:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error del servidor:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📡 Datos de respuesta:', data)

      return {
        data: {
          newBalance: data.balance || amount,
          transactionId: `CREDIT-${Date.now()}`
        },
        success: true,
        message: 'Saldo acreditado correctamente'
      }
    } catch (error) {
      console.error('❌ Error acreditando saldo:', error)
      return {
        data: null as any,
        success: false,
        error: `Error al acreditar saldo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }
  }
}
