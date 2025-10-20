"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function CargarSaldoPage() {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [amount, setAmount] = useState("")
  const [cardType, setCardType] = useState<"VISA" | "MASTERCARD" | "">("")

  // 🟦 Detectar tipo y formatear número
  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim()

    const clean = value.replace(/\D/g, "")
    if (/^4/.test(clean)) setCardType("VISA")
    else if (/^5[1-5]/.test(clean)) setCardType("MASTERCARD")
    else setCardType("")

    setCardNumber(formatted)
  }

  // 🟦 Formatear vencimiento (MM/AA)
  const handleExpiryChange = (value: string) => {
    let formatted = value.replace(/\D/g, "")
    if (formatted.length >= 3) {
      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`
    }
    setCardExpiry(formatted)
  }

  // 🟦 Cambiar color según tipo
  const getCardBackground = () => {
    switch (cardType) {
      case "VISA":
        return "from-blue-600 to-cyan-500"
      case "MASTERCARD":
        return "from-red-600 to-orange-500"
      default:
        return "from-indigo-600 to-purple-600"
    }
  }

  return (
    <div className="max-w-5xl mx-auto font-sans">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/billetera">
          <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Acreditar saldo</h1>
        <p className="text-gray-600">Completá los datos de tu tarjeta para cargar saldo en tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Card Preview */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-96 h-56 rounded-2xl bg-gradient-to-br ${getCardBackground()} text-white p-6 shadow-xl transition-all duration-500 transform`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm tracking-wider uppercase">
                {cardType || "Tarjeta"}
              </div>
              {cardType && (
                <Image
                  src={
                    cardType === "VISA"
                      ? "/images/visa-logo.png"
                      : "/images/mastercard-logo.png"
                  }
                  alt={cardType}
                  width={50}
                  height={30}
                  className="object-contain"
                />
              )}
            </div>

            <div className="text-2xl font-mono tracking-widest mb-6">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>

            <div className="flex justify-between items-end text-sm">
              <div>
                <div className="text-gray-300 uppercase text-xs">Titular</div>
                <div className="font-semibold text-base">{cardName || "NOMBRE APELLIDO"}</div>
              </div>

              <div className="text-right">
                <div className="text-gray-300 uppercase text-xs">Vencimiento</div>
                <div className="font-semibold text-base">{cardExpiry || "MM/AA"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {cardType && (
                <div className="absolute right-3 top-2.5">
                  <Image
                    src={
                      cardType === "VISA"
                        ? "/images/visa-logo.png"
                        : "/images/mastercard-logo.png"
                    }
                    alt={cardType}
                    width={40}
                    height={25}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="Nombre Apellido"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                type="password"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="•••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a cargar</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botón */}
          <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-lg py-2 mt-4 flex items-center justify-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Confirmar carga
          </Button>
        </div>
      </div>
    </div>
  )
}
