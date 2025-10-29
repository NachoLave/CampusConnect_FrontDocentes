"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" 
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useWalletActions } from "@/lib/hooks/useWallet"

export default function CargarSaldoPage() {
  const router = useRouter()
  const { creditBalance, isLoading, error } = useWalletActions()
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [amount, setAmount] = useState("")
  const [cardType, setCardType] = useState<"VISA" | "MASTERCARD" | "">("")
  const [focusCvc, setFocusCvc] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({
  cardNumber: false,
    cardName: false,
    cardExpiry: false,
    cardCvc: false,
    amount: false,
  })

  // Logos
  const cardLogos: Record<string, string> = {
    VISA: "/images/visa-logo.png",
    MASTERCARD: "/images/mastercard-logo.png",
    "": "/images/default.png",
  }

  // Detectar tipo
  const handleCardNumberChange = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (/^4/.test(clean)) setCardType("VISA")
    else if (/^5[1-5]/.test(clean)) setCardType("MASTERCARD")
    else setCardType("")
    const formatted = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim()
    setCardNumber(formatted)
  }

  // Formatear vencimiento
  const handleExpiryChange = (value: string) => {
    let formatted = value.replace(/\D/g, "")
    if (formatted.length >= 3) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`
    setCardExpiry(formatted)
  }

  // Limitar nombre
  const handleCardNameChange = (value: string) => {
    if (value.length <= 20) setCardName(value.toUpperCase())
    else setCardName(value.slice(0, 20).toUpperCase())
  }

  // Fondo por tipo
  const getCardBackground = () => {
    switch (cardType) {
      case "VISA":
        return "from-blue-600 to-cyan-500"
      case "MASTERCARD":
        return "from-red-600 to-orange-500"
      default:
        return "bg-slate-800" // mismo color que botón
    }
  }

  const handleLoadSaldo = async () => {
    // Validación
    const newErrors = {
      cardNumber: !cardNumber.trim(),
      cardName: !cardName.trim(),
      cardExpiry: !cardExpiry.trim(),
      cardCvc: !cardCvc.trim(),
      amount: !amount.trim() || parseFloat(amount) <= 0,
    }
    setErrors(newErrors)

    // Si hay algún error, no continuar
    if (Object.values(newErrors).some(Boolean)) return

    // Acreditar saldo usando el método del servicio
    const result = await creditBalance(parseFloat(amount), 1010)
    
    if (result) {
      // Animación de éxito y redirección
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        router.push("/billetera")
      }, 1500)
    } else {
      // Mostrar error si falla la acreditación
      console.error('Error al acreditar saldo:', error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto font-sans p-6">
      {/* Back */}
      <div className="mb-6">
        <Link href="/billetera">
          <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Acreditar saldo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="space-y-4">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="flex-1 focus:outline-none"
                  onFocus={() => setFocusCvc(false)}
                />
                {cardType && (
                  <Image src={cardLogos[cardType]} alt={cardType} width={40} height={25} />
                )}
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">Completá el número de tarjeta</p>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => handleCardNameChange(e.target.value)}
                placeholder="Nombre Apellido"
                maxLength={20}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onFocus={() => setFocusCvc(false)}
              />
              {errors.cardName && (
                <p className="text-red-500 text-xs mt-1">Completá el nombre</p>
              )}
            </div>

            {/* Vencimiento + CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onFocus={() => setFocusCvc(false)}
                />
                {errors.cardExpiry && (
                  <p className="text-red-500 text-xs mt-1">Completá el vencimiento</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onFocus={() => setFocusCvc(true)}
                  onBlur={() => setFocusCvc(false)}
                />
                {errors.cardCvc && (
                  <p className="text-red-500 text-xs mt-1">Completá el CVV</p>
                )}
              </div>
            </div>

            {/* Monto a cargar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a cargar</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">Completá el monto a acreditar</p>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
            onClick={handleLoadSaldo}
            disabled={isLoading}
          >
            <CreditCard className="h-4 w-4 mr-2" /> 
            {isLoading ? "Procesando..." : "Cargar saldo"}
          </Button>

          {/* Mensaje de error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Tarjeta Preview */}
        <div className="flex justify-center items-center">
          <div className="w-96 h-56 perspective" style={{ perspective: "1000px" }}>
            <div
              className={`relative w-full h-full rounded-2xl shadow-xl transition-transform duration-700 transform ${
                focusCvc ? "rotate-y-180" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div
                className={`absolute w-full h-full p-6 flex flex-col justify-between rounded-2xl ${
                  cardType ? `bg-gradient-to-br ${getCardBackground()}` : "bg-slate-800"
                } text-white`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm tracking-wider uppercase">{cardType || "Tarjeta"}</div>
                  {cardType && (
                    <Image
                      src={cardLogos[cardType]}
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

              {/* Back */}
              <div
                className="absolute w-full h-full p-6 flex flex-col justify-center items-end bg-gray-800 rounded-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-black h-12 w-full mb-4 rounded"></div>
                <div className="bg-gray-300 h-8 w-32 text-black flex items-center justify-center rounded">
                  {cardCvc || "•••"}
                </div>
              </div>

              {/* Animación de éxito */}
              {success && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
                  <CheckCircle className="h-16 w-16 text-green-400 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
