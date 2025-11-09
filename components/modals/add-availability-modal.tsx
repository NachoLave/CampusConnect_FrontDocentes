"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2, Sun, Sunset, Moon, Monitor, Calendar, MapPin } from "lucide-react"
import { useCampuses } from "@/lib/hooks"

interface AddAvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAvailability: (availability: {
    dayOfWeek: string
    shift: string
    modality: string
    campuses: string[]
  }) => void
}

export function AddAvailabilityModal({ open, onOpenChange, onAddAvailability }: AddAvailabilityModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])
  const [selectedModality, setSelectedModality] = useState("")
  const [locations, setLocations] = useState<string[]>([])

  // Obtener sedes activas del backend
  const { campuses, isLoading: campusesLoading, error: campusesError } = useCampuses()

  // Mapeo de valores visuales a valores de API
  const dayMapping: Record<string, string> = {
    "Lunes": "LUNES",
    "Martes": "MARTES",
    "Miércoles": "MIERCOLES",
    "Jueves": "JUEVES",
    "Viernes": "VIERNES"
  }

  const shiftMapping: Record<string, string> = {
    "Mañana": "MANIANA",
    "Tarde": "TARDE",
    "Noche": "NOCHE"
  }

  const modalityMapping: Record<string, string> = {
    "Presencial": "PRESENCIAL",
    "Virtual": "VIRTUAL",
    "Ambas": "AMBAS"
  }

  const days = [
    { key: "Lunes", label: "Lun" },
    { key: "Martes", label: "Mar" },
    { key: "Miércoles", label: "Mié" },
    { key: "Jueves", label: "Jue" },
    { key: "Viernes", label: "Vie" }
  ]
  
  const shifts = [
    { key: "Mañana", label: "Mañana", icon: Sun, time: "8:00 - 12:00", color: "amber" },
    { key: "Tarde", label: "Tarde", icon: Sunset, time: "14:00 - 18:00", color: "orange" },
    { key: "Noche", label: "Noche", icon: Moon, time: "19:00 - 23:00", color: "indigo" }
  ]
  
  const modalityOptions = [
    { key: "Presencial", label: "Presencial", icon: "🏢" },
    { key: "Virtual", label: "Virtual", icon: "💻" },
    { key: "Ambas", label: "Ambas", icon: "🔀" }
  ]

  // Lógica de modalidades
  const isVirtual = selectedModality === "Virtual"
  const isAmbas = selectedModality === "Ambas"
  const showCampusSelection = !isVirtual // Mostrar sedes para Presencial y Ambas

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setLocations([...locations, location])
    } else {
      setLocations(locations.filter((l) => l !== location))
    }
  }

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const handleShiftToggle = (shift: string) => {
    if (selectedShifts.includes(shift)) {
      setSelectedShifts(selectedShifts.filter((s) => s !== shift))
    } else {
      setSelectedShifts([...selectedShifts, shift])
    }
  }

  const handleAddBlocks = () => {
    if (selectedDays.length > 0 && selectedShifts.length > 0 && selectedModality) {
      let campusesToSend: string[] = []
      
      // Determinar campuses según modalidad
      if (isVirtual) {
        campusesToSend = ["VIR"]
      } else if (isAmbas) {
        // AMBAS: Incluir sedes físicas seleccionadas + VIR
        campusesToSend = [...locations, "VIR"]
      } else {
        // PRESENCIAL: Solo sedes físicas seleccionadas
        campusesToSend = locations
      }
      
      const totalBlocks = selectedDays.length * selectedShifts.length
      console.log(`📋 Creando ${totalBlocks} bloques de disponibilidad...`)
      
      // Generar todas las combinaciones y llamar a onAddAvailability para cada una
      selectedDays.forEach(day => {
        selectedShifts.forEach(shift => {
          onAddAvailability({
            dayOfWeek: dayMapping[day],
            shift: shiftMapping[shift],
            modality: modalityMapping[selectedModality],
            campuses: campusesToSend,
          })
        })
      })
      
      // Cerrar modal y resetear formulario
      onOpenChange(false)
      setSelectedDays([])
      setSelectedShifts([])
      setSelectedModality("")
      setLocations([])
    }
  }

  // Obtener color del turno
  const getShiftColorClass = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    
    const colorMap: Record<string, string> = {
      'amber': 'bg-amber-100 text-amber-800 border-amber-300',
      'orange': 'bg-orange-100 text-orange-800 border-orange-300',
      'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700'
  }

  // Filtrar sedes para no mostrar Virtual en modalidad Presencial
  const filteredCampuses = campuses.filter(campus => campus.code !== 'VIR')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agregar Disponibilidad Horaria
            {selectedDays.length > 0 && selectedShifts.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({selectedDays.length * selectedShifts.length} {selectedDays.length * selectedShifts.length === 1 ? 'bloque' : 'bloques'})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Day Selection - Multiple */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Días <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2 font-normal">(Selecciona uno o más días)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  onClick={() => handleDayToggle(day.key)}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                    selectedDays.includes(day.key)
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-slate-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {selectedDays.length} día{selectedDays.length > 1 ? 's' : ''} seleccionado{selectedDays.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Shift Selection - Multiple */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Turnos <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2 font-normal">(Selecciona uno o más turnos)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {shifts.map((shift) => {
                const Icon = shift.icon
                const isSelected = selectedShifts.includes(shift.key)
                return (
                  <button
                    key={shift.key}
                    onClick={() => handleShiftToggle(shift.key)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? getShiftColorClass(shift.color, true) + ' border-2 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{shift.label}</span>
                    </div>
                    <div className={`text-xs ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>
                      {shift.time}
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedShifts.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {selectedShifts.length} turno{selectedShifts.length > 1 ? 's' : ''} seleccionado{selectedShifts.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Modality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Modalidad <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {modalityOptions.map((modality) => (
                <button
                  key={modality.key}
                  onClick={() => {
                    setSelectedModality(modality.key)
                    if (modality.key === "Virtual") {
                      setLocations([])
                    }
                  }}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    selectedModality === modality.key
                      ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{modality.icon}</div>
                  <div className="font-semibold text-sm">{modality.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          {showCampusSelection && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Sedes {isAmbas && <span className="text-xs text-gray-500">(+ Virtual)</span>}
              </label>
              {campusesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando sedes...
                </div>
              ) : campusesError ? (
                <div className="text-sm text-red-600 p-4 bg-red-50 rounded-lg">
                  Error al cargar las sedes
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  {filteredCampuses.map((campus) => (
                    <label
                      key={campus.code}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors"
                    >
                      <Checkbox
                        id={campus.code}
                        checked={locations.includes(campus.code)}
                        onCheckedChange={(checked) => handleLocationChange(campus.code, checked as boolean)}
                      />
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {campus.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensajes informativos */}
          {isVirtual && (
            <div className="text-sm text-gray-500 italic p-4 bg-blue-50 rounded-lg border border-blue-200">
              💡 La modalidad Virtual no requiere sedes físicas
            </div>
          )}

          {isAmbas && (
            <div className="text-sm text-gray-600 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <strong>Nota:</strong> La modalidad Ambas contempla tanto la enseñanza virtual como la presencial en las sedes físicas seleccionadas.
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddBlocks}
              disabled={
                selectedDays.length === 0 || 
                selectedShifts.length === 0 || 
                !selectedModality ||
                (showCampusSelection && locations.length === 0)
              }
              className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar bloques {selectedDays.length > 0 && selectedShifts.length > 0 && `(${selectedDays.length * selectedShifts.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
