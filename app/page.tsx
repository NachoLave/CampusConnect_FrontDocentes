"use client"

import type React from "react"
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, Zap, Users, ArrowRight, Wallet, AlertTriangle, X } from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatedBalance } from "@/components/ui/animated-balance"
import { useWeeklyCalendar, useNextClass } from "@/lib/hooks/useCalendar"
import { useBalance } from "@/lib/hooks/useWallet"
import { useCanteenReservations } from '@/lib/hooks'
import { EventSkeleton, InlineNextClassSkeleton, InlineBalanceSkeleton } from "@/components/ui/loaders"

const carouselImages = [
  {
    src: "/images/new-courses-banner.png",
    alt: "Nuevos Cursos de Formación Disponibles",
    title: "Nuevos Cursos de Formación",
    subtitle: "Descubre las últimas oportunidades educativas",
  },
  {
    src: "/images/expo-hall.png",
    alt: "Expo Educativa 2025",
    title: "Expo Educativa 2025",
    subtitle: "Conectando el futuro de la educación",
  },
  {
    src: "/images/university-campus.png",
    alt: "Campus Universitario",
    title: "Vida Universitaria",
    subtitle: "Experiencias que transforman tu futuro",
  },
]

type EventType = {
  time: string
  title: string
  type: "class" | "meeting" | "exam" | "event" | "canteen"
}

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Obtener el lunes de la semana actual
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Si es domingo (0), retroceder 6 días
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  })
  const autoTransitionRef = useRef<NodeJS.Timeout | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Usar hooks del backend para obtener datos reales
  const { balance, isLoading: balanceLoading, error: balanceError } = useBalance()
  const { nextClass, isLoading: nextClassLoading } = useNextClass()
  const { reservations, isLoading: reservationsLoading, error: reservationsError } = useCanteenReservations()

  // Cargar TODOS los eventos del año de una vez (no solo la semana actual)
  const getAllEventsRange = () => {
    const currentYear = new Date().getFullYear()
    const start = new Date(currentYear, 0, 1) // 1 de enero
    const end = new Date(currentYear, 11, 31) // 31 de diciembre
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    return {
      start: formatDate(start),
      end: formatDate(end)
    }
  }

  const allEventsRange = getAllEventsRange()
  const { events: weeklyEvents, isLoading: eventsLoading, eventTypeErrors } = useWeeklyCalendar(allEventsRange.start, allEventsRange.end)
  
  // Estado para controlar visibilidad de badges de error en dashboard
  const [visibleErrors, setVisibleErrors] = useState<{ classes?: boolean; canteen?: boolean; events?: boolean }>({})

  // Preload de todas las imágenes del carrusel para optimizar la carga
  useEffect(() => {
    carouselImages.forEach((image) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = image.src
      document.head.appendChild(link)
    })
    
    // También preload usando Image objects para forzar la carga
    carouselImages.forEach((image) => {
      const img = new window.Image()
      img.src = image.src
    })
  }, [])
  
  // Mostrar errores cuando se detecten
  useEffect(() => {
    if (eventTypeErrors.classes || eventTypeErrors.canteen || eventTypeErrors.events) {
      setVisibleErrors({
        classes: !!eventTypeErrors.classes,
        canteen: !!eventTypeErrors.canteen,
        events: !!eventTypeErrors.events
      })
      // Auto-ocultar después de 10 segundos
      const timer = setTimeout(() => {
        setVisibleErrors({})
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      setVisibleErrors({})
    }
  }, [eventTypeErrors])

  // Debug: Log de eventos recibidos
  console.log('Dashboard - Eventos cargados:', weeklyEvents.length)


  const startAutoTransition = () => {
    if (autoTransitionRef.current) {
      clearInterval(autoTransitionRef.current)
    }
    autoTransitionRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 10000) // 10 seconds
  }

  useEffect(() => {
    startAutoTransition()
    return () => {
      if (autoTransitionRef.current) {
        clearInterval(autoTransitionRef.current)
      }
    }
  }, [])

  const nextSlide = () => {
    if (isTransitioning) return // Prevenir múltiples clics rápidos
    
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    startAutoTransition() // Reset timer
    
    // Reducido a 400ms para mejor responsividad
    setTimeout(() => setIsTransitioning(false), 400)
  }

  const prevSlide = () => {
    if (isTransitioning) return // Prevenir múltiples clics rápidos
    
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
    startAutoTransition() // Reset timer
    
    // Reducido a 400ms para mejor responsividad
    setTimeout(() => setIsTransitioning(false), 400)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
    setDragOffset(0)
    // Pause auto transition while dragging
    if (autoTransitionRef.current) {
      clearInterval(autoTransitionRef.current)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const currentOffset = e.clientX - dragStart
    setDragOffset(currentOffset)
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Determine if drag was significant enough to change slide
    const threshold = 100 // pixels
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevSlide() // Dragged right, go to previous
      } else {
        nextSlide() // Dragged left, go to next
      }
    } else {
      // Reset auto transition if drag wasn't significant
      startAutoTransition()
    }

    setDragOffset(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }

  const getPrevSlide = () => (currentSlide - 1 + carouselImages.length) % carouselImages.length
  const getNextSlide = () => (currentSlide + 1) % carouselImages.length

  const getCurrentWeekDays = () => {
    const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      
      weekDays.push({
        day: days[i],
        date: date.getDate(),
        fullDate: date,
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: date.toDateString() === today.toDateString(),
      })
    }
    
    return weekDays
  }

  // Obtener mes y año para mostrar
  const getMonthYear = () => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    // Obtener el mes del día del medio de la semana para mejor representación
    const midWeek = new Date(currentWeekStart)
    midWeek.setDate(midWeek.getDate() + 3)
    
    return `${months[midWeek.getMonth()]} ${midWeek.getFullYear()}`
  }

  const nextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }

  const prevWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    
    setCurrentWeekStart(monday)
    setSelectedDate(today)
  }

  // Optimización: memoizar cálculos que dependen de currentWeekStart
  const weekDays = useMemo(() => getCurrentWeekDays(), [currentWeekStart])
  const monthYear = useMemo(() => getMonthYear(), [currentWeekStart])

  // Mantener el día actual seleccionado cuando se carga o cambia de semana
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Verificar si el día actual está en la semana mostrada
    const todayInWeek = weekDays.find(d => d.isToday)
    
    if (todayInWeek) {
      // Si el día actual está en esta semana, seleccionarlo
      setSelectedDate(todayInWeek.fullDate)
    } else {
      // Si no, seleccionar el primer día de la semana
      setSelectedDate(weekDays[0]?.fullDate || today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]) // Cuando cambia la semana

  // Optimización: memoizar eventos del día seleccionado
  const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate])
  const selectedEvents: EventType[] = useMemo(() => {
    return weeklyEvents
      .filter((event) => event.date === selectedDateStr)
      .map((event) => ({
        time: event.time,
        title: event.title,
        type: event.type as "class" | "meeting" | "exam" | "event" | "canteen",
      }))
  }, [weeklyEvents, selectedDateStr])

  // Optimización: memoizar mapa de tipos de eventos por fecha (crear una vez)
  const eventTypesByDate = useMemo(() => {
    const map = new Map<string, Set<string>>()
    weeklyEvents.forEach((event) => {
      if (!map.has(event.date)) {
        map.set(event.date, new Set())
      }
      map.get(event.date)!.add(event.type)
    })
    return map
  }, [weeklyEvents])

  // Función optimizada para obtener tipos de eventos por fecha
  const getEventTypesForDate = (date: Date): Set<string> => {
    const dateStr = date.toISOString().split('T')[0]
    return eventTypesByDate.get(dateStr) || new Set()
  }
  
  // Comparar fechas correctamente
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  return (
    <>
      {/* Badges de errores temporales en dashboard */}
      {(visibleErrors.classes || visibleErrors.canteen || visibleErrors.events) && (
        <div className="max-w-[95rem] mx-auto px-4 pt-4 space-y-2">
          {visibleErrors.classes && eventTypeErrors.classes && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>No se pudieron cargar clases/exámenes</span>
              <button
                onClick={() => setVisibleErrors(prev => ({ ...prev, classes: false }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {visibleErrors.canteen && eventTypeErrors.canteen && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>No se pudieron cargar reservas de comedor</span>
              <button
                onClick={() => setVisibleErrors(prev => ({ ...prev, canteen: false }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {visibleErrors.events && eventTypeErrors.events && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>No se pudieron cargar eventos académicos</span>
              <button
                onClick={() => setVisibleErrors(prev => ({ ...prev, events: false }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-end max-w-[95rem] mx-auto px-4"></div>

      <div className="mb-8">
        <div className="relative max-w-7xl mx-auto px-2 lg:px-0">
          <div
            ref={carouselRef}
            className="relative h-48 md:h-64 lg:h-80 flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing select-none overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: isDragging ? `translateX(${dragOffset * 0.5}px)` : "translateX(0px)",
              transition: isDragging ? "none" : "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div 
              className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-64 transform -translate-x-2 rotate-y-12 scale-75 opacity-60 z-10 transition-all duration-400 ease-out hover:opacity-80 hover:scale-[0.78] carousel-side-image cursor-pointer"
              onClick={prevSlide}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl transition-shadow duration-300 hover:shadow-2xl">
                <Image
                  src={carouselImages[getPrevSlide()].src || "/placeholder.svg"}
                  alt={carouselImages[getPrevSlide()].alt}
                  fill
                  className="object-cover transition-transform duration-400 hover:scale-105 animate-breathe"
                  draggable={false}
                  loading="eager"
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/30 transition-colors duration-300 hover:bg-black/20" />
              </div>
            </div>

            <div className="relative w-full max-w-[700px] h-40 md:h-56 lg:h-72 z-20 transform transition-all duration-400 ease-out hover:scale-[1.02] mx-4 lg:mx-0">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl">
                <Image
                  src={carouselImages[currentSlide].src || "/placeholder.svg"}
                  alt={carouselImages[currentSlide].alt}
                  fill
                  className="object-cover transition-all duration-400 ease-out animate-breathe"
                  priority
                  draggable={false}
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 text-white transform transition-all duration-300 ease-out">
                  <h2 className="text-base md:text-xl lg:text-2xl font-bold mb-1 lg:mb-2 transform transition-transform duration-300 ease-out hover:translate-x-1">
                    {carouselImages[currentSlide].title}
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg opacity-90 transform transition-all duration-300 ease-out delay-100 hover:translate-x-1">
                    {carouselImages[currentSlide].subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-64 transform translate-x-2 -rotate-y-12 scale-75 opacity-60 z-10 transition-all duration-400 ease-out hover:opacity-80 hover:scale-[0.78] carousel-side-image cursor-pointer"
              onClick={nextSlide}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl transition-shadow duration-300 hover:shadow-2xl">
                <Image
                  src={carouselImages[getNextSlide()].src || "/placeholder.svg"}
                  alt={carouselImages[getNextSlide()].alt}
                  fill
                  className="object-cover transition-transform duration-400 hover:scale-105 animate-breathe"
                  draggable={false}
                  loading="eager"
                  quality={85}
                />
                <div className="absolute inset-0 bg-black/30 transition-colors duration-300 hover:bg-black/20" />
              </div>
            </div>

            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 glass-button rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-30 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 glass-button rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-30 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="flex justify-center items-center mt-8 space-x-4">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentSlide(index)
                    startAutoTransition() // Reset timer on manual selection
                    setTimeout(() => setIsTransitioning(false), 400)
                  }
                }}
                disabled={isTransitioning}
                className={`transition-all duration-300 ease-out hover:scale-125 active:scale-95 disabled:cursor-not-allowed ${
                  index === currentSlide
                    ? "w-10 h-3 bg-slate-600 rounded-full shadow-md"
                    : "w-3 h-3 bg-gray-300 rounded-full hover:bg-slate-400 hover:w-6 shadow-sm"
                }`}
              />
            ))}
            {isDragging && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                  {Math.abs(dragOffset) > 100 ? "Suelta para cambiar" : "Arrastra para navegar"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        .-rotate-y-12 {
          transform: rotateY(-12deg);
        }
        
        /* Animaciones personalizadas */
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-100px) rotateY(45deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px) rotateY(-45deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) scale(1);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(71, 85, 105, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(71, 85, 105, 0.5);
          }
        }
        
        /* Hover effects para las imágenes laterales */
        .carousel-side-image:hover {
          animation: pulseGlow 2s infinite;
        }
        
        /* Smooth transition para el contenedor principal */
        .carousel-container {
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Glass effect para los botones */
        .glass-button {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
        }
      `}</style>

      <div className="w-full max-w-[95rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-gray-200 h-full">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-700">Calendario semanal</h2>
                  <p className="text-sm text-gray-500 mt-1">{monthYear}</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button onClick={prevWeek} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-2 md:px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span className="hidden md:inline">Hoy</span>
                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button onClick={nextWeek} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4 mb-6">
                {weekDays.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${
                        item.day === "SÁB" || item.day === "DOM" ? "text-gray-400" : "text-slate-600"
                      }`}
                    >
                      {item.day}
                    </div>
                    <button
                      onClick={() => setSelectedDate(item.fullDate)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs md:text-sm font-medium mx-auto transition-all duration-300 relative ${
                        isSameDay(selectedDate, item.fullDate)
                          ? "border-2 border-slate-600 text-slate-600 bg-slate-50 shadow-md"
                          : item.isToday
                            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                            : item.day === "SÁB" || item.day === "DOM"
                              ? "text-gray-400 hover:bg-gray-50"
                              : "text-slate-700 hover:bg-slate-50 hover:shadow-sm"
                      }`}
                    >
                      {item.date}
                      {item.isToday && !isSameDay(selectedDate, item.fullDate) && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                    </button>
                    {/* dots under day if events exist */}
                    {(() => {
                      const types = getEventTypesForDate(item.fullDate)
                      return (
                        <div className="flex items-center justify-center gap-1 mt-1 h-1.5">
                          {types.has("class") && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {types.has("canteen") && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                          {types.has("exam") && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                          {types.has("event") && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {types.has("meeting") && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                {eventsLoading ? (
                  <EventSkeleton />
                ) : selectedEvents.length > 0 ? (
                  selectedEvents.map((event: EventType, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        event.type === "class"
                          ? "bg-blue-50 border-blue-200"
                          : event.type === "exam"
                            ? "bg-orange-50 border-orange-200"
                            : event.type === "canteen"
                              ? "bg-yellow-50 border-yellow-200"
                              : event.type === "event"
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.type === "class"
                                ? "bg-blue-500"
                                : event.type === "exam"
                                  ? "bg-orange-500"
                                  : event.type === "canteen"
                                    ? "bg-yellow-500"
                                    : event.type === "event"
                                      ? "bg-green-500"
                                      : "bg-yellow-400"
                          }`}
                        ></div>
                        <span className="text-sm text-slate-700 font-medium">
                          {event.time} - {event.title}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">No hay eventos programados para este día</div>
                )}
              </div>

              <div className="text-center">
                <Link
                  href="/calendario"
                  className="inline-block text-slate-600 text-sm hover:underline font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Ver calendario completo
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-slate-700">Próxima clase</h2>
                <Link
                  href="/cursos"
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium transition-colors group"
                >
                  <span>Mis Cursos</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="border-l-4 border-slate-600 pl-4">
                {nextClassLoading ? (
                  <InlineNextClassSkeleton />
                ) : nextClass ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                      <h3 className="font-semibold text-lg text-slate-800">
                        {nextClass.courseTitle || nextClass.title.replace(/^.*?-\s*/, '')}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{nextClass.classroom} - {nextClass.sede}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-slate-700">
                        {nextClass.daysUntil === 0 
                          ? "Hoy"
                          : nextClass.daysUntil === 1
                            ? "Mañana"
                            : `En ${nextClass.daysUntil} días`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{nextClass.time}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">No hay clases próximas</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-700">Saldo</h3>
                  <Link
                    href="/billetera"
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium transition-colors group"
                  >
                    <span>Billetera</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                {balanceLoading ? (
                  <InlineBalanceSkeleton />
                ) : (
                <AnimatedBalance 
                    amount={Math.trunc(balance ?? 0)} 
                  className="text-2xl md:text-4xl font-bold text-gray-900"
                  animated={false}
                  neutral={true}
                />
                )}
              </div>

              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-700">Mis reservas</h3>
                  <Link
                    href="/comedor"
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium transition-colors group"
                  >
                    <span>Comedor</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                {reservationsLoading ? (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden h-4 w-24 bg-gray-200 rounded">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="relative overflow-hidden h-4 w-32 bg-gray-200 rounded">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                  </div>
                ) : reservationsError ? (
                  <p className="text-red-500 text-sm">No se pudieron cargar las reservas</p>
                ) : (() => {
                  // Filtrar reservas futuras y ordenar por fecha más cercana
                  const now = new Date()
                  now.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
                  
                  const futureReservations = (reservations || [])
                    .filter(r => {
                      try {
                        const reservationDate = new Date(r.date)
                        reservationDate.setHours(0, 0, 0, 0)
                        return reservationDate >= now
                      } catch {
                        return false
                      }
                    })
                    .sort((a, b) => {
                      try {
                        const dateA = new Date(a.date).getTime()
                        const dateB = new Date(b.date).getTime()
                        return dateA - dateB
                      } catch {
                        return 0
                      }
                    })

                  if (futureReservations.length === 0) {
                    return (
                      <div className="text-sm text-gray-500">
                        <p>No hay próximas reservas</p>
                      </div>
                    )
                  }

                  // Obtener la próxima reserva
                  const nextReservation = futureReservations[0]
                  
                  // Formatear fecha
                  let formattedDate = ''
                  let formattedTime = ''
                  
                  try {
                    const reservationDate = new Date(nextReservation.date)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const reservationDay = new Date(reservationDate)
                    reservationDay.setHours(0, 0, 0, 0)
                    
                    const diffTime = reservationDay.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    if (diffDays === 0) {
                      formattedDate = 'Hoy'
                    } else if (diffDays === 1) {
                      formattedDate = 'Mañana'
                    } else {
                      const day = reservationDate.getDate()
                      const month = reservationDate.toLocaleDateString('es-ES', { month: 'short' })
                      formattedDate = `${day} ${month}`
                    }
                    
                    // Formatear hora
                    formattedTime = nextReservation.timeRange || (() => {
                      const hh = String(reservationDate.getHours()).padStart(2, '0')
                      const mm = String(reservationDate.getMinutes()).padStart(2, '0')
                      return `${hh}:${mm}`
                    })()
                  } catch (e) {
                    formattedDate = 'Fecha no disponible'
                    formattedTime = nextReservation.timeRange || 'Hora no disponible'
                  }

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-slate-700">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{formattedTime}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="h-24" />
    </>
  )
}
