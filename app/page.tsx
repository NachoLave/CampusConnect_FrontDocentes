"use client"

import type React from "react"
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, Zap, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatedBalance } from "@/components/ui/animated-balance"

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

type EventsData = {
  [key: number]: EventType[]
}

const eventsData: EventsData = {
  18: [
    { time: "09:00", title: "Matemáticas Avanzadas", type: "class" },
    { time: "15:00", title: "Tutoría Grupal", type: "meeting" },
  ],
  19: [
    { time: "08:00", title: "Arquitectura de Aplicaciones", type: "class" },
    { time: "14:00", title: "Desarrollo de Aplicaciones I", type: "class" },
    { time: "16:30", title: "Reunión departamento", type: "meeting" },
  ],
  20: [
    { time: "10:00", title: "Base de Datos", type: "class" },
    { time: "13:00", title: "Seminario de Investigación", type: "meeting" },
  ],
  21: [
    { time: "08:30", title: "Programación Web", type: "class" },
    { time: "16:00", title: "Evaluación Final", type: "exam" },
  ],
  22: [{ time: "09:00", title: "Proyecto Final", type: "class" }],
  23: [],
  24: [],
}

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())
  const [currentWeek, setCurrentWeek] = useState(0)
  const autoTransitionRef = useRef<NodeJS.Timeout | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)


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
    
    // Resetear el estado de transición después de la animación
    setTimeout(() => setIsTransitioning(false), 800)
  }

  const prevSlide = () => {
    if (isTransitioning) return // Prevenir múltiples clics rápidos
    
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
    startAutoTransition() // Reset timer
    
    // Resetear el estado de transición después de la animación
    setTimeout(() => setIsTransitioning(false), 800)
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
    const today = new Date()
    const currentDayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek // Calculate Monday of current week
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset + (currentWeek * 7))

    const weekDays = [
      { day: "LUN", dayIndex: 1 },
      { day: "MAR", dayIndex: 2 },
      { day: "MIÉ", dayIndex: 3 },
      { day: "JUE", dayIndex: 4 },
      { day: "VIE", dayIndex: 5 },
      { day: "SÁB", dayIndex: 6 },
      { day: "DOM", dayIndex: 0 },
    ]

    return weekDays.map((item, index) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + index)
      return {
        ...item,
        date: dayDate.getDate(),
        fullDate: dayDate,
        isToday: dayDate.toDateString() === today.toDateString(),
      }
    })
  }

  const nextWeek = () => {
    setCurrentWeek((prev) => prev + 1)
  }

  const prevWeek = () => {
    setCurrentWeek((prev) => prev - 1)
  }

  const goToToday = () => {
    setCurrentWeek(0)
    const today = new Date()
    setSelectedDate(today.getDate())
  }

  const weekDays = getCurrentWeekDays()
  const selectedEvents = eventsData[selectedDate] || []

  return (
    <>
      <div className="mb-6 flex items-center justify-end max-w-[95rem] mx-auto px-4"></div>

      <div className="mb-8">
        <div className="relative max-w-7xl mx-auto">
          <div
            ref={carouselRef}
            className="relative h-80 flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing select-none overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: isDragging ? `translateX(${dragOffset * 0.5}px)` : "translateX(0px)",
              transition: isDragging ? "none" : "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-64 transform -translate-x-2 rotate-y-12 scale-75 opacity-60 z-10 transition-all duration-700 ease-out hover:opacity-80 hover:scale-[0.78] carousel-side-image">
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl transition-shadow duration-500 hover:shadow-2xl">
                <Image
                  src={carouselImages[getPrevSlide()].src || "/placeholder.svg"}
                  alt={carouselImages[getPrevSlide()].alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/30 transition-colors duration-300 hover:bg-black/20" />
              </div>
            </div>

            <div className="relative w-[700px] h-72 z-20 transform transition-all duration-800 ease-out hover:scale-[1.02]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl">
                <Image
                  src={carouselImages[currentSlide].src || "/placeholder.svg"}
                  alt={carouselImages[currentSlide].alt}
                  fill
                  className="object-cover transition-all duration-800 ease-out"
                  priority
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 text-white transform transition-all duration-500 ease-out">
                  <h2 className="text-2xl font-bold mb-2 transform transition-transform duration-500 ease-out hover:translate-x-1">
                    {carouselImages[currentSlide].title}
                  </h2>
                  <p className="text-lg opacity-90 transform transition-all duration-500 ease-out delay-100 hover:translate-x-1">
                    {carouselImages[currentSlide].subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-64 transform translate-x-2 -rotate-y-12 scale-75 opacity-60 z-10 transition-all duration-700 ease-out hover:opacity-80 hover:scale-[0.78] carousel-side-image">
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl transition-shadow duration-500 hover:shadow-2xl">
                <Image
                  src={carouselImages[getNextSlide()].src || "/placeholder.svg"}
                  alt={carouselImages[getNextSlide()].alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/30 transition-colors duration-300 hover:bg-black/20" />
              </div>
            </div>

            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 glass-button rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-30 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 glass-button rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-30 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 transition-transform duration-200 group-hover:translate-x-0.5" />
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
                    setTimeout(() => setIsTransitioning(false), 800)
                  }
                }}
                disabled={isTransitioning}
                className={`transition-all duration-500 ease-out hover:scale-125 active:scale-95 disabled:cursor-not-allowed ${
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
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-700">Calendario semanal</h2>
                <div className="flex items-center gap-2">
                  <button onClick={prevWeek} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    Hoy ({new Date().getDate()})
                  </button>
                  <Calendar className="h-5 w-5 text-slate-600" />
                  <button onClick={nextWeek} className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 mb-6">
                {weekDays.map((item) => (
                  <div key={item.day} className="text-center">
                    <div
                      className={`text-sm font-medium mb-2 ${
                        item.day === "SÁB" || item.day === "DOM" ? "text-gray-400" : "text-slate-600"
                      }`}
                    >
                      {item.day}
                    </div>
                    <button
                      onClick={() => setSelectedDate(item.date)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium mx-auto transition-all duration-300 relative ${
                        selectedDate === item.date
                          ? "border-2 border-slate-600 text-slate-600 bg-slate-50 shadow-md"
                          : item.isToday
                            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg animate-pulse"
                            : item.day === "SÁB" || item.day === "DOM"
                              ? "text-gray-400 hover:bg-gray-50"
                              : "text-slate-700 hover:bg-slate-50 hover:shadow-sm"
                      }`}
                    >
                      {item.date}
                      {item.isToday && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event: EventType, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        event.type === "class"
                          ? "bg-blue-50 border-blue-200"
                          : event.type === "meeting"
                            ? "bg-gray-50 border-gray-200"
                            : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.type === "class"
                              ? "bg-slate-600"
                              : event.type === "meeting"
                                ? "bg-gray-400"
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
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-700">Próxima clase</h2>
                <Link
                  href="/cursos"
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium"
                >
                  Mis Cursos
                </Link>
              </div>

              <div className="border-l-4 border-slate-600 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-slate-600" />
                  <h3 className="font-semibold text-lg text-slate-800">Desarrollo de Aplicaciones II</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>18068</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">VIRTUAL</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-slate-700">Hoy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>14:00 - 18:00</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-700">Saldo</h3>
                </div>
                <AnimatedBalance 
                  amount={8235.50} 
                  className="text-3xl font-bold text-slate-900"
                  animated={true}
                />
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-700">Mis reservas</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-slate-700">Hoy</span>
                </div>
                <p className="text-gray-600">9:00 - 11:00</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
