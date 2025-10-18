import { WalletInfo, Transaction, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'
import { APP_CONFIG } from '@/lib/config/app'
import walletData from '@/lib/data/wallet.json'
import { GraduationCap, DollarSign, UtensilsCrossed } from 'lucide-react'
import { postmanProxy } from '@/lib/utils/postmanProxy'

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

      if (balanceResponse.success && balanceResponse.data !== null) {
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
        throw new Error('No se pudo obtener el balance del backend')
      }
    } catch (error) {
      console.error('Error obteniendo información de billetera real:', error)
      // Retornar error para que el usuario sepa que hay un problema
      return {
        data: null as any,
        success: false,
        message: 'No se pudo obtener la información de la billetera'
      }
    }
  }

  // Obtener saldo actual
  static async getBalance(): Promise<ApiResponse<number>> {
    console.log('🔍 WalletService.getBalance() - Obteniendo datos reales del backend')
    
    try {
      console.log('🌐 Llamando al backend real...')
      // Usar el proxy de Postman para obtener el balance real
      const balance = await postmanProxy.getBalance()
      
      console.log('✅ Balance obtenido exitosamente:', balance)
      return {
        data: balance,
        success: true,
        message: 'Saldo obtenido desde el backend'
      }
    } catch (error) {
      console.error('❌ Error obteniendo saldo real:', error)
      // Retornar error en lugar de fallback
      return {
        data: null as any,
        success: false,
        error: 'No se pudo obtener el saldo del backend'
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
}
