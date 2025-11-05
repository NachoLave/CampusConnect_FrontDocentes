"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Filter, X, ChevronDown } from "lucide-react"
import { AddSubjectModal } from "@/components/modals/add-subject-modal"
import { AddAvailabilityModal } from "@/components/modals/add-availability-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { useTeacherProfile, useProposals, useAvailability } from "@/lib/hooks"

// Función para obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Paleta estandarizada de colores para avatares
function getUserColor(teacherId?: number): string {
  if (!teacherId) return 'bg-gray-500'
  
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
  return colors[teacherId % colors.length]
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
        <div className="flex items-center text-sm text-gray-600 mt-4">
          <AlertCircle className="w-4 h-4 mr-2" />
          Los datos de perfil se sincronizan desde Backoffice
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
    'MANANA': 'Mañana',
    'TARDE': 'Tarde',
    'NOCHE': 'Noche'
  }
  return shiftMap[shift] || shift
}

// Función para formatear el día
function formatDay(day: string): string {
  const dayMap: Record<string, string> = {
    'LUNES': 'Lunes',
    'MARTES': 'Martes',
    'MIERCOLES': 'Miércoles',
    'JUEVES': 'Jueves',
    'VIERNES': 'Viernes',
    'SABADO': 'Sábado',
    'DOMINGO': 'Domingo'
  }
  return dayMap[day] || day
}

// Función para formatear la modalidad
function formatModality(modality: string): string {
  const modalityMap: Record<string, string> = {
    'PRESENCIAL': 'Presencial',
    'VIRTUAL': 'Virtual',
    'HIBRIDA': 'Híbrida'
  }
  return modalityMap[modality] || modality
}

export default function PerfilPage() {
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ 
    type: "materia" | "horario"
    subjectId?: number
    subjectName?: string
    index?: number 
  } | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Obtener datos desde el backend
  const { profile, isLoading: profileLoading, error: profileError } = useTeacherProfile()
  const { proposals, isLoading: proposalsLoading, error: proposalsError, createProposal, deleteProposal, refetch: refetchProposals } = useProposals()
  const { availability, isLoading: availabilityLoading, error: availabilityError, updateAvailability } = useAvailability()

  // Filtrar propuestas por estado
  const filteredProposals = useMemo(() => {
    if (statusFilter.length === 0) return proposals
    return proposals.filter(p => statusFilter.includes(p.status))
  }, [proposals, statusFilter])

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
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
    }

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  const handleAddSubject = async (subjectId: number) => {
    // Actualización optimista: refetch inmediatamente después de crear
    createProposal(subjectId).then(() => {
      refetchProposals()
    })
    setShowSubjectModal(false)
  }

  const handleAddAvailability = async (availabilityData: any) => {
    const newBlock = {
      dayOfWeek: availabilityData.dia.toUpperCase(),
      shift: availabilityData.turno.toUpperCase() as 'MANANA' | 'TARDE' | 'NOCHE',
      modality: availabilityData.modalidad[0].toUpperCase() as 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA',
      campuses: availabilityData.sedes
    }
    
    // Agregar el nuevo bloque a los existentes
    await updateAvailability([...availability, newBlock])
    setShowAvailabilityModal(false)
  }

  const handleDeleteClick = (
    type: "materia" | "horario", 
    subjectId?: number, 
    subjectName?: string,
    index?: number
  ) => {
    setDeleteTarget({ type, subjectId, subjectName, index })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      if (deleteTarget.type === "materia" && deleteTarget.subjectId) {
        // Actualización optimista: refetch inmediatamente después de eliminar
        deleteProposal(deleteTarget.subjectId).then(() => {
          refetchProposals()
        })
      } else if (deleteTarget.type === "horario" && deleteTarget.index !== undefined) {
        // Eliminar el bloque de disponibilidad por índice
        const newAvailability = availability.filter((_, i) => i !== deleteTarget.index)
        await updateAvailability(newAvailability)
      }
      setDeleteTarget(null)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
              <div className={`w-20 h-20 flex-shrink-0 rounded-full ${getUserColor(profile.teacherId)} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                {getInitials(profile.name)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">LEGAJO {profile.legajo}</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Legajo</label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{profile.legajo}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional</label>
                <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{profile.email}</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-4">
              <AlertCircle className="w-4 h-4 mr-2" />
              Los datos de perfil se sincronizan desde Backoffice
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
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags de filtros activos */}
            {statusFilter.length > 0 && (
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
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Limpiar todos
                </button>
              </div>
            )}
          </div>
          {proposalsLoading ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProposals.map((propuesta) => (
                <Card key={propuesta.proposalId} className="border shadow-sm relative">
                  <CardContent className="p-4">
                    {propuesta.status === "PENDIENTE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteClick("materia", propuesta.subjectId, propuesta.subjectName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-8">
                        <div className="flex items-center mb-2">
                          {propuesta.status === "APROBADA" && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                          {propuesta.status === "RECHAZADA" && <XCircle className="w-5 h-5 text-red-600 mr-2" />}
                          {propuesta.status === "PENDIENTE" && <Clock className="w-5 h-5 text-yellow-600 mr-2" />}
                          <h4 className="font-semibold text-gray-900">{propuesta.subjectName}</h4>
                        </div>
                        <Badge className={getProposalColor(propuesta.status)}>{propuesta.status}</Badge>
                        {(propuesta.status === "APROBADA" || propuesta.status === "RECHAZADA") && propuesta.decidedAt && (
                          <div className="mt-2 text-xs text-gray-500">
                            {propuesta.status === "APROBADA" ? "Aprobada el:" : "Rechazada el:"} {new Date(propuesta.decidedAt).toLocaleDateString('es-ES', { 
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
          )}
          <div className="text-center text-sm text-gray-600 mt-6">
            Las materias deben ser aprobadas por el equipo de Backoffice
          </div>
        </CardContent>
      </Card>

      {/* Schedule Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Disponibilidad Horaria</CardTitle>
          <Button className="bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setShowAvailabilityModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar bloque
          </Button>
        </CardHeader>
        <CardContent>
          {availabilityLoading ? (
            <AvailabilitySkeleton />
          ) : availabilityError ? (
            <div className="text-red-600 text-center py-8">Error al cargar la disponibilidad</div>
          ) : availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay bloques de disponibilidad aún</p>
              <p className="text-sm mt-2">Agrega tu disponibilidad horaria para comenzar</p>
            </div>
          ) : (
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
                  {availability.map((block, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 text-gray-900">{formatDay(block.dayOfWeek)}</td>
                      <td className="py-3 px-4 text-gray-900">{formatShift(block.shift)}</td>
                      <td className="py-3 px-4 text-gray-900">{formatModality(block.modality)}</td>
                      <td className="py-3 px-4 text-gray-900">{block.campuses.join(', ') || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick("horario", undefined, undefined, index)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  )
}
