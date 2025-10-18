'use client'

import { useState } from 'react'
import { authService, LoginRequest } from '@/lib/api/services/auth'
import { apiClient } from '@/lib/utils/api'
import { API_CONFIG } from '@/lib/config/api'

export default function BackendTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: 'docente@campusconnect.edu',
    password: 'password123'
  })

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      // Test 1: Verificar que el backend responde
      addResult('🔍 Probando conexión básica...')
      const response = await fetch(`${API_CONFIG.BASE_URL}/teachers/me`, {
        method: 'GET',
        headers: {
          'X-Teacher-Id': '1',
          'X-Teacher-Roles': 'TEACHER'
        }
      })
      
      if (response.ok) {
        addResult('✅ Conexión básica exitosa')
      } else {
        addResult(`❌ Error en conexión básica: ${response.status}`)
      }

      // Test 2: Probar login
      addResult('🔐 Probando login...')
      const loginResult = await authService.login(loginData)
      
      if (loginResult) {
        addResult('✅ Login exitoso')
        
        // Test 3: Probar endpoint autenticado
        addResult('👤 Probando perfil del docente...')
        const profile = await authService.getProfile()
        
        if (profile) {
          addResult(`✅ Perfil obtenido: ${profile.name} (${profile.email})`)
        } else {
          addResult('❌ Error obteniendo perfil')
        }
        
        // Test 4: Probar cursos
        addResult('📚 Probando cursos del docente...')
        const coursesResponse = await apiClient.get(API_CONFIG.ENDPOINTS.MY_COURSES)
        
        if (coursesResponse.success) {
          addResult(`✅ Cursos obtenidos: ${coursesResponse.data?.length || 0} cursos`)
        } else {
          addResult(`❌ Error obteniendo cursos: ${coursesResponse.error}`)
        }
        
      } else {
        addResult('❌ Error en login')
      }

    } catch (error) {
      addResult(`❌ Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
    
    setIsLoading(false)
  }

  const testMockMode = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult('🧪 Probando modo mock...')
      
      // Configurar modo mock
      authService.setMockMode('1', 'TEACHER')
      
      // Probar endpoint con headers mock
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TEACHER_PROFILE)
      
      if (response.success) {
        addResult('✅ Modo mock funcionando correctamente')
      } else {
        addResult(`❌ Error en modo mock: ${response.error}`)
      }
      
    } catch (error) {
      addResult(`❌ Error en modo mock: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Prueba de Conexión con Backend</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">URL del Backend:</h2>
        <code className="text-sm bg-white p-2 rounded border">
          {API_CONFIG.BASE_URL}
        </code>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Credenciales de Prueba</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Acciones de Prueba</h3>
          <div className="space-y-3">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Probando...' : 'Probar Conexión Completa'}
            </button>
            
            <button
              onClick={testMockMode}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Probando...' : 'Probar Modo Mock'}
            </button>
          </div>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Resultados de las Pruebas:</h3>
          <div className="bg-gray-50 rounded p-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}