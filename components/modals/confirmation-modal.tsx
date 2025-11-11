"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  confirmVariant?: "default" | "destructive" | "success" | "warning"
  icon?: "warning" | "info"
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  confirmVariant = "default",
  icon = "info",
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const getIconStyles = () => {
    switch (icon) {
      case "warning":
        return { Icon: AlertTriangle, className: "text-red-600" }
      case "info":
      default:
        return { Icon: Info, className: "text-blue-600" }
    }
  }

  const getButtonStyles = () => {
    switch (confirmVariant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "warning":
        return "bg-orange-600 hover:bg-orange-700 text-white"
      case "default":
      default:
        return "bg-slate-800 hover:bg-slate-700 text-white"
    }
  }

  const iconConfig = getIconStyles()
  const IconComponent = iconConfig.Icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <IconComponent className={`h-5 w-5 ${iconConfig.className}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className={getButtonStyles()} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

