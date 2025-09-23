"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check } from "lucide-react"

interface AddAvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAvailability: (availability: {
    dia: string
    turno: string
    modalidad: string[]
    sedes: string[]
  }) => void
}

export function AddAvailabilityModal({ open, onOpenChange, onAddAvailability }: AddAvailabilityModalProps) {
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedShift, setSelectedShift] = useState("")
  const [modalities, setModalities] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const shifts = ["Mañana (8:00 a 12:00)", "Tarde (14:00 a 18:00)", "Noche (19:00 a 23:00)"]
  const modalityOptions = ["Presencial", "Virtual"]
  const locationOptions = ["Sede A", "Sede B", "Sede C", "Sede D"]

  const handleModalityChange = (modality: string, checked: boolean) => {
    if (checked) {
      setModalities([...modalities, modality])
    } else {
      setModalities(modalities.filter((m) => m !== modality))
    }
  }

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setLocations([...locations, location])
    } else {
      setLocations(locations.filter((l) => l !== location))
    }
  }

  const handleAddBlock = () => {
    if (selectedDay && selectedShift && modalities.length > 0) {
      onAddAvailability({
        dia: selectedDay,
        turno: selectedShift,
        modalidad: modalities,
        sedes: locations,
      })
      setShowConfirmation(true)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    onOpenChange(false)
    // Reset form
    setSelectedDay("")
    setSelectedShift("")
    setModalities([])
    setLocations([])
  }

  if (showConfirmation) {
    return (
      <Dialog open={true} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-[400px] p-0">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">Bloque agregado exitosamente</DialogTitle>
            <p className="text-gray-600 mb-6">
              Tu bloque de disponibilidad para {selectedDay} en turno {selectedShift.split(" ")[0]} ha sido agregado.
            </p>
            <Button onClick={handleConfirmationClose} className="bg-slate-800 hover:bg-slate-700 text-white w-full">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Agregar nuevo bloque de disponibilidad
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Día<span className="text-red-500">*</span>
              </label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modality Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Modalidad<span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {modalityOptions.map((modality) => (
                  <div key={modality} className="flex items-center space-x-2">
                    <Checkbox
                      id={modality}
                      checked={modalities.includes(modality)}
                      onCheckedChange={(checked) => handleModalityChange(modality, checked as boolean)}
                    />
                    <label htmlFor={modality} className="text-sm text-gray-900">
                      {modality}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shift Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Turno<span className="text-red-500">*</span>
              </label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift} value={shift}>
                      {shift}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Sedes</label>
              <div className="space-y-3">
                {locationOptions.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={location}
                      checked={locations.includes(location)}
                      onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                    />
                    <label htmlFor={location} className="text-sm text-gray-900">
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddBlock}
              disabled={!selectedDay || !selectedShift || modalities.length === 0}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar bloque
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
