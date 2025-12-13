"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Filter, X, ChevronDown, Power, HelpCircle, Sun, Sunset, Moon, Monitor, MapPin, Edit2 } from "lucide-react"
import { AddSubjectModal } from "@/components/modals/add-subject-modal"
import { AddAvailabilityModal } from "@/components/modals/add-availability-modal"
import { EditAvailabilityModal } from "@/components/modals/edit-availability-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import { useTeacherProfile, useProposals, useAvailability, useCampuses } from "@/lib/hooks"
import { authService } from "@/lib/api/services/auth"
import { AdminService } from "@/lib/api/services/admin"
import type { AvailabilityBlock } from "@/lib/types"

// Función para obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Genera un hash numérico simple a partir de un string (para UUIDs)
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Paleta estandarizada de colores para avatares
function getUserColor(uuid?: string, teacherId?: number): string {
  const colors = [
    'bg-rose-500',      // Rosa
    'bg-blue-500',      // Azul
    'bg-emerald-500',   // Verde esmeralda
    'bg-violet-500',    // Violeta
    'bg-amber-500',     // Ámbar
    'bg-pink-500',      // Rosa fucsia
    'bg-cyan-500',      // Cian
    'bg-teal-500',      // Verde azulado
    'bg-orange-500',    // Naranja
    'bg-purple-500',    // Púrpura
  ]
  
  // Priorizar UUID si está disponible
  if (uuid) {
    const hash = hashString(uuid)
    return colors[hash % colors.length]
  }
  
  // Fallback a teacherId numérico
  if (teacherId) {
    return colors[teacherId % colors.length]
  }
  
  return 'bg-gray-500'
}

