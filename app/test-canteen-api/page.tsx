"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CanteenService } from "@/lib/api/services"

export default function TestCanteenApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔍 Probando API del comedor...")
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test API Comedor</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={testApi} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Probando..." : "Probar API del Comedor"}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">Resultado:</h3>
            <pre className="text-sm text-green-700 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
