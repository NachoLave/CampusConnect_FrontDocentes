"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Loader2 } from "lucide-react"
import { useCampuses } from "@/lib/hooks"

interface EditAvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { campuses: string[], modality?: string }) => void
  currentBlock: {
    dayOfWeek: string
    shift: string
    modality: string
    campuses: string[]
  } | null
}

export function EditAvailabilityModal({ 
  open, 
  onOpenChange, 
  onSave, 
  currentBlock 
}: EditAvailabilityModalProps) {
  const [selectedModality, setSelectedModality] = useState<string>("")
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([])
  
  // Obtener sedes activas del backend
  const { campuses, isLoading: campusesLoading, error: campusesError } = useCampuses()

  // Inicializar modalidad y sedes cuando se abre el modal
  useEffect(() => {
    if (currentBlock && open) {
      setSelectedModality(currentBlock.modality)
      // Filtrar VIR de las sedes seleccionadas para mostrar solo físicas
      // currentBlock.campuses ya contiene UUIDs
      setSelectedCampuses(currentBlock.campuses.filter(c => c !== 'VIR') || [])
    }
  }, [currentBlock, open])

  // Lógica de modalidades
  const isVirtual = selectedModality === 'VIRTUAL'
  const isPresencial = selectedModality === 'PRESENCIAL'
  // Nota: Si el bloque actual es 'AMBAS', se mostrará pero no se podrá cambiar a 'AMBAS' desde el front
  
  // Determinar si se cambió la modalidad
  const modalityChanged = currentBlock && selectedModality !== currentBlock.modality

  // Filtrar sedes físicas (solo las que tienen UUID)
  const filteredCampuses = campuses.filter(campus => campus.uuid)

  const handleModalityChange = (modality: string) => {
    // No permitir cambiar a AMBAS desde el front
    if (modality === 'AMBAS') {
      return
    }
    setSelectedModality(modality)
    // Al cambiar a Virtual, limpiar sedes
    if (modality === 'VIRTUAL') {
      setSelectedCampuses([])
    }
  }

  const handleCampusChange = (campusUuid: string, checked: boolean) => {
    if (checked) {
      setSelectedCampuses(prev => [...prev, campusUuid])
    } else {
      setSelectedCampuses(prev => prev.filter(c => c !== campusUuid))
    }
  }

  const handleSave = () => {
    let campusesToSend: string[] = []
    
    // Determinar campuses según modalidad
    // IMPORTANTE: campusesToSend es un array de strings donde:
    // - Cada UUID de sede se envía como string
    // - "VIR" es el único valor especial permitido (también es string)
    // Todos los valores son strings, sin restricciones adicionales
      if (isVirtual) {
        campusesToSend = ["VIR"] // Solo "VIR" para modalidad virtual
      } else {
        // PRESENCIAL: Solo UUIDs de sedes físicas (todos son strings)
        campusesToSend = selectedCampuses // selectedCampuses contiene UUIDs como strings
      }
    
    // Si cambió la modalidad, enviarla también
    if (modalityChanged) {
      onSave({ campuses: campusesToSend, modality: selectedModality })
    } else {
      onSave({ campuses: campusesToSend })
    }
    
    onOpenChange(false)
  }

  // Validación: 
  // - VIRTUAL: siempre válido
  // - PRESENCIAL: debe tener al menos una sede física
  const canSave = isVirtual || selectedCampuses.length > 0

  const formatDay = (day: string): string => {
    const dayMap: Record<string, string> = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes'
    }
    return dayMap[day] || day
  }

  const formatShift = (shift: string): string => {
    const shiftMap: Record<string, string> = {
      'MANIANA': 'Mañana',
      'MANANA': 'Mañana', // Por compatibilidad
      'TARDE': 'Tarde',
      'NOCHE': 'Noche'
    }
    return shiftMap[shift] || shift
  }

  const formatModality = (modality: string): string => {
    const modalityMap: Record<string, string> = {
      'PRESENCIAL': 'Presencial',
      'VIRTUAL': 'Virtual',
      'AMBAS': 'Ambas (Presencial y Virtual)' // Solo para mostrar bloques existentes
    }
    return modalityMap[modality] || modality
  }

  if (!currentBlock) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Editar Disponibilidad
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información fija del bloque */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Día:</span>
              <span className="font-semibold text-gray-900">{formatDay(currentBlock.dayOfWeek)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Turno:</span>
              <span className="font-semibold text-gray-900">{formatShift(currentBlock.shift)}</span>
            </div>
          </div>

          {/* Selector de modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Modalidad
            </label>
            {currentBlock.modality === 'AMBAS' ? (
              <div className="p-3 rounded-lg bg-gray-50 border-2 border-gray-200 text-sm text-gray-600">
                {formatModality(currentBlock.modality)} (No se puede editar)
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {['PRESENCIAL', 'VIRTUAL'].map((modality) => (
                  <button
                    key={modality}
                    onClick={() => handleModalityChange(modality)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all border-2 ${
                      selectedModality === modality
                        ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-slate-300'
                    }`}
                  >
                    {formatModality(modality)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selector de sedes */}
          {!isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Sedes físicas
              </label>
              
              {campusesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando sedes...
                </div>
              ) : campusesError ? (
                <div className="text-sm text-red-600">
                  Error al cargar las sedes
                </div>
              ) : filteredCampuses.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                  No hay sedes disponibles
                </div>
              ) : (
                <div className="space-y-3 border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  {filteredCampuses.map((campus) => (
                    <div key={campus.uuid} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${campus.uuid}`}
                        checked={selectedCampuses.includes(campus.uuid!)}
                        onCheckedChange={(checked) => handleCampusChange(campus.uuid!, checked as boolean)}
                      />
                      <label 
                        htmlFor={`edit-${campus.uuid}`} 
                        className="text-sm flex-1 text-gray-900 cursor-pointer"
                      >
                        {campus.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensajes informativos */}
          {isVirtual && (
            <div className="text-sm text-gray-500 italic p-3 bg-blue-50 rounded-lg border border-blue-200">
              💡 La modalidad Virtual no requiere sedes físicas
            </div>
          )}

          {currentBlock.modality === 'AMBAS' && (
            <div className="text-sm text-gray-600 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <strong>Nota:</strong> Este bloque tiene modalidad "Ambas (Presencial y Virtual)". No se puede editar desde el frontend.
            </div>
          )}

          {/* Mensaje de validación */}
          {!isVirtual && selectedCampuses.length === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              ⚠️ Debes seleccionar al menos una sede física para modalidad {formatModality(selectedModality)}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!canSave || currentBlock.modality === 'AMBAS'}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

