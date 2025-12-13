"use client"

import { X, AlertTriangle } from "lucide-react"
import { ErrorInfo } from "@/lib/utils/error-tracker"

interface ErrorBadgeProps {
  error: ErrorInfo
  onDismiss: (id: string) => void
}

export function ErrorBadge({ error, onDismiss }: ErrorBadgeProps) {
  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return "bg-red-50 border-red-200 text-red-800"
    if (statusCode >= 500) return "bg-red-50 border-red-200 text-red-800"
    if (statusCode >= 400) return "bg-orange-50 border-orange-200 text-orange-800"
    return "bg-yellow-50 border-yellow-200 text-yellow-800"
  }

  const statusColor = getStatusColor(error.statusCode)

  return (
    <div className={`flex items-start gap-2 px-3 py-2 border rounded-lg text-sm ${statusColor}`}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-0.5">
          {error.module}
        </div>
        <div className="text-xs opacity-90 mb-1">
          <span className="font-mono">{error.method}</span> {error.endpoint}
        </div>
        {error.statusCode && (
          <div className="text-xs font-medium mb-0.5">
            Error {error.statusCode}
          </div>
        )}
        <div className="text-xs opacity-80">
          {error.message}
        </div>
      </div>
      <button
        onClick={() => onDismiss(error.id)}
        className="ml-auto flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ErrorBadgesContainerProps {
  errors: ErrorInfo[]
  onDismiss: (id: string) => void
  maxVisible?: number
}

export function ErrorBadgesContainer({ errors, onDismiss, maxVisible = 5 }: ErrorBadgesContainerProps) {
  if (errors.length === 0) return null

  const visibleErrors = errors.slice(0, maxVisible)

  return (
    <div className="space-y-2 mb-4">
      {visibleErrors.map(error => (
        <ErrorBadge key={error.id} error={error} onDismiss={onDismiss} />
      ))}
      {errors.length > maxVisible && (
        <div className="text-xs text-gray-500 text-center py-1">
          +{errors.length - maxVisible} error{errors.length - maxVisible > 1 ? 'es' : ''} más
        </div>
      )}
    </div>
  )
}
