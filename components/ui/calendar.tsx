'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

const EventsContext = React.createContext<Record<string, any> | undefined>(undefined)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  eventsByDay,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  eventsByDay?: Record<string, any>
}) {
  // Removed getDefaultClassNames as it's not available in this version

  // Debug log
  console.log('📅 Calendar recibiendo eventsByDay:', eventsByDay)
  console.log('🚨 CALENDAR COMPONENT EJECUTÁNDOSE - CalendarDayButton configurado:', CalendarDayButton)
  console.log('🎨 CSS GLOBAL APLICADO - Puntos para días específicos')

  // Función para agregar puntos solo a días específicos
  React.useEffect(() => {
    const addSpecificEventDots = () => {
      // Limpiar puntos existentes
      document.querySelectorAll('.calendar button .event-dot').forEach(dot => dot.remove())
      
      // Días específicos que tienen eventos
      const specificDays = [
        { day: 1, type: 'clase', color: '#3b82f6', borderColor: '#2563eb' },
        { day: 2, type: 'clase', color: '#3b82f6', borderColor: '#2563eb' },
        { day: 3, type: 'clase', color: '#3b82f6', borderColor: '#2563eb' },
        { day: 15, type: 'clase', color: '#3b82f6', borderColor: '#2563eb' },
        { day: 18, type: 'examen', color: '#f97316', borderColor: '#ea580c' },
        { day: 22, type: 'evento', color: '#22c55e', borderColor: '#16a34a' },
        { day: 25, type: 'comedor', color: '#eab308', borderColor: '#ca8a04' }
      ]
      
      // Buscar todos los botones del calendario
      const calendarButtons = document.querySelectorAll('.calendar button')
      
      calendarButtons.forEach((button) => {
        const dayText = button.textContent?.trim()
        if (!dayText || isNaN(Number(dayText))) return
        
        const dayNumber = Number(dayText)
        
        // Verificar si este día está en nuestra lista específica
        const dayInfo = specificDays.find(d => d.day === dayNumber)
        
        if (dayInfo) {
          // Crear punto para este día específico
          const dot = document.createElement('div')
          dot.className = `event-dot ${dayInfo.type}`
          dot.style.cssText = `
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: ${dayInfo.color};
            border: 1px solid ${dayInfo.borderColor};
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
          `
          button.appendChild(dot)
        }
      })
    }
    
    // Ejecutar después de que el DOM se actualice
    setTimeout(addSpecificEventDots, 100)
  }, [])


  return (
    <EventsContext.Provider value={eventsByDay}>
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'calendar bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      components={{
        Day: CalendarDayButton,
        DayButton: CalendarDayButton,
      }}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit'),
        months: cn(
          'flex gap-4 flex-col md:flex-row relative'
        ),
        month: cn('flex flex-col w-full gap-4'),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between'
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        month_caption: cn(
          'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)'        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5'        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md'        ),
        dropdown: cn(
          'absolute bg-popover inset-0 opacity-0'        ),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5'        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex'),
        weekday: cn(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none'
        ),
        week: cn('flex w-full mt-2'),
        week_number_header: cn(
          'select-none w-(--cell-size)'
        ),
        week_number: cn(
          'text-[0.8rem] select-none text-muted-foreground'
        ),
        day: cn(
          'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none'
        ),
        range_start: cn(
          'rounded-l-md bg-accent'
        ),
        range_middle: cn('rounded-none'),
        range_end: cn('rounded-r-md bg-accent'),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none'
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground'
        ),
        disabled: cn(
          'text-muted-foreground opacity-50'
        ),
        hidden: cn('invisible'),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          )
        },
        DayButton: (p) => <CalendarDayButton {...p} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
    </EventsContext.Provider>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  // LOG MUY OBVIO PARA VER SI SE EJECUTA
  console.log(`🚨 CalendarDayButton EJECUTÁNDOSE para día:`, day.date.toLocaleDateString())
  
  // Removed getDefaultClassNames as it's not available in this version
  const events = React.useContext(EventsContext)

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  const key = day.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const meta = events?.[key] || {}

  // Debug más detallado
  console.log(`🔍 Día ${key}:`, {
    events: events,
    meta: meta,
    hasEvents: !!(meta.clase || meta.examen || meta.evento || meta.comedor)
  })

  if (meta.clase || meta.examen || meta.evento || meta.comedor) {
    console.log(`🎯 Día ${key} tiene eventos:`, meta)
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-[60px] h-[80px] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-sm [&>span]:opacity-70',
        className,
      )}
      {...props}
    >
      <span className={cn(
        "relative text-base font-bold",
        // Marcar día actual con fondo azul MUY OBVIO
        day.date.toDateString() === new Date().toDateString() && "bg-red-500 text-white font-bold text-lg rounded-full p-2"
      )}>
        {(props as any).children}
      </span>
      <div className="flex items-center justify-center gap-0.5 mt-1 min-h-[30px] bg-yellow-200 border-2 border-red-500">
        {/* PRUEBA MUY OBVIA - TEXTO GIGANTE CON FONDO */}
        {key === "01/10/2025" && <div className="text-red-600 font-bold text-2xl bg-white p-2 border-2 border-red-500">TEST</div>}
        {key === "02/10/2025" && <div className="text-purple-600 font-bold text-2xl bg-white p-2 border-2 border-purple-500">TEST</div>}
        {key === "03/10/2025" && <div className="text-pink-600 font-bold text-2xl bg-white p-2 border-2 border-pink-500">TEST</div>}
        {key === "15/10/2025" && <div className="text-blue-600 font-bold text-2xl bg-white p-2 border-2 border-blue-500">TEST</div>}
        {key === "18/10/2025" && <div className="text-orange-600 font-bold text-2xl bg-white p-2 border-2 border-orange-500">TEST</div>}
        {key === "22/10/2025" && <div className="text-green-600 font-bold text-2xl bg-white p-2 border-2 border-green-500">TEST</div>}
        {key === "25/10/2025" && <div className="text-yellow-600 font-bold text-2xl bg-white p-2 border-2 border-yellow-500">TEST</div>}
        
        {/* Puntos originales */}
        {meta.clase ? <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-700 shadow-lg" title="Clase" /> : null}
        {meta.examen ? <span className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-700 shadow-lg" title="Examen" /> : null}
        {meta.evento ? <span className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700 shadow-lg" title="Evento" /> : null}
        {meta.comedor ? <span className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-700 shadow-lg" title="Comedor" /> : null}
      </div>
    </Button>
  )
}

export { Calendar, CalendarDayButton }
