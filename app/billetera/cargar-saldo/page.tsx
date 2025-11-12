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
  const AMOUNT_MAX = 500000
  const [amountErrorMessage, setAmountErrorMessage] = useState<string | null>(null)
  const [expiryErrorMessage, setExpiryErrorMessage] = useState<string | null>(null)
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

  // Formatear vencimiento y validar
  const handleExpiryChange = (value: string) => {
    let formatted = value.replace(/\D/g, "")
    if (formatted.length >= 3) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`
    setCardExpiry(formatted)
    
    // Validar en tiempo real
    if (formatted.length >= 2) {
      const month = parseInt(formatted.slice(0, 2))
      if (month < 1 || month > 12) {
        setExpiryErrorMessage("El mes debe estar entre 01 y 12")
      } else {
        setExpiryErrorMessage(null)
      }
    } else {
      setExpiryErrorMessage(null)
    }
  }

  // Limitar nombre
  const handleCardNameChange = (value: string) => {
    if (value.length <= 20) setCardName(value.toUpperCase())
    else setCardName(value.slice(0, 20).toUpperCase())
  }

  // Limitar monto
  const handleAmountChange = (value: string) => {
    // Permitir solo números y punto decimal
    const cleanValue = value.replace(/[^\d.]/g, "")
    
    // Si hay más de un punto, mantener solo el primero
    const parts = cleanValue.split(".")
    let formattedValue = parts[0]
    if (parts.length > 1) {
      formattedValue += "." + parts.slice(1).join("")
    }
    
    // Limitar a 2 decimales
    if (formattedValue.includes(".")) {
      const [integer, decimals] = formattedValue.split(".")
      formattedValue = integer + "." + decimals.slice(0, 2)
    }
    
    // Convertir a número y validar máximo
    const numValue = parseFloat(formattedValue)
    if (!isNaN(numValue) && numValue > AMOUNT_MAX) {
      // No permitir ingresar más del máximo
      setAmount(AMOUNT_MAX.toString())
      setAmountErrorMessage("No se puede cargar más de $500,000 por transaccion")
    } else {
      setAmount(formattedValue)
      // Limpiar mensaje si el valor es válido
      if (formattedValue === "" || numValue <= AMOUNT_MAX) {
        setAmountErrorMessage(null)
      }
    }
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
    // Validación de monto
    const parsedAmount = parseFloat(amount || '0')
    let amountErr = false
    let amountMsg: string | null = null
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      amountErr = true
      amountMsg = 'Completá el monto a acreditar'
    } else if (parsedAmount > AMOUNT_MAX) {
      amountErr = true
      amountMsg = "No se puede cargar más de $500,000 por transaccion"
    }

    // Validación de vencimiento
    let expiryErr = false
    let expiryMsg: string | null = null
    if (!cardExpiry.trim()) {
      expiryErr = true
      expiryMsg = 'Completá el vencimiento'
    } else {
      // Validar formato MM/AA
      const expiryParts = cardExpiry.split('/')
      if (expiryParts.length === 2) {
        const month = parseInt(expiryParts[0])
        if (isNaN(month) || month < 1 || month > 12) {
          expiryErr = true
          expiryMsg = 'El mes debe estar entre 01 y 12'
        }
      } else if (cardExpiry.length >= 2) {
        // Validar mes incluso si no tiene el formato completo
        const month = parseInt(cardExpiry.slice(0, 2))
        if (isNaN(month) || month < 1 || month > 12) {
          expiryErr = true
          expiryMsg = 'El mes debe estar entre 01 y 12'
        }
      }
    }

    const newErrors = {
      cardNumber: !cardNumber.trim(),
      cardName: !cardName.trim(),
      cardExpiry: expiryErr,
      cardCvc: !cardCvc.trim(),
      amount: amountErr,
    }
    setErrors(newErrors)
    setAmountErrorMessage(amountMsg)
    setExpiryErrorMessage(expiryMsg)

  // Si hay algún error, no continuar
  if (Object.values(newErrors).some(Boolean)) return

    // Acreditar saldo usando el método del servicio
  const result = await creditBalance(parsedAmount, 1010)
    
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
                  <p className="text-red-500 text-xs mt-1">{expiryErrorMessage || 'Completá el vencimiento'}</p>
                )}
                {expiryErrorMessage && !errors.cardExpiry && (
                  <p className="text-red-500 text-xs mt-1">{expiryErrorMessage}</p>
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
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min={0}
                max={AMOUNT_MAX}
                step={0.01}
                placeholder="$0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{amountErrorMessage || 'Completá el monto a acreditar'}</p>
              )}
              {amountErrorMessage && !errors.amount && (
                <p className="text-red-500 text-xs mt-1">{amountErrorMessage}</p>
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
