"use client"

import { useState, useEffect } from "react"
import { CanteenService } from "@/lib/api/services"

export default function TestCanteenMappingPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        console.log("🔍 Probando mapeo de datos del comedor...")
        const response = await CanteenService.getReservations()
        console.log("📊 Respuesta completa:", response)
        setResult(response)
      } catch (err) {
        console.error("❌ Error en la petición:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Mapeo de Datos - Comedor</h1>
      
      <div className="space-y-4">
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">Estado de la Respuesta:</h3>
              <p className="text-green-700">
                <strong>Éxito:</strong> {result.success ? 'Sí' : 'No'}<br/>
                <strong>Mensaje:</strong> {result.message}<br/>
                <strong>Cantidad de reservas:</strong> {result.data?.length || 0}
              </p>
            </div>

            {result.data && result.data.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-gray-800 font-semibold mb-4">Reservas Mapeadas:</h3>
                <div className="space-y-3">
                  {result.data.map((reservation: any, index: number) => (
                    <div key={reservation.id} className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium text-gray-800">Reserva #{index + 1}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div><strong>ID:</strong> {reservation.id}</div>
                        <div><strong>Fecha:</strong> {reservation.date}</div>
                        <div><strong>Tipo:</strong> {reservation.type}</div>
                        <div><strong>Estado:</strong> {reservation.status}</div>
                        <div><strong>Sede:</strong> {reservation.sede || 'N/A'}</div>
                        <div><strong>Menú:</strong> {reservation.total || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-800 font-semibold mb-2">Respuesta Completa (JSON):</h3>
              <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-2 rounded border">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
