import { useState, useEffect } from 'react'
import { TeacherProfile } from '@/lib/types'
import { TeacherService } from '@/lib/api/services/teacher'
import { authService } from '@/lib/api/services/auth'
import { APP_CONFIG } from '@/lib/config/app'

interface UseTeacherProfileReturn {
  profile: TeacherProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  /** Indica si los datos vienen del JWT (true) o del endpoint (false) */
  isFromJWT: boolean
}

/**
 * Hook para obtener el perfil del docente autenticado
 * 
 * Flujo:
 * 1. Si hay JWT válido, usa los datos del token (inmediato)
 * 2. Opcionalmente intenta enriquecer con datos del endpoint /teachers/me
 * 3. En modo mock, usa el endpoint directamente
 */
export function useTeacherProfile(): UseTeacherProfileReturn {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromJWT, setIsFromJWT] = useState(false)

  // Obtiene el perfil desde los datos del JWT
  const getProfileFromJWT = (): TeacherProfile | null => {
    const payload = authService.getJWTPayload()
    if (!payload) return null

    return {
      teacherId: 0, // No tenemos ID numérico, usamos UUID
      email: payload.email || '',
      name: payload.name || payload.nombre || 'Docente',
      activo: true,
      role: payload.role || (payload.roles?.[0]) || 'DOCENTE',
      legajo: payload.sub, // Usamos el UUID como "legajo" para mostrar
      cantidadCursosDictados: 0, // No disponible en JWT
      // Campos extra del JWT que podemos guardar
      uuid: payload.sub,
      walletUUIDs: payload.wallet,
      career: payload.career,
    } as TeacherProfile & { uuid: string; walletUUIDs?: string[]; career?: any }
  }

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Si estamos en modo JWT real, intentar primero con datos del JWT
      if (!APP_CONFIG.USE_MOCK_AUTH && authService.isAuthenticated()) {
        const jwtProfile = getProfileFromJWT()
        
        if (jwtProfile) {
          console.log('✅ Perfil cargado desde JWT:', jwtProfile.name)
          setProfile(jwtProfile)
          setIsFromJWT(true)
          setIsLoading(false)
          
          // Opcionalmente intentar enriquecer con datos del backend
          // Descomenta si el backend ya acepta el JWT
          /*
          try {
            const response = await TeacherService.getProfile()
            if (response.success && response.data) {
              console.log('✅ Perfil enriquecido desde backend')
              setProfile(prev => ({ ...prev, ...response.data }))
              setIsFromJWT(false)
            }
          } catch (e) {
            console.log('⚠️ No se pudo enriquecer perfil desde backend, usando JWT')
          }
          */
          
          return
        }
      }

      // Fallback: llamar al endpoint (modo mock o si no hay JWT)
      const response = await TeacherService.getProfile()
      
      if (response.success && response.data) {
        setProfile(response.data)
        setIsFromJWT(false)
      } else {
        setError(response.error || 'Error al cargar el perfil')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    isFromJWT
  }
}
