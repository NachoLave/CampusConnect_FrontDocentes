"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Check, Search, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useSubjects, useProposals } from "@/lib/hooks"
import { Subject } from "@/lib/types"

interface AddSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSubject: (subjectId: number | string) => void  // Puede ser UUID (string) o número
}

export function AddSubjectModal({ open, onOpenChange, onAddSubject }: AddSubjectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [existingProposal, setExistingProposal] = useState<{ status: string; subjectName: string } | null>(null)
  
  // Obtener materias del backend (ahora usa API externa)
  const { subjects, isLoading, error } = useSubjects()
  
  // Obtener propuestas existentes
  const { proposals } = useProposals()

  // Filtrar materias por búsqueda (solo por nombre de materia)
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return subjects
    
    const term = searchTerm.toLowerCase()
    return subjects.filter(subject => 
      subject.subjectName.toLowerCase().includes(term)
    )
  }, [subjects, searchTerm])

  // Obtener el ID/UUID de la materia seleccionada (priorizar uuid sobre subjectId)
  const getSubjectIdentifier = (subject: Subject): string | number => {
    return subject.uuid || subject.subjectId
  }

  const handleAddSubject = () => {
    if (selectedSubject) {
      const subjectIdentifier = getSubjectIdentifier(selectedSubject)
      
      // Verificar si ya existe una propuesta para esta materia
      // Comparar tanto por uuid como por subjectId (para compatibilidad)
      const existing = proposals.find(p => {
        const proposalSubjectId = String(p.subjectId)
        const selectedId = String(subjectIdentifier)
        return proposalSubjectId === selectedId
      })
      
      if (existing) {
        setExistingProposal({
          status: existing.status,
          subjectName: selectedSubject.subjectName
        })
      } else {
        setShowConfirmation(true)
      }
    }
  }

  const handleConfirmSubmit = () => {
    if (selectedSubject) {
      const subjectIdentifier = getSubjectIdentifier(selectedSubject)
      onAddSubject(subjectIdentifier)
      setShowConfirmation(false)
      onOpenChange(false)
      setSelectedSubject(null)
      setSearchTerm("")
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
  }

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject)
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedSubject(null)
    setSearchTerm("")
    setExistingProposal(null)
  }

  const handleCloseExistingProposal = () => {
    setExistingProposal(null)
  }

  // Modal para propuestas existentes
  if (existingProposal) {
    const isApproved = existingProposal.status === 'APROBADA'
    const isPending = existingProposal.status === 'PENDIENTE'
    const isRejected = existingProposal.status === 'RECHAZADA'

    return (
      <Dialog open={true} onOpenChange={handleCloseExistingProposal}>
        <DialogContent className="sm:max-w-[450px] p-0">
          <div className="p-6">
            <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isApproved ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {isApproved && <CheckCircle className="w-6 h-6 text-green-600" />}
              {isPending && <AlertCircle className="w-6 h-6 text-yellow-600" />}
              {isRejected && <XCircle className="w-6 h-6 text-red-600" />}
            </div>
            
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {isApproved && 'Materia ya aprobada'}
              {isPending && 'Propuesta pendiente'}
              {isRejected && 'Propuesta rechazada'}
            </DialogTitle>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Materia</span>
                <p className="font-semibold text-gray-900 text-base mt-1">{existingProposal.subjectName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado actual</span>
                <p className={`text-sm font-medium mt-1 ${
                  isApproved ? 'text-green-700' : isPending ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {existingProposal.status}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 text-center">
              {isApproved && 'Esta materia ya fue aprobada y puedes dictarla. No es necesario enviar una nueva propuesta.'}
              {isPending && 'Ya tienes una propuesta pendiente para esta materia. Por favor, espera a que el equipo de Backoffice la revise.'}
              {isRejected && 'Tu propuesta para esta materia fue rechazada por el equipo de Backoffice. No es posible reenviarla en este momento.'}
            </p>

            <Button 
              onClick={handleCloseExistingProposal} 
              className="bg-slate-800 hover:bg-slate-700 text-white w-full"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showConfirmation && selectedSubject) {
    return (
      <Dialog open={true} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-[450px] p-0">
          <div className="p-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <Check className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-3 text-center">
              Confirmar propuesta
            </DialogTitle>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Materia seleccionada</span>
                <p className="font-semibold text-gray-900 text-base mt-1">{selectedSubject.subjectName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Carrera</span>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedSubject.careerName} {selectedSubject.careerCode && `(${selectedSubject.careerCode})`}
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Esta propuesta será enviada al equipo de Backoffice para su revisión y aprobación.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleConfirmationClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmSubmit} 
                className="bg-slate-800 hover:bg-slate-700 text-white flex-1"
              >
                Enviar propuesta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 flex flex-col h-[600px]">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">Agregar nueva propuesta</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Busca y selecciona la materia que deseas proponer</p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Buscador */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre de materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Contador de resultados */}
          {!isLoading && !error && searchTerm && (
            <div className="shrink-0 text-sm text-gray-600">
              Se {filteredSubjects.length === 1 ? 'encontró' : 'encontraron'} {filteredSubjects.length} {filteredSubjects.length === 1 ? 'resultado' : 'resultados'}
            </div>
          )}

          {/* Lista de materias - Altura fija con scroll */}
          <div className="flex-1 min-h-[200px] overflow-y-auto border-2 border-gray-200 rounded-lg bg-white shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Cargando materias...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Error al cargar las materias
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No se encontraron materias' : 'No hay materias disponibles'}
              </div>
            ) : (
              <div>
                {filteredSubjects.map((subject) => {
                  const subjectKey = subject.uuid || subject.subjectId
                  const isSelected = selectedSubject && getSubjectIdentifier(selectedSubject) === subjectKey
                  
                  return (
                    <div
                      key={subjectKey}
                      className={`p-4 cursor-pointer transition-colors border-b last:border-b-0 ${
                        isSelected
                          ? 'bg-slate-50 hover:bg-slate-50' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectSubject(subject)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Materia</span>
                            <h4 className="font-semibold text-gray-900 text-base mt-0.5">{subject.subjectName}</h4>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Carrera</span>
                            <p className="text-sm text-gray-700 mt-0.5">
                              {subject.careerName} {subject.careerCode && <span className="text-gray-500">({subject.careerCode})</span>}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-4 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t shrink-0 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddSubject}
            disabled={!selectedSubject || isLoading}
            className="bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar propuesta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
