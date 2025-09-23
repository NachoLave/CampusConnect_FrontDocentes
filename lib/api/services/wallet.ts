import { WalletInfo, Transaction, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG, USE_MOCK_DATA } from '@/lib/config/api'
import walletData from '@/lib/data/wallet.json'
import { GraduationCap, DollarSign, UtensilsCrossed } from 'lucide-react'

// Mapeo de iconos para los datos mock
const iconMap = {
  'GraduationCap': GraduationCap,
  'DollarSign': DollarSign,
  'UtensilsCrossed': UtensilsCrossed
}

export class WalletService {
  // Obtener información de la billetera
  static async getWalletInfo(): Promise<ApiResponse<WalletInfo>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return {
        data: walletData.walletInfo as WalletInfo,
        success: true,
        message: 'Información de billetera obtenida correctamente'
      }
    }

    return apiClient.get<WalletInfo>(API_CONFIG.ENDPOINTS.WALLET)
  }

  // Obtener saldo actual
  static async getBalance(): Promise<ApiResponse<number>> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        data: walletData.walletInfo.balance,
        success: true,
        message: 'Saldo obtenido correctamente'
      }
    }

    return apiClient.get<number>(API_CONFIG.ENDPOINTS.WALLET_BALANCE)
  }

  // Obtener transacciones
  static async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
}
