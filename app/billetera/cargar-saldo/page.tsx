"use client"

import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function CargarSaldoPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/billetera">
          <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Acreditar saldo</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/mercadopago-logo-cropped.png"
              alt="MercadoPago"
              width={160}
              height={48}
              className="object-contain"
            />
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <p className="text-gray-900 font-medium">Escaneá el código QR</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <p className="text-gray-900 font-medium">Ingresá el monto que queres cargar</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <p className="text-gray-900 font-medium">Confirmá la transacción</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - QR Code */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
              <Image
                src="/images/qr-code.png"
                alt="QR Code para cargar saldo"
                width={240}
                height={240}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Los saldos se sincronizan automáticamente con el sistema de la universidad
        </p>
      </div>
    </div>
  )
}
