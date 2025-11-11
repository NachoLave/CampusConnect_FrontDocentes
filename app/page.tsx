"use client"

import type React from "react"
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, Zap, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"
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
    alt: "Expo Educativa 2024",
    title: "Expo Educativa 2024",
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
  type: "class" | "meeting" | "exam"
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

  // Calcular rango de semana para eventos
  const getWeekRange = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 6)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    return {
      start: formatDate(start),
      end: formatDate(end)
    }
  }

  const weekRange = getWeekRange()
  const { events: weeklyEvents, isLoading: eventsLoading } = useWeeklyCalendar(weekRange.start, weekRange.end)

  // Debug: Log de eventos recibidos
  console.log('🔍 Dashboard - Eventos semanales recibidos:', weeklyEvents)
  console.log('📅 Dashboard - Rango de semana:', weekRange)


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

  const weekDays = getCurrentWeekDays()
  const monthYear = getMonthYear()

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

  // Eventos del día seleccionado usando datos del backend
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const selectedEvents: EventType[] = weeklyEvents
    .filter((event) => event.date === selectedDateStr)
    .map((event) => ({
      time: event.time,
      title: event.title,
      type: event.type as "class" | "meeting" | "exam",
    }))

  // Tipos de eventos por día de la semana (para los puntitos)
  const getEventTypesForDate = (date: Date): Set<string> => {
    const types = new Set<string>()
    const dateStr = date.toISOString().split('T')[0]
    weeklyEvents.forEach((event) => {
      if (event.date === dateStr) {
        types.add(event.type)
      }
    })
    return types
  }
  
  // Comparar fechas correctamente
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  return (
    <>
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
                          {types.has("meeting") && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                          {types.has("exam") && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
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
                          : event.type === "meeting"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.type === "class"
                                ? "bg-slate-600"
                                : event.type === "meeting"
                                  ? "bg-yellow-400"
                                  : "bg-orange-500"
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
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium"
                >
                  Mis Cursos
                </Link>
              </div>

              <div className="border-l-4 border-slate-600 pl-4">
                {nextClassLoading ? (
                  <InlineNextClassSkeleton />
                ) : nextClass ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                      <h3 className="font-semibold text-lg text-slate-800">{nextClass.title.replace(/^Clase:\s*/i, '')}</h3>
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
                </div>
                {balanceLoading || balanceError ? (
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
                </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-slate-700">Hoy</span>
                  </div>
                  {/* Use canteen reservations from backend instead of mock */}
                  {
                    (() => {
                      const getDatePart = (d: any) => {
                        if (!d) return ''
                        try {
                          const dt = new Date(d)
                          return dt.toISOString().split('T')[0]
                        } catch (e) {
                          return String(d).split('T')[0]
                        }
                      }

                      const todayStr = new Date().toISOString().split('T')[0]
                      const todays = (reservations || []).filter(r => getDatePart(r.date) === todayStr)

                      if (reservationsLoading) {
                        return <p className="text-gray-600">Cargando reservas...</p>
                      }

                      if (reservationsError) {
                        return <p className="text-red-500">No se pudieron cargar las reservas</p>
                      }

                      if (!todays || todays.length === 0) {
                        return <p className="text-gray-600">No tenes reservas hoy</p>
                      }

                      // Show first reservation timeRange or formatted time
                      const r = todays[0]
                      const timeText = r.timeRange || (() => {
                        try {
                          const dt = new Date(r.date)
                          const hh = String(dt.getHours()).padStart(2,'0')
                          const mm = String(dt.getMinutes()).padStart(2,'0')
                          return `${hh}:${mm}`
                        } catch (e) { return '' }
                      })()

                      return <p className="text-gray-600">{timeText} {r.total ? `• ${r.total}` : ''}</p>
                    })()
                  }
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="h-24" />
    </>
  )
}
