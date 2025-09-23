"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from "lucide-react"
import { AddSubjectModal } from "@/components/modals/add-subject-modal"
import { AddAvailabilityModal } from "@/components/modals/add-availability-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"

export default function PerfilPage() {
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "materia" | "horario"; index: number } | null>(null)

  const user = {
    name: "Juan Sánchez",
    id: "11223344",
    email: "juan.sanchez@campusconnect.com.ar",
    avatar: "/teacher-profile.png",
    department: "Facultad de Ingeniería",
    status: "Activo",
  }

  const [materias, setMaterias] = useState([
    {
      name: "PROGRAMACIÓN I",
      status: "APROBADO",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      name: "PROGRAMACIÓN III",
      status: "APROBADO",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      name: "CALIDAD DE SOFTWARE",
      status: "RECHAZADO",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      name: "SISTEMAS DE INFORMACIÓN",
      status: "PENDIENTE",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      name: "PROCESO DE DESARROLLO DE SOFTWARE",
      status: "PENDIENTE",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  ])

  const [horarios, setHorarios] = useState([
    {
      dia: "Lunes",
      turno: "Mañana (8:00 a 12:00)",
      modalidad: "Presencial",
      sedes: "Sede Central, Sede Norte",
    },
    {
      dia: "Lunes",
      turno: "Mañana (8:00 a 12:00)",
      modalidad: "Presencial",
      sedes: "Sede Central, Sede Norte",
    },
    {
      dia: "Lunes",
      turno: "Mañana (8:00 a 12:00)",
      modalidad: "Presencial",
      sedes: "Sede Central, Sede Norte",
    },
  ])

  const handleAddSubject = (subjectName: string) => {
    const newSubject = {
      name: subjectName,
      status: "PENDIENTE",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    setMaterias([...materias, newSubject])
  }

  const handleAddAvailability = (availability: any) => {
    const newAvailability = {
      dia: availability.dia,
      turno: availability.turno,
      modalidad: availability.modalidad.join(", "),
      sedes: availability.sedes.join(", "),
    }
    setHorarios([...horarios, newAvailability])
  }

  const handleDeleteClick = (type: "materia" | "horario", index: number) => {
    setDeleteTarget({ type, index })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === "materia") {
        setMaterias(materias.filter((_, index) => index !== deleteTarget.index))
      } else {
        setHorarios(horarios.filter((_, index) => index !== deleteTarget.index))
      }
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-2xl font-medium">JS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">LEGAJO {user.id}</p>
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">Estado: {user.status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Información de perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{user.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Legajo</label>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{user.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional</label>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-900">{user.department}</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            Los datos de perfil se sincronizan desde Backoffice
          </div>
        </CardContent>
      </Card>

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
            <h3 className="font-medium text-gray-900 mb-3">Propuesta de Materias</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materias.map((materia, index) => (
              <Card key={index} className="border shadow-sm relative">
                <CardContent className="p-4">
                  {materia.status === "PENDIENTE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => handleDeleteClick("materia", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-8">
                      <div className="flex items-center mb-2">
                        {materia.status === "APROBADO" && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                        {materia.status === "RECHAZADO" && <XCircle className="w-5 h-5 text-red-600 mr-2" />}
                        {materia.status === "PENDIENTE" && <Clock className="w-5 h-5 text-yellow-600 mr-2" />}
                        <h4 className="font-semibold text-gray-900">{materia.name}</h4>
                      </div>
                      <Badge className={materia.color}>{materia.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                {horarios.map((horario, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 text-gray-900">{horario.dia}</td>
                    <td className="py-3 px-4 text-gray-900">{horario.turno}</td>
                    <td className="py-3 px-4 text-gray-900">{horario.modalidad}</td>
                    <td className="py-3 px-4 text-gray-900">{horario.sedes}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick("horario", index)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            ? "¿Estás seguro de que deseas eliminar esta propuesta de materia? Esta acción no se puede deshacer."
            : "¿Estás seguro de que deseas eliminar esta disponibilidad horaria? Esta acción no se puede deshacer."
        }
      />
    </div>
  )
}
