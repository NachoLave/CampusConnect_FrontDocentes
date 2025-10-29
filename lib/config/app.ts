// Configuración para cambiar fácilmente entre modo mock y real
export const APP_CONFIG = {
  // Cambiar a false cuando el módulo de autenticación esté disponible
  USE_MOCK_AUTH: true,
  
  // Cambiar a false cuando quieras usar datos reales del backend
  USE_MOCK_DATA: false, // Forzar uso de datos reales del backend
  
  // ID del docente para modo mock
  MOCK_TEACHER_ID: '1010',
  
  // Email del docente para modo mock
  MOCK_TEACHER_EMAIL: 'docente@campus.com',
  
  // Nombre del docente para modo mock
  MOCK_TEACHER_NAME: 'Docente Test',
  
  // Roles del docente para modo mock
  MOCK_TEACHER_ROLES: 'TITULAR,AUXILIAR'
}

// Función helper para verificar si debemos usar datos mock
export const shouldUseMockData = () => {
  return APP_CONFIG.USE_MOCK_DATA
}

// Función helper para verificar si debemos usar autenticación mock
export const shouldUseMockAuth = () => {
  return APP_CONFIG.USE_MOCK_AUTH
}
