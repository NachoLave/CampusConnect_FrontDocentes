"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import { ArrowLeft, CreditCard, CheckCircle, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useWalletActions } from "@/lib/hooks/useWallet"

// Clave para guardar datos de tarjeta en sessionStorage
const SAVED_CARD_KEY = 'wallet_saved_card'

// Interfaz para los datos guardados
interface SavedCardData {
  cardNumber: string  // Número completo (se mostrará enmascarado)
  cardType: "VISA" | "MASTERCARD" | ""
  cardName: string
  cardExpiry: string
  // NO guardamos: CVV (código de seguridad)
}

// Función para enmascarar número de tarjeta mostrando solo últimos 4 dígitos
const maskCardNumber = (cardNumber: string): string => {
  const clean = cardNumber.replace(/\D/g, "")
  if (clean.length < 4) return cardNumber
  const lastFour = clean.slice(-4)
  const masked = "**** **** **** " + lastFour
  return masked
}

// Función para obtener los últimos 4 dígitos
const getLastFourDigits = (cardNumber: string): string => {
  const clean = cardNumber.replace(/\D/g, "")
  return clean.slice(-4)
}

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
  const [cardNumberErrorMessage, setCardNumberErrorMessage] = useState<string | null>(null)
  const [cardType, setCardType] = useState<"VISA" | "MASTERCARD" | "">("")
  const [focusCvc, setFocusCvc] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveCard, setSaveCard] = useState(false) // Checkbox para guardar tarjeta
  const [savedCard, setSavedCard] = useState<SavedCardData | null>(null) // Datos guardados
  const [errors, setErrors] = useState({
  cardNumber: false,
    cardName: false,
    cardExpiry: false,
    cardCvc: false,
    amount: false,
  })

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SAVED_CARD_KEY)
      if (saved) {
        const cardData: SavedCardData = JSON.parse(saved)
        setSavedCard(cardData)
        // Mostrar número enmascarado
        setCardNumber(maskCardNumber(cardData.cardNumber))
        setCardName(cardData.cardName)
        setCardType(cardData.cardType)
        setCardExpiry(cardData.cardExpiry)
        setSaveCard(true) // Marcar como guardado
      }
    } catch (err) {
      // Si hay error al cargar, simplemente no pre-llenar
    }
  }, [])

  // Logos
  const cardLogos: Record<string, string> = {
    VISA: "/images/visa-logo.png",
    MASTERCARD: "/images/mastercard-logo.png",
    "": "/images/default.png",
  }

  // Detectar tipo y manejar edición de tarjeta guardada
  const handleCardNumberChange = (value: string) => {
    // Si el usuario está editando una tarjeta guardada (que tiene formato ****), 
    // reemplazar con el número completo guardado para editar
    if (value.includes('****') && savedCard && value.length <= 19) {
      // Si el usuario borra todo o empieza a escribir, usar el número completo guardado
      if (value.length < 19) {
        setCardNumber(savedCard.cardNumber.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim())
        return
      }
    }
    
    const clean = value.replace(/\D/g, "")
    if (/^4/.test(clean)) setCardType("VISA")
    else if (/^5[1-5]/.test(clean)) setCardType("MASTERCARD")
    else setCardType("")
    const formatted = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim()
    setCardNumber(formatted)
  }

  // Guardar datos de la tarjeta en sessionStorage (todo excepto CVV)
  const saveCardData = (cardNumberFull: string) => {
    if (!saveCard) {
      // Si no quiere guardar, eliminar datos previos
      sessionStorage.removeItem(SAVED_CARD_KEY)
      setSavedCard(null)
      return
    }

    const cleanNumber = cardNumberFull.replace(/\D/g, "")
    if (cleanNumber.length < 13) return // No guardar si no es un número válido

    const cardData: SavedCardData = {
      cardNumber: cleanNumber, // Guardar número completo
      cardType: cardType || "",
      cardName: cardName,
      cardExpiry: cardExpiry
      // NO guardamos CVV por seguridad
    }

    try {
      sessionStorage.setItem(SAVED_CARD_KEY, JSON.stringify(cardData))
      setSavedCard(cardData)
    } catch (err) {
      // Si no se puede guardar (espacio lleno, etc.), simplemente no guardar
    }
  }

  // Usar tarjeta guardada (pre-llenar formulario con datos guardados)
  const useSavedCard = () => {
    if (!savedCard) return
    
    setCardName(savedCard.cardName)
    setCardType(savedCard.cardType)
    setCardNumber(maskCardNumber(savedCard.cardNumber)) // Mostrar enmascarado
    setCardExpiry(savedCard.cardExpiry)
    setSaveCard(true) // Marcar checkbox como activo
    setCardCvc("") // CVV siempre vacío (no se guarda)
  }

  // Limpiar tarjeta guardada
  const clearSavedCard = () => {
    sessionStorage.removeItem(SAVED_CARD_KEY)
    setSavedCard(null)
    setCardNumber("")
    setCardName("")
    setCardExpiry("")
    setCardCvc("")
    setCardType("")
    setSaveCard(false)
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

    // Validar número de tarjeta
    // Si hay una tarjeta guardada y el input tiene asteriscos, usar el número guardado
    let cardNumberToUse = cardNumber
    if (cardNumber.includes('****') && savedCard) {
      cardNumberToUse = savedCard.cardNumber
    }
    const cleanCardNumber = cardNumberToUse.replace(/\D/g, "")
    const hasValidCardNumber = cleanCardNumber.length >= 13 && cleanCardNumber.length <= 19

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
      cardNumber: !hasValidCardNumber,
      cardName: !cardName.trim(),
      cardExpiry: expiryErr,
      cardCvc: !cardCvc.trim(),
      amount: amountErr,
    }
    setErrors(newErrors)
    setAmountErrorMessage(amountMsg)
    setExpiryErrorMessage(expiryMsg)
    if (!hasValidCardNumber && cardNumber.includes('*')) {
      setCardNumberErrorMessage('Debes ingresar el número completo de la tarjeta')
    } else {
      setCardNumberErrorMessage(null)
    }

  // Si hay algún error, no continuar
  if (Object.values(newErrors).some(Boolean)) return

    // Acreditar saldo usando el método del servicio
    // Si hay tarjeta guardada con asteriscos, usar el número completo guardado
    const cardNumberForSave = cardNumber.includes('****') && savedCard 
      ? savedCard.cardNumber 
      : cardNumber.replace(/\D/g, "")
    
    const result = await creditBalance(parsedAmount)
    
    if (result) {
      // Guardar datos de la tarjeta si el usuario marcó el checkbox
      // Guardamos todo excepto CVV (código de seguridad)
      saveCardData(cardNumberForSave)

      // Animación de éxito y redirección
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        router.push("/billetera")
      }, 1500)
    } else {
      // El error ya está disponible en el hook y se mostrará en la UI
      // No hacer nada adicional aquí, el error se muestra automáticamente
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
          {/* Banner de tarjeta guardada - Diseño mejorado */}
          {savedCard && cardNumber !== maskCardNumber(savedCard.cardNumber) && (
            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Tarjeta guardada
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      {savedCard.cardType && (
                        <Image 
                          src={cardLogos[savedCard.cardType]} 
                          alt={savedCard.cardType} 
                          width={32} 
                          height={20}
                          className="rounded"
                        />
                      )}
                      <span className="text-base font-mono font-semibold text-gray-800">
                        {maskCardNumber(savedCard.cardNumber)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="font-medium">{savedCard.cardName}</span>
                      <span>•</span>
                      <span>Vence {savedCard.cardExpiry}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={useSavedCard}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-3 py-1.5 font-medium whitespace-nowrap"
                >
                  Usar esta tarjeta
                </Button>
              </div>
              <button
                onClick={clearSavedCard}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Eliminar tarjeta guardada"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de tarjeta
              </label>
              {savedCard && cardNumber.includes('****') && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Usando tarjeta guardada. Solo necesitás ingresar el código de seguridad (CVV).
                  </p>
                </div>
              )}
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="flex-1 focus:outline-none bg-transparent"
                  onFocus={() => setFocusCvc(false)}
                  readOnly={savedCard && cardNumber.includes('****')} // Solo lectura si está usando tarjeta guardada
                />
                {cardType && (
                  <Image src={cardLogos[cardType]} alt={cardType} width={40} height={25} className="ml-2" />
                )}
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {cardNumberErrorMessage || 'Completá el número de tarjeta'}
                </p>
              )}
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

          {/* Checkbox para recordar tarjeta - Diseño mejorado */}
          <div className="pt-4 border-t border-gray-200">
            <label 
              htmlFor="saveCard" 
              className="flex items-start gap-3 cursor-pointer group hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-900">
                    Guardar esta tarjeta para próximas compras
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Guardamos el número y fecha de vencimiento de forma segura. El código de seguridad (CVV) nunca se guarda.
                </p>
              </div>
            </label>
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
