'use client'

import { useState, useEffect, useCallback } from 'react'
import { WalletInfo, Transaction, LoadingState } from '@/lib/types'
import { WalletService } from '@/lib/api/services'

export function useWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchWalletData = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        WalletService.getWalletInfo(),
        WalletService.getTransactions()
      ])
      
      if (walletResponse.success && transactionsResponse.success) {
        setWalletInfo(walletResponse.data)
        setTransactions(transactionsResponse.data)
      } else {
        const error = walletResponse.error || transactionsResponse.error || 'Error al cargar datos de billetera'
        setLoadingState({ 
          isLoading: false, 
          error 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar billetera' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  return {
    walletInfo,
    transactions,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchWalletData
  }
}

export function useBalance() {
  const [balance, setBalance] = useState<number>(0)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchBalance = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await WalletService.getBalance()
      
      if (response.success) {
        setBalance(response.data)
        setLoadingState({ isLoading: false, error: null })
      } else {
        // Si hay error, mantener el balance en 0 y marcar como no loading
        setBalance(0)
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar saldo' 
        })
      }
    } catch (error) {
      // Si hay error, mantener el balance en 0 y marcar como no loading
      setBalance(0)
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar saldo' 
      })
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchBalance
  }
}

export function useTransactions(page: number = 1, limit: number = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  })
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })

  const fetchTransactions = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await WalletService.getTransactionsPaginated(page, limit)
      
      if (response.success) {
        setTransactions(response.data.transactions)
        setPagination({
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        })
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar transacciones' 
        })
        return
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar transacciones' 
      })
      return
    }

    setLoadingState({ isLoading: false, error: null })
  }, [page, limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    pagination,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    refetch: fetchTransactions
  }
}

export function useWalletActions() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const loadBalance = useCallback(async (amount: number, paymentMethod: string) => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await WalletService.loadBalance(amount, paymentMethod)
      
      if (response.success) {
        setLoadingState({ isLoading: false, error: null })
        return response.data
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al cargar saldo' 
        })
        return null
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al cargar saldo' 
      })
      return null
    }
  }, [])

  const makePayment = useCallback(async (amount: number, description: string, category: string) => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await WalletService.makePayment(amount, description, category)
      
      if (response.success) {
        setLoadingState({ isLoading: false, error: null })
        return response.data
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al realizar pago' 
        })
        return null
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al realizar pago' 
      })
      return null
    }
  }, [])

  const creditBalance = useCallback(async (amount: number) => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const response = await WalletService.creditBalance(amount)
      
      if (response.success) {
        setLoadingState({ isLoading: false, error: null })
        return response.data
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: response.error || 'Error al acreditar saldo' 
        })
        return null
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: 'Error inesperado al acreditar saldo' 
      })
      return null
    }
  }, [])

  return {
    loadBalance,
    makePayment,
    creditBalance,
    isLoading: loadingState.isLoading,
    error: loadingState.error
  }
}
