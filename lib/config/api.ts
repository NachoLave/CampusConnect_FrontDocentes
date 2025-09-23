// Configuración de API
export const API_CONFIG = {
  // En desarrollo usamos datos mockeados, en producción la URL real del backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    // Cursos
    COURSES: '/courses',
    COURSE_BY_ID: (id: number) => `/courses/${id}`,
    
    // Calendario
    CALENDAR: '/calendar',
    CALENDAR_EVENTS: (date: string) => `/calendar/events?date=${date}`,
    
    // Billetera
    WALLET: '/wallet',
    WALLET_TRANSACTIONS: '/wallet/transactions',
    WALLET_BALANCE: '/wallet/balance',
    
    // Dashboard
    DASHBOARD_DATA: '/dashboard',
    CAROUSEL_IMAGES: '/dashboard/carousel',
    
    // Perfil
    PROFILE: '/profile',
    
    // Comedor
    CAFETERIA: '/cafeteria',
    CAFETERIA_RESERVATIONS: '/cafeteria/reservations',
    
    // Tienda
    STORE: '/store',
    STORE_PRODUCTS: '/store/products'
  }
}

// Headers por defecto para las requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// Configuración para desarrollo (mock)
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || IS_DEVELOPMENT