// Componente skeleton para Profile Header
function ProfileHeaderSkeleton() {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative overflow-hidden w-20 h-20 bg-gray-300 rounded-full shadow-lg">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="relative overflow-hidden h-8 w-48 bg-gray-200 rounded">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="relative overflow-hidden h-5 w-32 bg-gray-200 rounded">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="relative overflow-hidden h-6 w-28 bg-gray-200 rounded">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente skeleton para Profile Information
function ProfileInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Información de perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="relative overflow-hidden h-4 w-32 bg-gray-200 rounded">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </label>
              <div className="relative overflow-hidden h-10 bg-gray-100 rounded-md">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente skeleton para Propuestas de Materias
function ProposalsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border shadow-sm">
          <CardContent className="p-4">
            <div className="relative overflow-hidden h-6 w-full bg-gray-200 rounded mb-2">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="relative overflow-hidden h-6 w-24 bg-gray-200 rounded">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente skeleton para Disponibilidad Horaria
function AvailabilitySkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-700 bg-gray-100">Día</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 bg-gray-100">Turno</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 bg-gray-100">Modalidad</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 bg-gray-100">Sedes</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 bg-gray-100">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-b">
              <td colSpan={5} className="py-3 px-4">
                <div className="relative overflow-hidden h-6 bg-gray-200 rounded">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Función para obtener el color según el estado de la propuesta
function getProposalColor(status: string): string {
  switch (status) {
    case 'APROBADA':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'RECHAZADA':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'PENDIENTE':
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
}

// Función para formatear el turno
function formatShift(shift: string): string {
  const shiftMap: Record<string, string> = {
    'MANIANA': 'Mañana',
    'MANANA': 'Mañana', // Por compatibilidad
    'TARDE': 'Tarde',
    'NOCHE': 'Noche'
  }
  return shiftMap[shift] || shift
}

// Función para obtener el horario del turno
function getShiftTime(shift: string): string {
  const timeMap: Record<string, string> = {
    'MANIANA': '8:00 - 12:00',
    'MANANA': '8:00 - 12:00', // Por compatibilidad
    'TARDE': '14:00 - 18:00',
    'NOCHE': '19:00 - 23:00'
  }
  return timeMap[shift] || ''
}

// Función para obtener el nombre completo del campus
// Maneja tanto códigos legacy como UUIDs
function getCampusName(codeOrUUID: string, allCampuses: Array<{ uuid?: string; name: string; code?: string }> = []): string {
  // Mapeo de códigos legacy (para compatibilidad)
  const legacyMap: Record<string, string> = {
    'MON': 'Monserrat',
    'BEL': 'Belgrano',
    'REC': 'Recoleta',
    'PIN': 'Pinamar',
    'FLO': 'Flores',
    'VIR': 'Virtual'
  }
  
  // Si es un código legacy, devolver el nombre
  if (legacyMap[codeOrUUID]) {
    return legacyMap[codeOrUUID]
  }
  
  // Si es VIR (Virtual), devolver Virtual
  if (codeOrUUID === 'VIR') {
    return 'Virtual'
  }
  
  // Buscar el campus por UUID en la lista de campuses
  if (codeOrUUID.includes('-')) {
    const campus = allCampuses.find(c => c.uuid === codeOrUUID)
    if (campus && campus.name) {
      return campus.name
    }
    // Si no se encuentra, intentar buscar por code
    const campusByCode = allCampuses.find(c => c.code === codeOrUUID)
    if (campusByCode && campusByCode.name) {
      return campusByCode.name
    }
    // Fallback: mostrar primeros 8 caracteres del UUID
    return codeOrUUID.substring(0, 8) + '...'
  }
  
  // Si no es UUID, intentar buscar por code
  const campusByCode = allCampuses.find(c => c.code === codeOrUUID)
  if (campusByCode && campusByCode.name) {
    return campusByCode.name
  }
  
  return codeOrUUID
}

// Función helper para obtener el nombre de una sede desde un bloque de disponibilidad
function getCampusDisplayName(block: AvailabilityBlock, index: number, campusId: string, allCampuses: Array<{ uuid?: string; name: string; code?: string }> = []): string {
  // Si tenemos nombres enriquecidos, usarlos
  if (block.campusNames && block.campusNames[index]) {
    return block.campusNames[index]
  }
  // Fallback a la función de mapeo
  return getCampusName(campusId, allCampuses)
}

// Función para formatear el día
function formatDay(day: string): string {
  const dayMap: Record<string, string> = {
    'LUNES': 'Lunes',
    'MARTES': 'Martes',
    'MIERCOLES': 'Miércoles',
    'JUEVES': 'Jueves',
    'VIERNES': 'Viernes'
  }
  return dayMap[day] || day
}

// Función para formatear la modalidad
function formatModality(modality: string): string {
  const modalityMap: Record<string, string> = {
    'PRESENCIAL': 'Presencial',
    'VIRTUAL': 'Virtual',
    'AMBAS': 'Ambas (Presencial y Virtual)'
  }
  return modalityMap[modality] || modality
}

// Función para obtener el icono del turno
function getShiftIcon(shift: string) {
  switch (shift) {
    case 'MANIANA':
    case 'MANANA': // Por compatibilidad
      return <Sun className="w-4 h-4" />
    case 'TARDE':
      return <Sunset className="w-4 h-4" />
    case 'NOCHE':
      return <Moon className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

// Función para obtener el color del turno
function getShiftColor(shift: string): string {
  switch (shift) {
    case 'MANIANA':
    case 'MANANA': // Por compatibilidad
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'TARDE':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'NOCHE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function PerfilPage() {
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ 
    type: "materia" | "horario"
    subjectId?: number
    subjectName?: string
    blockId?: number
  } | null>(null)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<{
    proposalId: number
    subjectName: string
    currentActive: boolean
  } | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  // Obtener datos desde el backend
  const { profile, isLoading: profileLoading, error: profileError } = useTeacherProfile()
  const { proposals: backendProposals, isLoading: proposalsLoading, error: proposalsError, createProposal, deleteProposal, toggleProposalAvailability, refetch: refetchProposals } = useProposals()
  const { availability: backendAvailability, isLoading: availabilityLoading, error: availabilityError, addAvailability, deleteAvailability, updateAvailabilityBlock, refetch: refetchAvailability } = useAvailability()
  const { campuses: allCampuses, isLoading: campusesLoading, error: campusesError } = useCampuses()

  // 🔍 DEBUG: Log de IDs de todas las sedes obtenidas (SOLO ACTIVAS desde useCampuses)
  useEffect(() => {
    if (!campusesLoading && allCampuses.length > 0) {
      console.log('🏢 SEDES ACTIVAS OBTENIDAS (desde useCampuses):')
      console.log('Total de sedes activas:', allCampuses.length)
      allCampuses.forEach((campus, index) => {
        console.log(`  ${index + 1}. ${campus.name} (${campus.ubicacion || 'Sin ubicación'})`)
        console.log(`     - UUID: ${campus.uuid}`)
        console.log(`     - Code: ${campus.code}`)
        console.log(`     - Active: ${campus.active}`)
      })
      console.log('🏢 IDs (UUIDs) de todas las sedes activas:', allCampuses.map(c => c.uuid).join(', '))
    }
    if (campusesError) {
      console.error('❌ Error al cargar sedes activas:', campusesError)
    }
  }, [allCampuses, campusesLoading, campusesError])

  // 🔍 DEBUG: Log de ABSOLUTAMENTE TODAS las sedes (ACTIVAS E INACTIVAS) desde el endpoint de sedes
  useEffect(() => {
    const fetchAllCampuses = async () => {
      try {
        console.log('🔍 ========================================')
        console.log('🔍 SOLICITANDO TODAS LAS SEDES (ACTIVAS E INACTIVAS)')
        console.log('🔍 ========================================')
        
        const response = await AdminService.getAllCampuses()
        
        if (response.success && response.data) {
          console.log('✅ ========================================')
          console.log('✅ TODAS LAS SEDES OBTENIDAS DEL ENDPOINT')
          console.log('✅ ========================================')
          console.log(`📊 Total de sedes (activas + inactivas): ${response.data.length}`)
          console.log('')
          
          response.data.forEach((sede, index) => {
            console.log(`  ${index + 1}. ${sede.nombre}`)
            console.log(`     - UUID (id_sede): ${sede.id_sede}`)
            console.log(`     - Ubicación: ${sede.ubicacion || 'Sin ubicación'}`)
            console.log(`     - Status (activa): ${sede.status}`)
            console.log('')
          })
          
          console.log('📋 RESUMEN:')
          const activas = response.data.filter(s => s.status === true)
          const inactivas = response.data.filter(s => s.status === false)
          console.log(`  - Activas: ${activas.length}`)
          console.log(`  - Inactivas: ${inactivas.length}`)
          console.log('')
          
          console.log('🆔 TODOS LOS UUIDs (id_sede) DE TODAS LAS SEDES:')
          console.log(response.data.map(s => s.id_sede).join(', '))
          console.log('')
          
          console.log('🆔 UUIDs DE SEDES ACTIVAS:')
          console.log(activas.map(s => s.id_sede).join(', '))
          console.log('')
          
          console.log('🆔 UUIDs DE SEDES INACTIVAS:')
          console.log(inactivas.map(s => s.id_sede).join(', '))
          console.log('✅ ========================================')
        } else {
          console.error('❌ Error al obtener todas las sedes:', response.error)
        }
      } catch (error) {
        console.error('❌ Error al obtener todas las sedes:', error)
      }
    }

    fetchAllCampuses()
  }, []) // Solo se ejecuta una vez al montar el componente

  // Estado local para Optimistic Updates
  const [proposals, setProposals] = useState(backendProposals)
  const [availability, setAvailability] = useState(backendAvailability)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [allowSync, setAllowSync] = useState(true)
  const [allowAvailabilitySync, setAllowAvailabilitySync] = useState(true)
  const [isInitialAvailabilityLoad, setIsInitialAvailabilityLoad] = useState(true)
  const [selectedDay, setSelectedDay] = useState('LUNES')
  const [showEditAvailabilityModal, setShowEditAvailabilityModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<any>(null)
  
  // Filtros para disponibilidad
  const [selectedCampusFilters, setSelectedCampusFilters] = useState<string[]>([])
  const [selectedShiftFilters, setSelectedShiftFilters] = useState<string[]>([])
  const [selectedModalityFilters, setSelectedModalityFilters] = useState<string[]>([])
  const [showAvailabilityFilterDropdown, setShowAvailabilityFilterDropdown] = useState(false)
  const availabilityFilterDropdownRef = useRef<HTMLDivElement>(null)

  // 🔐 DEBUG: Imprimir token completo en consola
  useEffect(() => {
    const token = authService.getToken()
    if (token) {
      console.log('========================================')
      console.log('🔐 TOKEN COMPLETO (copiar desde aquí):')
      console.log('========================================')
      console.log(token)
      console.log('========================================')
      console.log('🔐 FIN DEL TOKEN')
      console.log('========================================')
    }
  }, [])

  // Sincronizar con datos del backend solo cuando está permitido
  useEffect(() => {
    if (allowSync && (backendProposals.length > 0 || !proposalsLoading)) {
      setProposals(backendProposals)
      if (isInitialLoad) {
        setIsInitialLoad(false)
        setAllowSync(false) // Desactivar sincronización automática después de la carga inicial
      }
    }
  }, [backendProposals, proposalsLoading, isInitialLoad, allowSync])

  // Sincronizar availability del backend solo cuando está permitido
  useEffect(() => {
    if (allowAvailabilitySync && (backendAvailability.length > 0 || !availabilityLoading)) {
      setAvailability(backendAvailability)
      if (isInitialAvailabilityLoad) {
        setIsInitialAvailabilityLoad(false)
        setAllowAvailabilitySync(false)
      }
    }
  }, [backendAvailability, availabilityLoading, isInitialAvailabilityLoad, allowAvailabilitySync])

  // Filtrar propuestas por estado e inactivas
  const filteredProposals = useMemo(() => {
    let filtered = proposals
    
    // Filtrar por estado
    if (statusFilter.length > 0) {
      filtered = filtered.filter(p => statusFilter.includes(p.status))
    }
    
    // Filtrar por inactivas
    if (showInactiveOnly) {
      filtered = filtered.filter(p => p.status === "APROBADA" && !p.active)
    }
    
    return filtered
  }, [proposals, statusFilter, showInactiveOnly])

  // Calcular paginación
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage)
  const paginatedProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProposals.slice(startIndex, endIndex)
  }, [filteredProposals, currentPage])

  // Resetear página cuando cambien los filtros o el número total de páginas
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, showInactiveOnly])

  // Ajustar página actual si excede el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Filtrar disponibilidad por día seleccionado
  const filteredAvailability = useMemo(() => {
    let filtered = availability.filter(block => block.dayOfWeek === selectedDay)
    
    // Filtrar por sede
    if (selectedCampusFilters.length > 0) {
      filtered = filtered.filter(block => 
        selectedCampusFilters.some(campus => block.campuses?.includes(campus))
      )
    }
    
    // Filtrar por turno
    if (selectedShiftFilters.length > 0) {
      filtered = filtered.filter(block => 
        selectedShiftFilters.includes(block.shift)
      )
    }
    
    // Filtrar por modalidad
    if (selectedModalityFilters.length > 0) {
      filtered = filtered.filter(block => 
        selectedModalityFilters.includes(block.modality)
      )
    }
    
    return filtered
  }, [availability, selectedDay, selectedCampusFilters, selectedShiftFilters, selectedModalityFilters])

  // Días de la semana para las pestañas
  const weekDays = [
    { key: 'LUNES', label: 'Lun' },
    { key: 'MARTES', label: 'Mar' },
    { key: 'MIERCOLES', label: 'Mié' },
    { key: 'JUEVES', label: 'Jue' },
    { key: 'VIERNES', label: 'Vie' }
  ]

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const removeStatusFilter = (status: string) => {
    setStatusFilter(prev => prev.filter(s => s !== status))
  }

  const clearFilters = () => {
    setStatusFilter([])
    setShowInactiveOnly(false)
  }

  const toggleInactiveFilter = () => {
    setShowInactiveOnly(!showInactiveOnly)
  }

  // Funciones para filtros de disponibilidad
  const toggleCampusFilter = (campus: string) => {
    if (selectedCampusFilters.includes(campus)) {
      setSelectedCampusFilters(prev => prev.filter(c => c !== campus))
    } else {
      setSelectedCampusFilters(prev => [...prev, campus])
    }
  }

  const toggleShiftFilter = (shift: string) => {
    if (selectedShiftFilters.includes(shift)) {
      setSelectedShiftFilters(prev => prev.filter(s => s !== shift))
    } else {
      setSelectedShiftFilters(prev => [...prev, shift])
    }
  }

  const toggleModalityFilter = (modality: string) => {
    if (selectedModalityFilters.includes(modality)) {
      setSelectedModalityFilters(prev => prev.filter(m => m !== modality))
    } else {
      setSelectedModalityFilters(prev => [...prev, modality])
    }
  }

  const clearAvailabilityFilters = () => {
    setSelectedCampusFilters([])
    setSelectedShiftFilters([])
    setSelectedModalityFilters([])
  }

  const hasAvailabilityFilters = selectedCampusFilters.length > 0 || 
                                  selectedShiftFilters.length > 0 || 
                                  selectedModalityFilters.length > 0

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
      if (availabilityFilterDropdownRef.current && !availabilityFilterDropdownRef.current.contains(event.target as Node)) {
        setShowAvailabilityFilterDropdown(false)
      }
    }

    if (showFilterDropdown || showAvailabilityFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown, showAvailabilityFilterDropdown])

  const handleAddSubject = (subjectId: number | string) => {
    // Cerrar modal primero
    setShowSubjectModal(false)
    
    // Optimistic Update: Agregar inmediatamente a la UI
    const optimisticProposal = {
      proposalId: `temp-${Date.now()}`, // ID temporal (string para UUIDs)
      subjectId,
      subjectName: null, // null indica que debe mostrar shimmer
      status: 'PENDIENTE' as const,
      createdAt: new Date().toISOString(),
      decidedAt: null,
      active: true
    }
    
    setProposals(prev => [...prev, optimisticProposal])
    
    // Hacer la petición real en background
    createProposal(subjectId).then(success => {
      if (success) {
        // Permitir sincronización temporalmente para obtener datos reales del servidor
        setAllowSync(true)
        refetchProposals().then(() => {
          // Desactivar sincronización automática después del refetch
          setTimeout(() => setAllowSync(false), 100)
        })
      } else {
        // Rollback: Remover la propuesta optimista y mostrar error
        setProposals(prev => prev.filter(p => p.proposalId !== optimisticProposal.proposalId))
        setErrorMessage("Error al crear la propuesta. Por favor, intenta nuevamente.")
      }
    })
  }

  // Ref para trackear bloques que están siendo procesados (evitar duplicados en batch)
  const processingBlocksRef = useRef<Set<string>>(new Set())
  
  // Ref para trackear intentos fallidos de availability
  const failedAvailabilityAttemptsRef = useRef<number>(0)
  
  // Función helper para retry con exponential backoff
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
  ): Promise<T | null> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        if (result) {
          return result
        }
        // Si result es null/undefined, intentar de nuevo
        if (attempt < maxRetries) {
          console.log(`Reintentando operación (intento ${attempt + 2}/${maxRetries + 1})...`)
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)))
        }
      } catch (error) {
        console.error(`Error en intento ${attempt + 1}:`, error)
        if (attempt < maxRetries) {
          console.log(`Reintentando en ${delayMs * Math.pow(2, attempt)}ms...`)
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)))
        }
      }
    }
    return null
  }

  const handleAddAvailability = (availabilityData: {
    dayOfWeek: string
    shift: string
    modality: string
    campuses: string[] // Array de strings: UUIDs de sedes (strings) o "VIR" (único caso especial, también string)
  }) => {
    // Crear una clave única para este bloque
    const blockKey = `${availabilityData.dayOfWeek}-${availabilityData.shift}-${availabilityData.modality}`
    
    // Si ya está siendo procesado, omitir
    if (processingBlocksRef.current.has(blockKey)) {
      console.log('Bloque ya en proceso, omitiendo duplicado:', blockKey)
      return
    }
    
    // Marcar como en proceso
    processingBlocksRef.current.add(blockKey)
    
    // Remover del tracking después de un tiempo
    setTimeout(() => {
      processingBlocksRef.current.delete(blockKey)
    }, 1000)
    
    // VALIDACIÓN: Si se intenta crear VIRTUAL cuando ya existe AMBAS (mismo día + turno)
    if (availabilityData.modality === 'VIRTUAL') {
      const ambasBlock = availability.find(
        b => b.dayOfWeek === availabilityData.dayOfWeek && 
             b.shift === availabilityData.shift && 
             b.modality === 'AMBAS'
      )
      
      if (ambasBlock) {
        setInfoMessage(
          `Ya existe una disponibilidad con modalidad "Ambas (Presencial y Virtual)" para ${formatDay(availabilityData.dayOfWeek)} en turno ${formatShift(availabilityData.shift)}, que ya incluye la modalidad virtual.`
        )
        return
      }
    }
    
    // OPTIMIZACIÓN: Si se intenta crear PRESENCIAL cuando ya existe AMBAS (mismo día + turno)
    if (availabilityData.modality === 'PRESENCIAL') {
      const ambasBlock = availability.find(
        b => b.dayOfWeek === availabilityData.dayOfWeek && 
             b.shift === availabilityData.shift && 
             b.modality === 'AMBAS'
      )
      
      if (ambasBlock) {
        // Verificar qué sedes son nuevas
        const campusesEnAmbas = ambasBlock.campuses.filter(c => c !== 'VIR') || []
        const sedesNuevas = availabilityData.campuses.filter(
          campus => !campusesEnAmbas.includes(campus)
        )
        const sedesYaIncluidas = availabilityData.campuses.filter(
          campus => campusesEnAmbas.includes(campus)
        )
        
        if (sedesNuevas.length > 0) {
          // Hay sedes nuevas para agregar al bloque AMBAS existente
          if (!ambasBlock.id) {
            setErrorMessage("Error: El bloque AMBAS no tiene ID válido.")
            return
          }
          
          const ambasBlockId = ambasBlock.id
          const updatedCampuses = [...campusesEnAmbas, ...sedesNuevas, 'VIR'] // Mantener VIR
          const updatedBlock = { ...ambasBlock, campuses: updatedCampuses }
          
          console.log(`Agregando sedes a bloque AMBAS existente:`, sedesNuevas.map(c => getCampusName(c, allCampuses)).join(', '))
          console.log(`PATCH /teachers/me/availability/${ambasBlockId}`)
          console.log('Request Body:', JSON.stringify({ campuses: updatedCampuses }, null, 2))
          
          // Optimistic Update
          setAvailability(prev => prev.map(b => 
            b.id === ambasBlockId ? updatedBlock : b
          ))
          
          // Hacer PATCH al backend con retry
          retryOperation(() => updateAvailabilityBlock(ambasBlockId, { campuses: updatedCampuses }), 2, 1000).then(success => {
            console.log('Respuesta PATCH availability:', success ? 'SUCCESS' : 'FAILED')
            if (success) {
              failedAvailabilityAttemptsRef.current = 0
              // Mostrar mensaje informativo
              const sedesAgregadas = sedesNuevas.map(c => getCampusName(c, allCampuses)).join(', ')
              setInfoMessage(
                `Se ${sedesNuevas.length > 1 ? 'agregaron las sedes' : 'agregó la sede'} ${sedesAgregadas} al bloque existente de "Ambas (Presencial y Virtual)" para ${formatDay(availabilityData.dayOfWeek)} en turno ${formatShift(availabilityData.shift)}.`
              )
            } else {
              failedAvailabilityAttemptsRef.current++
              
              // Rollback
              setAvailability(prev => prev.map(b => 
                b.id === ambasBlockId ? ambasBlock : b
              ))
              
              if (failedAvailabilityAttemptsRef.current >= 2) {
                console.log('Múltiples fallos detectados, sincronizando con servidor...')
                setInfoMessage("Se detectaron problemas de conexión. Sincronizando con el servidor...")
                refetchAvailability().then(() => {
                  failedAvailabilityAttemptsRef.current = 0
                })
              } else {
                setErrorMessage("Error al agregar las sedes al bloque existente después de 3 intentos.")
              }
            }
          })
          
          return // Salir de la función, ya procesamos
        } else if (sedesYaIncluidas.length > 0) {
          // Todas las sedes ya están incluidas
          const sedesNombres = sedesYaIncluidas.map(code => getCampusName(code, allCampuses)).join(', ')
          setInfoMessage(
            `Ya existe una disponibilidad con modalidad "Ambas (Presencial y Virtual)" para ${formatDay(availabilityData.dayOfWeek)} en turno ${formatShift(availabilityData.shift)}, que ya incluye ${sedesYaIncluidas.length > 1 ? 'las sedes' : 'la sede'}: ${sedesNombres}.`
          )
          return
        }
      }
    }
    
    // CONSOLIDACIÓN INTELIGENTE: Si la nueva modalidad es AMBAS
    if (availabilityData.modality === 'AMBAS') {
      // Recolectar todas las sedes únicas de bloques PRESENCIAL existentes
      const presencialBlocks = availability.filter(
        b => b.dayOfWeek === availabilityData.dayOfWeek && 
             b.shift === availabilityData.shift && 
             b.modality === 'PRESENCIAL'
      )
      
      // Recolectar sedes de todos los bloques PRESENCIAL
      const sedesPresencialesExistentes = new Set<string>()
      presencialBlocks.forEach(block => {
        block.campuses?.forEach(campus => {
          if (campus !== 'VIR') {
            sedesPresencialesExistentes.add(campus)
          }
        })
      })
      
      // Consolidar: sedes del nuevo bloque + sedes de bloques presenciales existentes
      const sedesNuevas = availabilityData.campuses.filter(c => c !== 'VIR')
      const sedesConsolidadas = Array.from(new Set([...sedesNuevas, ...sedesPresencialesExistentes]))
      
      // Si hay consolidación, actualizar el payload
      if (sedesPresencialesExistentes.size > 0) {
        const sedesConsolidadasNombres = Array.from(sedesPresencialesExistentes).map(c => getCampusName(c, allCampuses))
        console.log(`Consolidando sedes de bloques PRESENCIAL existentes: ${sedesConsolidadasNombres.join(', ')}`)
        
        // Actualizar los campuses para incluir todas las sedes consolidadas + VIR
        availabilityData.campuses = [...sedesConsolidadas, 'VIR']
        
        // Mostrar mensaje informativo al usuario
        if (sedesConsolidadasNombres.length > 0) {
          setTimeout(() => {
            setInfoMessage(
              `Se consolidaron las sedes ${sedesConsolidadasNombres.join(', ')} de bloques existentes con tu selección para ${formatDay(availabilityData.dayOfWeek)} en turno ${formatShift(availabilityData.shift)}.`
            )
          }, 500)
        }
      }
      
      // Eliminar bloque VIRTUAL
      const virtualBlock = availability.find(
        b => b.dayOfWeek === availabilityData.dayOfWeek && 
             b.shift === availabilityData.shift && 
             b.modality === 'VIRTUAL'
      )
      
      if (virtualBlock && virtualBlock.id) {
        const virtualBlockId = virtualBlock.id
        console.log('Eliminando bloque VIRTUAL redundante (incluido en AMBAS):', virtualBlock)
        
        setAvailability(prev => prev.filter(b => b.id !== virtualBlockId))
        
        retryOperation(() => deleteAvailability(virtualBlockId), 2, 1000).then(success => {
          if (!success) {
            console.error('Error al eliminar bloque virtual redundante después de reintentos')
            refetchAvailability()
          }
        })
      }
      
      // Eliminar TODOS los bloques PRESENCIAL del mismo día y turno (ya consolidamos sus sedes)
      presencialBlocks.forEach(presencialBlock => {
        if (!presencialBlock.id) return
        
        const presencialBlockId = presencialBlock.id
        console.log('Eliminando bloque PRESENCIAL (consolidado en AMBAS):', presencialBlock)
        
        setAvailability(prev => prev.filter(b => b.id !== presencialBlockId))
        
        retryOperation(() => deleteAvailability(presencialBlockId), 2, 1000).then(success => {
          if (!success) {
            console.error('Error al eliminar bloque presencial después de reintentos')
            refetchAvailability()
          }
        })
      })
    }
    
    // Buscar si ya existe un bloque con el mismo día + turno + modalidad
    const existingBlock = availability.find(
      b => b.dayOfWeek === availabilityData.dayOfWeek && 
           b.shift === availabilityData.shift && 
           b.modality === availabilityData.modality
    )
    
    if (existingBlock) {
      // Verificar si hay sedes nuevas para agregar
      const existingCampuses = existingBlock.campuses || []
      const newCampuses = availabilityData.campuses.filter(
        campus => !existingCampuses.includes(campus)
      )
      
      if (newCampuses.length === 0) {
        // Bloque idéntico ya existe - omitir silenciosamente (para creación múltiple)
        console.log('Bloque duplicado omitido:', availabilityData)
        return
      }
      
      const updatedCampuses = [...existingCampuses, ...newCampuses]
      const updatedBlock = { ...existingBlock, campuses: updatedCampuses }
      
      if (!existingBlock.id) {
        setErrorMessage("Error: El bloque no tiene ID válido.")
        return
      }
      
      const existingBlockId = existingBlock.id // Capturar ID para uso en closure
      
      // 🔍 LOG TEMPORAL - Request PATCH
      // IMPORTANTE: updatedCampuses contiene strings - UUIDs de sedes como strings, o "VIR" como caso especial
      console.log(`PATCH /teachers/me/availability/${existingBlockId}`)
      console.log('Request Body:', JSON.stringify({ campuses: updatedCampuses }, null, 2))
      console.log('Bloque existente:', existingBlock)
      console.log('Sedes nuevas a agregar:', newCampuses)
      
      // Optimistic Update: Actualizar inmediatamente en la UI
      setAvailability(prev => prev.map(b => 
        b.id === existingBlockId ? updatedBlock : b
      ))
      
      // Hacer la petición real al backend con retry
      retryOperation(() => updateAvailabilityBlock(existingBlockId, { campuses: updatedCampuses }), 2, 1000).then(success => {
        console.log('Respuesta PATCH availability:', success ? 'SUCCESS' : 'FAILED')
        if (success) {
          failedAvailabilityAttemptsRef.current = 0
        } else {
          // Falló después de reintentos
          failedAvailabilityAttemptsRef.current++
          
          // Rollback: Restaurar el bloque original
          setAvailability(prev => prev.map(b => 
            b.id === existingBlockId ? existingBlock : b
          ))
          
          // Si hay múltiples fallos, sincronizar
          if (failedAvailabilityAttemptsRef.current >= 2) {
            console.log('Múltiples fallos detectados, sincronizando con servidor...')
            setInfoMessage("Se detectaron problemas de conexión. Sincronizando con el servidor...")
            refetchAvailability().then(() => {
              failedAvailabilityAttemptsRef.current = 0
            })
          } else {
            setErrorMessage("Error al actualizar el bloque de disponibilidad después de 3 intentos.")
          }
        }
      })
    } else {
      // POST: Crear nuevo bloque
      const newBlock = {
        id: Date.now() + Math.random(), // ID temporal optimista único
        dayOfWeek: availabilityData.dayOfWeek,
        shift: availabilityData.shift as 'MANIANA' | 'TARDE' | 'NOCHE',
        modality: availabilityData.modality as 'PRESENCIAL' | 'VIRTUAL' | 'AMBAS',
        campuses: availabilityData.campuses
      }
      
      // 🔍 LOG TEMPORAL - Request POST
      // IMPORTANTE: campuses contiene strings - UUIDs de sedes como strings, o "VIR" como caso especial
      const requestPayload = {
        dayOfWeek: newBlock.dayOfWeek,
        shift: newBlock.shift,
        modality: newBlock.modality,
        campuses: newBlock.campuses // Array de strings: UUIDs (strings) o "VIR" (string especial para virtual)
      }
      console.log('POST /teachers/me/availability')
      console.log('Request Body:', JSON.stringify(requestPayload, null, 2))
      console.log('Datos desde modal:', availabilityData)
      
      // Optimistic Update: Agregar inmediatamente a la UI
      setAvailability(prev => [...prev, newBlock])
      
      // Hacer la petición real en background con retry
      retryOperation(() => addAvailability(requestPayload), 2, 1000).then(createdBlock => {
        console.log('Respuesta POST availability:', createdBlock ? 'SUCCESS' : 'FAILED')
        if (createdBlock) {
          // Reemplazar el bloque optimista con el bloque real del servidor
          setAvailability(prev => prev.map(b => 
            b.id === newBlock.id ? createdBlock : b
          ))
          // Resetear contador de fallos
          failedAvailabilityAttemptsRef.current = 0
        } else {
          // Falló después de reintentos
          failedAvailabilityAttemptsRef.current++
          
          // Rollback: Remover el bloque optimista
          setAvailability(prev => prev.filter(b => b.id !== newBlock.id))
          
          // Si hay múltiples fallos consecutivos, hacer refetch para sincronizar
          if (failedAvailabilityAttemptsRef.current >= 2) {
            console.log('Múltiples fallos detectados, sincronizando con servidor...')
            setInfoMessage("Se detectaron problemas de conexión. Sincronizando con el servidor...")
            refetchAvailability().then(() => {
              failedAvailabilityAttemptsRef.current = 0
            })
          } else {
            setErrorMessage("Error al agregar el bloque de disponibilidad después de 3 intentos. Por favor, intenta nuevamente.")
          }
        }
      })
    }
  }

  const handleEditAvailabilityClick = (block: any) => {
    setEditingBlock(block)
    setShowEditAvailabilityModal(true)
  }

  const handleUpdateAvailability = (data: { campuses: string[], modality?: string }) => {
    if (!editingBlock || !editingBlock.id) return
    
    const blockId = editingBlock.id
    const updatedBlock = { 
      ...editingBlock, 
      campuses: data.campuses,
      ...(data.modality && { modality: data.modality as any })
    }
    
    // 🔍 LOG TEMPORAL - Request PATCH
    // IMPORTANTE: data.campuses contiene strings - UUIDs de sedes como strings, o "VIR" como caso especial
    console.log(`PATCH /teachers/me/availability/${blockId}`)
    console.log('Request Body:', JSON.stringify(data, null, 2))
    console.log('Bloque original:', editingBlock)
    console.log('Datos actualizados:', data)
    
    // VALIDACIÓN: Si se intenta cambiar a VIRTUAL cuando ya existe AMBAS (mismo día + turno)
    if (data.modality === 'VIRTUAL') {
      const ambasBlock = availability.find(
        b => b.id !== blockId && // No el que estamos editando
             b.dayOfWeek === editingBlock.dayOfWeek && 
             b.shift === editingBlock.shift && 
             b.modality === 'AMBAS'
      )
      
      if (ambasBlock) {
        setShowEditAvailabilityModal(false)
        setEditingBlock(null)
        setInfoMessage(
          `Ya existe una disponibilidad con modalidad "Ambas (Presencial y Virtual)" para ${formatDay(editingBlock.dayOfWeek)} en turno ${formatShift(editingBlock.shift)}, que ya incluye la modalidad virtual.`
        )
        return
      }
    }
    
    // VALIDACIÓN: Si se intenta cambiar a PRESENCIAL cuando ya existe AMBAS con las mismas sedes (mismo día + turno)
    if (data.modality === 'PRESENCIAL' || (data.modality === undefined && editingBlock.modality === 'PRESENCIAL')) {
      const ambasBlock = availability.find(
        b => b.id !== blockId && // No el que estamos editando
             b.dayOfWeek === editingBlock.dayOfWeek && 
             b.shift === editingBlock.shift && 
             b.modality === 'AMBAS'
      )
      
      if (ambasBlock) {
        // Verificar si las sedes que se intentan agregar ya están en el bloque AMBAS
        const campusesEnAmbas = ambasBlock.campuses || []
        const sedesYaIncluidas = data.campuses.filter(
          campus => campusesEnAmbas.includes(campus)
        )
        
        if (sedesYaIncluidas.length > 0) {
          const sedesNombres = sedesYaIncluidas.map(code => getCampusName(code, allCampuses)).join(', ')
          setShowEditAvailabilityModal(false)
          setEditingBlock(null)
          setInfoMessage(
            `Ya existe una disponibilidad con modalidad "Ambas (Presencial y Virtual)" para ${formatDay(editingBlock.dayOfWeek)} en turno ${formatShift(editingBlock.shift)}, que ya incluye ${sedesYaIncluidas.length > 1 ? 'las sedes' : 'la sede'}: ${sedesNombres}.`
          )
          return
        }
      }
    }
    
    // CONSOLIDACIÓN INTELIGENTE: Si se está cambiando a modalidad AMBAS
    if (data.modality === 'AMBAS') {
      // Recolectar todas las sedes únicas de bloques PRESENCIAL existentes
      const presencialBlocks = availability.filter(
        b => b.id !== blockId && // No el que estamos editando
             b.dayOfWeek === editingBlock.dayOfWeek && 
             b.shift === editingBlock.shift && 
             b.modality === 'PRESENCIAL'
      )
      
      // Recolectar sedes de todos los bloques PRESENCIAL
      const sedesPresencialesExistentes = new Set<string>()
      presencialBlocks.forEach(block => {
        block.campuses?.forEach(campus => {
          if (campus !== 'VIR') {
            sedesPresencialesExistentes.add(campus)
          }
        })
      })
      
      // Consolidar: sedes del bloque editado + sedes de bloques presenciales existentes
      const sedesActuales = data.campuses.filter(c => c !== 'VIR')
      const sedesConsolidadas = Array.from(new Set([...sedesActuales, ...sedesPresencialesExistentes]))
      
      // Si hay consolidación, actualizar los campuses
      if (sedesPresencialesExistentes.size > 0) {
        const sedesConsolidadasNombres = Array.from(sedesPresencialesExistentes).map(c => getCampusName(c, allCampuses))
        console.log(`Consolidando sedes de bloques PRESENCIAL existentes: ${sedesConsolidadasNombres.join(', ')}`)
        
        // Actualizar los campuses para incluir todas las sedes consolidadas + VIR
        data.campuses = [...sedesConsolidadas, 'VIR']
        updatedBlock.campuses = data.campuses
        
        // Mostrar mensaje informativo al usuario
        if (sedesConsolidadasNombres.length > 0) {
          setTimeout(() => {
            setInfoMessage(
              `Se consolidaron las sedes ${sedesConsolidadasNombres.join(', ')} de bloques existentes con tu edición para ${formatDay(editingBlock.dayOfWeek)} en turno ${formatShift(editingBlock.shift)}.`
            )
          }, 500)
        }
      }
      
      // Eliminar bloque VIRTUAL
      const virtualBlock = availability.find(
        b => b.id !== blockId && // No el que estamos editando
             b.dayOfWeek === editingBlock.dayOfWeek && 
             b.shift === editingBlock.shift && 
             b.modality === 'VIRTUAL'
      )
      
      if (virtualBlock && virtualBlock.id) {
        const virtualBlockId = virtualBlock.id
        console.log('Eliminando bloque VIRTUAL redundante (incluido en AMBAS):', virtualBlock)
        
        setAvailability(prev => prev.filter(b => b.id !== virtualBlockId))
        
        retryOperation(() => deleteAvailability(virtualBlockId), 2, 1000).then(success => {
          if (!success) {
            console.error('Error al eliminar bloque virtual redundante después de reintentos')
            refetchAvailability()
          }
        })
      }
      
      // Eliminar TODOS los bloques PRESENCIAL del mismo día y turno (ya consolidamos sus sedes)
      presencialBlocks.forEach(presencialBlock => {
        if (!presencialBlock.id) return
        
        const presencialBlockId = presencialBlock.id
        console.log('Eliminando bloque PRESENCIAL (consolidado en AMBAS):', presencialBlock)
        
        setAvailability(prev => prev.filter(b => b.id !== presencialBlockId))
        
        retryOperation(() => deleteAvailability(presencialBlockId), 2, 1000).then(success => {
          if (!success) {
            console.error('Error al eliminar bloque presencial después de reintentos')
            refetchAvailability()
          }
        })
      })
    }
    
    // Cerrar modal primero
    setShowEditAvailabilityModal(false)
    
    // Optimistic Update
    setAvailability(prev => prev.map(b => 
      b.id === blockId ? updatedBlock : b
    ))
    
    // Hacer la petición real al backend con retry
    retryOperation(() => updateAvailabilityBlock(blockId, data), 2, 1000).then(success => {
      console.log('Respuesta PATCH availability:', success ? 'SUCCESS' : 'FAILED')
      if (success) {
        failedAvailabilityAttemptsRef.current = 0
      } else {
        // Falló después de reintentos
        failedAvailabilityAttemptsRef.current++
        
        // Rollback
        setAvailability(prev => prev.map(b => 
          b.id === blockId ? editingBlock : b
        ))
        
        // Si hay múltiples fallos, sincronizar
        if (failedAvailabilityAttemptsRef.current >= 2) {
          console.log('Múltiples fallos detectados, sincronizando con servidor...')
          setInfoMessage("Se detectaron problemas de conexión. Sincronizando con el servidor...")
          refetchAvailability().then(() => {
            failedAvailabilityAttemptsRef.current = 0
          })
        } else {
          setErrorMessage("Error al actualizar el bloque de disponibilidad después de 3 intentos.")
        }
      }
    })
    
    setEditingBlock(null)
  }

  const handleDeleteClick = (
    type: "materia" | "horario", 
    subjectId?: number, 
    subjectName?: string,
    blockId?: number
  ) => {
    setDeleteTarget({ type, subjectId, subjectName, blockId })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === "materia" && deleteTarget.subjectId) {
        const subjectIdToDelete = deleteTarget.subjectId
        const targetName = deleteTarget.subjectName
        const previousProposals = [...proposals]
        
        // Cerrar modal primero
        setDeleteTarget(null)
        setShowDeleteModal(false)
        
        // Optimistic Update: Eliminar inmediatamente de la UI
        setProposals(prev => prev.filter(p => p.subjectId !== subjectIdToDelete))
        
        // Hacer la petición real al backend en background (sin await)
        deleteProposal(subjectIdToDelete).then(success => {
          if (!success) {
            // Rollback: Restaurar la propuesta y mostrar error
            setProposals(previousProposals)
            setErrorMessage(`Error al eliminar "${targetName}". Por favor, intenta nuevamente.`)
          }
        })
      } else if (deleteTarget.type === "horario" && deleteTarget.blockId !== undefined) {
        const blockIdToDelete = deleteTarget.blockId
        const previousAvailability = [...availability]
        
        // 🔍 LOG TEMPORAL - Request DELETE
        console.log('DELETE /teachers/me/availability/' + blockIdToDelete)
        console.log('Block ID a eliminar:', blockIdToDelete)
        console.log('Bloque completo:', availability.find(b => b.id === blockIdToDelete))
        
        // Cerrar modal primero
        setDeleteTarget(null)
        setShowDeleteModal(false)
        
        // Optimistic Update: Eliminar bloque de disponibilidad inmediatamente
        setAvailability(prev => prev.filter(b => b.id !== blockIdToDelete))
        
        // Hacer la petición real al backend en background con retry
        retryOperation(() => deleteAvailability(blockIdToDelete), 2, 1000).then(success => {
          console.log('Respuesta DELETE availability:', success ? 'SUCCESS' : 'FAILED')
          if (success) {
            failedAvailabilityAttemptsRef.current = 0
          } else {
            // Falló después de reintentos
            failedAvailabilityAttemptsRef.current++
            
            // Rollback: Restaurar el bloque
            setAvailability(previousAvailability)
            
            // Si hay múltiples fallos, sincronizar
            if (failedAvailabilityAttemptsRef.current >= 2) {
              console.log('Múltiples fallos detectados, sincronizando con servidor...')
              setInfoMessage("Se detectaron problemas de conexión. Sincronizando con el servidor...")
              refetchAvailability().then(() => {
                failedAvailabilityAttemptsRef.current = 0
              })
            } else {
              setErrorMessage("Error al eliminar el bloque de disponibilidad después de 3 intentos.")
            }
          }
        })
      }
    }
  }

  const handleToggleClick = (proposalId: number, subjectName: string, currentActive: boolean) => {
    setToggleTarget({ proposalId, subjectName, currentActive })
    setShowToggleModal(true)
  }

  const handleConfirmToggle = () => {
    if (toggleTarget) {
      const proposalId = toggleTarget.proposalId
      const proposalName = toggleTarget.subjectName
      const wasActive = toggleTarget.currentActive
      
      // Cerrar modal primero para no bloquear la UI
      setToggleTarget(null)
      setShowToggleModal(false)
      
      // Optimistic Update: Invertir el estado active inmediatamente
      setProposals(prev => prev.map(p => 
        p.proposalId === proposalId 
          ? { ...p, active: !p.active }
          : p
      ))
      
      // Hacer la petición real al backend en background (sin await)
      toggleProposalAvailability(proposalId).then(success => {
        if (!success) {
          // Rollback: Revertir el cambio y mostrar error
          setProposals(prev => prev.map(p => 
            p.proposalId === proposalId 
              ? { ...p, active: !p.active }
              : p
          ))
          setErrorMessage(`Error al ${wasActive ? 'desactivar' : 'activar'} "${proposalName}". Por favor, intenta nuevamente.`)
        }
      })
    }
  }

  // Auto-ocultar mensaje de error después de 5 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => {
        setInfoMessage(null)
      }, 8000) // 8 segundos para mensajes informativos
      return () => clearTimeout(timer)
    }
  }, [infoMessage])

  // Obtener token para mostrar
  const currentToken = authService.getToken()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 🔐 DEBUG: Token visible para copiar - ELIMINAR DESPUÉS */}
      {currentToken && (
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-4">
          <p className="font-bold text-yellow-800 mb-2">🔐 URL con JWT (copiar y eliminar este bloque después):</p>
          <textarea
            readOnly
            value={`http://localhost:3000/?JWT=${currentToken}`}
            className="w-full h-16 p-2 text-xs font-mono bg-white border rounded resize-none"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo con barra de progreso - Abajo al medio */}
      {infoMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4 animate-in slide-in-from-bottom">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Información</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">{infoMessage}</p>
                </div>
                <button
                  onClick={() => setInfoMessage(null)}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-100 rounded-full"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="h-1 bg-blue-200 relative overflow-hidden">
              <div 
                className="h-full bg-blue-500 animate-progress-bar"
                style={{
                  animation: 'progressBar 8s linear forwards'
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Profile Header */}
      {profileLoading ? (
        <ProfileHeaderSkeleton />
      ) : profileError ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-red-600">Error al cargar el perfil del docente</div>
          </CardContent>
        </Card>
      ) : profile ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 flex-shrink-0 rounded-full ${getUserColor(profile.uuid, profile.teacherId)} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                {getInitials(profile.name)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <div className="mt-2">
                  <Badge className={profile.activo ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                    Estado: {profile.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Information */}
      {profileLoading ? (
        <ProfileInfoSkeleton />
      ) : profileError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Información de perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">Error al cargar la información del perfil</div>
          </CardContent>
        </Card>
      ) : profile ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Información de perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{profile.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional</label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{profile.role}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Academic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Información académica</CardTitle>
          <Button className="bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setShowSubjectModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva propuesta
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Propuesta de Materias</h3>
              
              {/* Botón de filtro */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                  {statusFilter.length > 0 && (
                    <span className="bg-slate-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {statusFilter.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Filtrar por estado</div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-2">
                          <input
                            type="checkbox"
                            checked={statusFilter.includes('PENDIENTE')}
                            onChange={() => toggleStatusFilter('PENDIENTE')}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <span className="text-sm text-gray-700">Pendientes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2">
                          <input
                            type="checkbox"
                            checked={statusFilter.includes('APROBADA')}
                            onChange={() => toggleStatusFilter('APROBADA')}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Aprobadas</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2">
                          <input
                            type="checkbox"
                            checked={statusFilter.includes('RECHAZADA')}
                            onChange={() => toggleStatusFilter('RECHAZADA')}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Rechazadas</span>
                        </label>
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <div className="text-xs font-medium text-gray-500 mb-2">Otras opciones</div>
                        <label className="flex items-center gap-2 cursor-pointer p-2">
                          <input
                            type="checkbox"
                            checked={showInactiveOnly}
                            onChange={toggleInactiveFilter}
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700">Solo inactivas</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags de filtros activos */}
            {(statusFilter.length > 0 || showInactiveOnly) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {statusFilter.map(status => (
                  <span
                    key={status}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${
                      status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'APROBADA' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {status === 'PENDIENTE' ? 'Pendientes' : status === 'APROBADA' ? 'Aprobadas' : 'Rechazadas'}
                    <button
                      onClick={() => removeStatusFilter(status)}
                      className="hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {showInactiveOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                    Solo inactivas
                    <button
                      onClick={toggleInactiveFilter}
                      className="hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Limpiar todos
                </button>
              </div>
            )}
          </div>
          {(proposalsLoading && isInitialLoad) ? (
            <ProposalsSkeleton />
          ) : proposalsError ? (
            <div className="text-red-600 text-center py-8">Error al cargar las propuestas</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay propuestas de materias aún</p>
              <p className="text-sm mt-2">Crea una nueva propuesta para comenzar</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron propuestas con los filtros seleccionados</p>
              <button
                onClick={clearFilters}
                className="text-sm mt-2 text-slate-800 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[360px]">
                {paginatedProposals.map((propuesta) => (
                <Card 
                  key={propuesta.proposalId} 
                  className="border shadow-sm relative transition-all h-[160px] flex flex-col"
                >
                  <CardContent className="p-4 flex-1 flex flex-col">
                    {propuesta.status === "PENDIENTE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteClick("materia", propuesta.subjectId, propuesta.subjectName || undefined)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                    {propuesta.status === "APROBADA" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-2 right-2 h-9 w-9 p-0 rounded-full ${
                          propuesta.active
                            ? "text-green-600 hover:text-orange-600 hover:bg-orange-50"
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        onClick={() => handleToggleClick(propuesta.proposalId, propuesta.subjectName || "Propuesta", propuesta.active)}
                        title={propuesta.active ? "Marcar como inactiva" : "Marcar como activa"}
                      >
                        <Power className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-8">
                        <div className="flex items-center mb-3">
                          {propuesta.status === "APROBADA" && propuesta.active && <CheckCircle className="w-6 h-6 text-green-600 mr-2" />}
                          {propuesta.status === "APROBADA" && !propuesta.active && <AlertCircle className="w-6 h-6 text-gray-500 mr-2" />}
                          {propuesta.status === "RECHAZADA" && <XCircle className="w-6 h-6 text-red-600 mr-2" />}
                          {propuesta.status === "PENDIENTE" && <Clock className="w-6 h-6 text-yellow-600 mr-2" />}
                          {propuesta.subjectName === null ? (
                            <div className="relative overflow-hidden h-7 w-48 bg-gray-200 rounded">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                            </div>
                          ) : (
                            <h4 className="font-semibold text-gray-900 text-base">{propuesta.subjectName}</h4>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${getProposalColor(propuesta.status)} text-xs`}>{propuesta.status}</Badge>
                          {propuesta.status === "APROBADA" && propuesta.active && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">ACTIVA</Badge>
                          )}
                          {propuesta.status === "APROBADA" && !propuesta.active && (
                            <Badge className="bg-gray-200 text-gray-700 border-gray-300 text-xs">INACTIVA</Badge>
                          )}
                        </div>
                        {propuesta.status === "PENDIENTE" && propuesta.createdAt && (
                          <div className="mt-3 text-sm text-gray-500">
                            Enviada el: {new Date(propuesta.createdAt).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        )}
                        {propuesta.status === "APROBADA" && !propuesta.active && (
                          <div className="mt-3 text-sm text-gray-900 font-medium flex items-start gap-1.5">
                            <HelpCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span>Inactivo - no se considerará para nuevas asignaciones</span>
                          </div>
                        )}
                        {propuesta.status === "APROBADA" && propuesta.active && propuesta.decidedAt && (
                          <div className="mt-3 text-sm text-gray-500">
                            Aprobada el: {new Date(propuesta.decidedAt).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        )}
                        {propuesta.status === "RECHAZADA" && propuesta.decidedAt && (
                          <div className="mt-3 text-sm text-gray-500">
                            Rechazada el: {new Date(propuesta.decidedAt).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
              
              {/* Paginación */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {totalPages > 1 ? (
                  <>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-slate-800 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Información académica</CardTitle>
          <Button className="bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setShowAvailabilityModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar bloque
          </Button>
        </CardHeader>
        <CardContent>
          {(availabilityLoading && isInitialAvailabilityLoad) ? (
            <AvailabilitySkeleton />
          ) : availabilityError ? (
            <div className="text-red-600 text-center py-8">Error al cargar la disponibilidad</div>
          ) : availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay bloques de disponibilidad aún</p>
              <p className="text-sm mt-2">Agrega tu disponibilidad horaria para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h3 className="font-medium text-gray-900">Disponibilidad Horaria</h3>
                
                {/* Botón de filtro */}
                <div className="relative self-end sm:self-auto" ref={availabilityFilterDropdownRef}>
                  <button
                    onClick={() => setShowAvailabilityFilterDropdown(!showAvailabilityFilterDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtrar</span>
                    {hasAvailabilityFilters && (
                      <span className="bg-slate-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedCampusFilters.length + selectedShiftFilters.length + selectedModalityFilters.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown */}
                  {showAvailabilityFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-64 sm:w-[520px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
                      <div className="p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Filtros por Turno */}
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase">Turno</div>
                            <div className="space-y-1">
                              {['MANIANA', 'TARDE', 'NOCHE'].map(shift => (
                                <label key={shift} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedShiftFilters.includes(shift)}
                                    onChange={() => toggleShiftFilter(shift)}
                                    className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700">{formatShift(shift)}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Filtros por Modalidad */}
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase">Modalidad</div>
                            <div className="space-y-1">
                              {['PRESENCIAL', 'VIRTUAL', 'AMBAS'].map(modality => (
                                <label key={modality} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedModalityFilters.includes(modality)}
                                    onChange={() => toggleModalityFilter(modality)}
                                    className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700 break-words">{formatModality(modality)}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Filtros por Sede */}
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase">Sede</div>
                            <div className="space-y-1">
                              {Array.from(new Set(availability.flatMap(b => b.campuses || []))).sort().map(campus => (
                                <label key={campus} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedCampusFilters.includes(campus)}
                                    onChange={() => toggleCampusFilter(campus)}
                                    className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700">{getCampusName(campus, allCampuses)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags de filtros activos */}
              {hasAvailabilityFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedShiftFilters.map(shift => (
                    <span
                      key={shift}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800"
                    >
                      {formatShift(shift)}
                      <button
                        onClick={() => toggleShiftFilter(shift)}
                        className="hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedModalityFilters.map(modality => (
                    <span
                      key={modality}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800"
                    >
                      {formatModality(modality)}
                      <button
                        onClick={() => toggleModalityFilter(modality)}
                        className="hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedCampusFilters.map(campus => (
                    <span
                      key={campus}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-100 text-emerald-800"
                    >
                      {getCampusName(campus, allCampuses)}
                      <button
                        onClick={() => toggleCampusFilter(campus)}
                        className="hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearAvailabilityFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Limpiar todos
                  </button>
                </div>
              )}
              
              {/* Pestañas de días - Responsive con scroll horizontal en móvil */}
              <div className="flex gap-2 border-b overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
                {weekDays.map(day => {
                  // Contar bloques del día aplicando filtros
                  let dayBlocks = availability.filter(b => b.dayOfWeek === day.key)
                  
                  if (selectedCampusFilters.length > 0) {
                    dayBlocks = dayBlocks.filter(b => 
                      selectedCampusFilters.some(campus => b.campuses?.includes(campus))
                    )
                  }
                  if (selectedShiftFilters.length > 0) {
                    dayBlocks = dayBlocks.filter(b => selectedShiftFilters.includes(b.shift))
                  }
                  if (selectedModalityFilters.length > 0) {
                    dayBlocks = dayBlocks.filter(b => selectedModalityFilters.includes(b.modality))
                  }
                  
                  const dayCount = dayBlocks.length
                  
                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key)}
                      className={`relative flex-shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-t-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                        selectedDay === day.key
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">{formatDay(day.key)}</span>
                      <span className="inline sm:hidden">{day.label}</span>
                      {dayCount > 0 && (
                        <span className={`ml-1 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs rounded-full ${
                          selectedDay === day.key
                            ? 'bg-white text-slate-800'
                            : 'bg-slate-800 text-white'
                        }`}>
                          {dayCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Contenido del día seleccionado */}
              <div className="min-h-[300px]">
                {filteredAvailability.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">Sin disponibilidad para {formatDay(selectedDay)}</p>
                      <p className="text-sm mt-1">Agrega bloques horarios para este día</p>
                    </div>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAvailability.map(block => (
                    <div 
                      key={block.id}
                      className="relative group bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-400 transition-all"
                    >
                      {/* Botones de acción - Visibles en móvil, con hover en desktop */}
                      <div className="absolute top-3 right-3 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditAvailabilityClick(block)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Editar disponibilidad"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick("horario", undefined, undefined, block.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Turno con horario */}
                      <div className="flex items-center gap-2.5 mb-4 pr-20">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${getShiftColor(block.shift)}`}>
                          {getShiftIcon(block.shift)}
                          {formatShift(block.shift)}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {getShiftTime(block.shift)}
                        </span>
                      </div>

                      {/* Modalidad */}
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{formatModality(block.modality)}</span>
                      </div>

                      {/* Sedes */}
                      {block.modality === 'VIRTUAL' ? (
                        <div className="text-sm text-gray-500 italic">Modalidad completamente virtual</div>
                      ) : block.campuses && block.campuses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {block.campuses
                            .filter(campus => campus !== 'VIR')
                            .map((campus, idx) => {
                              // Buscar el índice real en el array original de campuses
                              const originalIndex = block.campuses.indexOf(campus)
                              return (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  {getCampusDisplayName(block, originalIndex, campus, allCampuses)}
                                </span>
                              )
                            })}
                          {/* Si es AMBAS y tiene VIR, mostrar chip especial */}
                          {block.modality === 'AMBAS' && block.campuses.includes('VIR') && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                              <Monitor className="w-3.5 h-3.5" />
                              Virtual
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">Sin sedes asignadas</div>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSubjectModal open={showSubjectModal} onOpenChange={setShowSubjectModal} onAddSubject={handleAddSubject} />
      <AddAvailabilityModal
        open={showAvailabilityModal}
        onOpenChange={setShowAvailabilityModal}
        onAddAvailability={handleAddAvailability}
      />
      <EditAvailabilityModal
        open={showEditAvailabilityModal}
        onOpenChange={setShowEditAvailabilityModal}
        onSave={handleUpdateAvailability}
        currentBlock={editingBlock}
      />
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === "materia" ? "Eliminar propuesta de materia" : "Eliminar disponibilidad horaria"}
        description={
          deleteTarget?.type === "materia"
            ? `¿Estás seguro de que deseas eliminar la propuesta de "${deleteTarget?.subjectName}"? Esta acción no se puede deshacer.`
            : "¿Estás seguro de que deseas eliminar esta disponibilidad horaria? Esta acción no se puede deshacer."
        }
      />
      <ConfirmationModal
        open={showToggleModal}
        onOpenChange={setShowToggleModal}
        onConfirm={handleConfirmToggle}
        title={toggleTarget?.currentActive ? "Marcar propuesta como inactiva" : "Marcar propuesta como activa"}
        description={
          toggleTarget?.currentActive
            ? `Al marcar la propuesta de "${toggleTarget?.subjectName}" como inactiva, NO serás tenido en cuenta para la asignación de nuevos cursos de esta materia. Podrás reactivarla cuando lo necesites.`
            : `Al marcar la propuesta de "${toggleTarget?.subjectName}" como activa, serás tenido en cuenta para la asignación de nuevos cursos de esta materia.`
        }
        confirmText={toggleTarget?.currentActive ? "Desactivar" : "Activar"}
        confirmVariant={toggleTarget?.currentActive ? "warning" : "success"}
        icon="info"
      />
    </div>
  )
}
