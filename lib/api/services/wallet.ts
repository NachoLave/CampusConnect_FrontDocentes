import { WalletInfo, Transaction, ApiResponse, ExternalWallet, ExternalTransfer } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import walletData from '@/lib/data/wallet.json'
import { GraduationCap, DollarSign, UtensilsCrossed } from 'lucide-react'
import { authService } from './auth'

// URL base de la API externa de billetera
const WALLET_API_URL = 'https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api'

// Interfaz para las transacciones del historial del backend
export interface WalletHistoryItem {
  nombre: string
  tipo: 'EGRESO' | 'INGRESO'
  fecha: string
  monto: number
  currency?: string
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
  }
  // Obtener información de la billetera desde la API externa
  static async getWalletInfo(): Promise<ApiResponse<WalletInfo>> {
    try {
      const token = authService.getToken()
      if (!token) {
        return {
          data: null as any,
          success: false,
          error: 'No hay token de autenticación',
          message: 'No se pudo obtener la información de la billetera'
        }
      }

      const response = await fetch(`${WALLET_API_URL}/wallets/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          data: null as any,
          success: false,
          error: `Error del servidor: ${response.status}`,
          message: 'No se pudo obtener la información de la billetera'
        }
      }

      const result: { success: boolean; data: ExternalWallet[] } = await response.json()
      
      if (!result.success || !result.data || result.data.length === 0) {
        return {
          data: null as any,
          success: false,
          error: 'No se encontró información de billetera',
          message: 'No se pudo obtener la información de la billetera'
        }
      }

      const wallet = result.data[0] // Usar la primera billetera
      const accountNumber = `DOC-${wallet.uuid.substring(0, 4).toUpperCase()}`
      const balance = parseFloat(wallet.balance)

      const walletInfo: WalletInfo = {
        balance,
        accountType: 'DOCENTE', // Hardcoded
        accountNumber,
        status: wallet.status === 'active' ? 'active' : wallet.status === 'inactive' ? 'inactive' : 'suspended',
        lastUpdated: new Date().toISOString(),
        currency: wallet.currency
      }

      return {
        data: walletInfo,
        success: true,
        message: 'Información de billetera obtenida correctamente'
      }
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'No se pudo obtener la información de la billetera'
      }
    }
  }

  // Obtener saldo actual desde la API externa
  static async getBalance(): Promise<ApiResponse<number>> {
    try {
      const token = authService.getToken()
      if (!token) {
        return {
          data: 0,
          success: false,
          error: 'No hay token de autenticación',
          message: 'No se pudo obtener el saldo'
        }
      }

      const response = await fetch(`${WALLET_API_URL}/wallets/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          data: 0,
          success: false,
          error: `Error del servidor: ${response.status}`,
          message: 'No se pudo obtener el saldo'
        }
      }

      const result: { success: boolean; data: ExternalWallet[] } = await response.json()
      
      if (!result.success || !result.data || result.data.length === 0) {
        return {
          data: 0,
          success: false,
          error: 'No se encontró información de billetera',
          message: 'No se pudo obtener el saldo'
        }
      }

      const wallet = result.data[0]
      const balance = parseFloat(wallet.balance)

      return {
        data: balance,
        success: true,
        message: 'Saldo obtenido correctamente'
      }
    } catch (error) {
      return {
        data: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'No se pudo obtener el saldo'
      }
    }
  }

  // Obtener transacciones (método legacy - usar getWalletHistory en su lugar)
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

    // Método legacy - devolver vacío ya que ahora se usa getWalletHistory
    return {
      data: [],
      success: false,
      error: 'Este método está deprecado. Use getWalletHistory() en su lugar.'
    }
  }

  // Obtener transacciones con paginación (método legacy - usar getWalletHistory en su lugar)
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

    // Método legacy - devolver vacío ya que ahora se usa getWalletHistory
    return {
      data: {
        transactions: [],
        total: 0,
        page,
        totalPages: 0
      },
      success: false,
      error: 'Este método está deprecado. Use getWalletHistory() en su lugar.'
    }
  }

  // Cargar saldo (método legacy - usar creditBalance en su lugar)
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

    // Método legacy - usar creditBalance en su lugar
    return {
      data: null as any,
      success: false,
      error: 'Este método está deprecado. Use creditBalance() en su lugar.'
    }
  }

  // Realizar pago (método legacy - no implementado aún)
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

    // Método legacy - no implementado aún con los nuevos endpoints
    return {
      data: null as any,
      success: false,
      error: 'Este método aún no está implementado con los nuevos endpoints.'
    }
  }

  // Obtener historial de wallet del año completo desde la API externa
  static async getWalletHistory(year: number = new Date().getFullYear()): Promise<ApiResponse<WalletHistoryItem[]>> {
    try {
      const token = authService.getToken()
      if (!token) {
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: 'No hay token de autenticación'
        }
      }

      const response = await fetch(`${WALLET_API_URL}/transfers/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: `Error del servidor: ${response.status}`
        }
      }

      const result: { success: boolean; data: ExternalTransfer[] } = await response.json()
      
      if (!result.success || !result.data) {
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: 'No se encontró historial de transacciones'
        }
      }

      // Filtrar por año y mapear al formato esperado
      const yearTransfers = result.data.filter(transfer => {
        const transferYear = new Date(transfer.processed_at || transfer.created_at).getFullYear()
        return transferYear === year
      })

      const historyItems: WalletHistoryItem[] = yearTransfers.map(transfer => ({
        nombre: transfer.description || 'Transacción',
        tipo: transfer.type === 'credit' ? 'INGRESO' : 'EGRESO',
        fecha: transfer.processed_at || transfer.created_at,
        monto: parseFloat(transfer.amount) * (transfer.type === 'credit' ? 1 : -1),
        currency: transfer.currency
      }))

      // Ordenar del más reciente al más antiguo
      const sorted = historyItems.sort((a, b) => {
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return dateB - dateA
      })

      return {
        data: sorted,
        success: true,
        message: 'Historial obtenido correctamente'
      }
    } catch (error) {
      return {
        data: [] as WalletHistoryItem[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Obtener historial de wallet del mes actual (para gráfico) desde la API externa
  static async getWalletHistoryCurrentMonth(): Promise<ApiResponse<WalletHistoryItem[]>> {
    try {
      console.log('🌐 [WalletService] getWalletHistoryCurrentMonth - Iniciando llamada a API')
      const token = authService.getToken()
      if (!token) {
        console.error('🌐 [WalletService] getWalletHistoryCurrentMonth - No hay token')
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: 'No hay token de autenticación'
        }
      }

      console.log('🌐 [WalletService] Llamando a:', `${WALLET_API_URL}/transfers/mine`)
      const response = await fetch(`${WALLET_API_URL}/transfers/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [WalletService] Response status:', response.status, response.statusText)

      if (!response.ok) {
        console.error('🌐 [WalletService] Error en respuesta:', response.status)
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: `Error del servidor: ${response.status}`
        }
      }

      const result: { success: boolean; data: ExternalTransfer[] } = await response.json()
      console.log('🌐 [WalletService] Resultado completo de API:', result)
      console.log('🌐 [WalletService] Total de transfers recibidos:', result.data?.length || 0)
      
      if (!result.success || !result.data) {
        console.error('🌐 [WalletService] No hay datos en la respuesta')
        return {
          data: [] as WalletHistoryItem[],
          success: false,
          error: 'No se encontró historial de transacciones'
        }
      }

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      console.log('🌐 [WalletService] Filtrando por año:', currentYear, 'mes:', currentMonth)

      // Filtrar por mes actual
      const monthTransfers = result.data.filter(transfer => {
        const transferDate = new Date(transfer.processed_at || transfer.created_at)
        const matches = transferDate.getFullYear() === currentYear && transferDate.getMonth() === currentMonth
        if (matches) {
          console.log(`🌐 [WalletService] Transfer del mes: ${transfer.description} - ${transfer.type} - $${transfer.amount}`)
        }
        return matches
      })

      console.log('🌐 [WalletService] Transfers del mes actual:', monthTransfers.length)

      const historyItems: WalletHistoryItem[] = monthTransfers.map(transfer => ({
        nombre: transfer.description || 'Transacción',
        tipo: transfer.type === 'credit' ? 'INGRESO' : 'EGRESO',
        fecha: transfer.processed_at || transfer.created_at,
        monto: parseFloat(transfer.amount) * (transfer.type === 'credit' ? 1 : -1),
        currency: transfer.currency
      }))

      console.log('🌐 [WalletService] HistoryItems mapeados:', historyItems)

      return {
        data: historyItems,
        success: true,
        message: 'Historial del mes obtenido correctamente'
      }
    } catch (error) {
      console.error('🌐 [WalletService] Error en getWalletHistoryCurrentMonth:', error)
      return {
        data: [] as WalletHistoryItem[],
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Acreditar saldo usando tarjeta de crédito (POST /api/transfers)
  static async creditBalance(amount: number): Promise<ApiResponse<{
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

      const token = authService.getToken()
      if (!token) {
        return {
          data: null as any,
          success: false,
          error: 'No hay token de autenticación'
        }
      }

      // Obtener el UUID de la wallet del docente desde el endpoint /wallets/mine
      // Esto garantiza que siempre tengamos el UUID correcto de la billetera activa
      const walletResponse = await fetch(`${WALLET_API_URL}/wallets/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!walletResponse.ok) {
        return {
          data: null as any,
          success: false,
          error: `Error obteniendo información de billetera: ${walletResponse.status}`
        }
      }

      const walletResult: { success: boolean; data: ExternalWallet[] } = await walletResponse.json()
      
      if (!walletResult.success || !walletResult.data || walletResult.data.length === 0) {
        return {
          data: null as any,
          success: false,
          error: 'No se encontró información de billetera del docente'
        }
      }

      // Usar el UUID de la primera wallet (billetera del docente logeado)
      const walletUUID = walletResult.data[0].uuid

      // Asegurar que amount sea un número (no string)
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return {
          data: null as any,
          success: false,
          error: 'El monto debe ser un número válido mayor a 0'
        }
      }

      // Preparar el body según la especificación (todos los campos fijos excepto amount)
      const body = {
        from: 'SYSTEM',
        to: walletUUID, // UUID de la billetera obtenido del endpoint /wallets/mine
        currency: 'ARG',
        amount: numericAmount, // Solo este campo varía según lo que ingresa el usuario
        type: 'credit',
        description: 'Carga de Saldo'
      }

      const url = `${WALLET_API_URL}/transfers`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const responseText = await response.text()
      let data: any = null
      try {
        data = responseText ? JSON.parse(responseText) : null
      } catch {
        data = null
      }

      if (!response.ok) {
        return {
          data: null as any,
          success: false,
          error: `Error del servidor: ${response.status} - ${responseText || 'Sin detalles'}`
        }
      }
      
      // Obtener el nuevo balance después de la carga
      const balanceResponse = await this.getBalance()
      const newBalance = balanceResponse.success ? balanceResponse.data : amount

      return {
        data: {
          newBalance,
          transactionId: data.uuid || `CREDIT-${Date.now()}`
        },
        success: true,
        message: 'Saldo acreditado correctamente'
      }
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: `Error al acreditar saldo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }
  }
}
