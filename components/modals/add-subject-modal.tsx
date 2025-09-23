"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Check } from "lucide-react"

interface AddSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSubject: (subjectName: string) => void
}

export function AddSubjectModal({ open, onOpenChange, onAddSubject }: AddSubjectModalProps) {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const subjects = [
    "ALGEBRA Y GEOMETRÍA ANALÍTICA",
    "ALGORITMOS Y ESTRUCTURAS DE DATOS",
    "BASE DE DATOS",
    "PROGRAMACIÓN I",
    "PROGRAMACIÓN II",
    "SISTEMAS DE INFORMACIÓN",
    "CALIDAD DE SOFTWARE",
  ]

  const handleAddSubject = () => {
    if (selectedSubject) {
      onAddSubject(selectedSubject)
      setShowConfirmation(true)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    onOpenChange(false)
    setSelectedSubject("")
  }

  if (showConfirmation) {
    return (
      <Dialog open={true} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-[400px] p-0">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              Materia agregada exitosamente
            </DialogTitle>
            <p className="text-gray-600 mb-6">La materia "{selectedSubject}" ha sido agregada a tus propuestas.</p>
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
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Agregar nueva materia</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Buscar una materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {subjects.slice(0, 3).map((subject) => (
              <div
                key={subject}
                className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedSubject(subject)}
              >
                <span className="text-gray-900 font-medium">{subject}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddSubject}
              disabled={!selectedSubject}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar materia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
