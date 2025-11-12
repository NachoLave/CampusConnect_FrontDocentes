'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { Day as RDPDay, DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

const EventsContext = React.createContext<Record<string, any> | undefined>(undefined)

// Componente para renderizar los puntos de eventos
// Siempre reserva el espacio para los puntitos, incluso si no hay eventos
function EventDots({ date }: { date: Date }) {
  const events = React.useContext(EventsContext)
  const dayKey = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const key = dayKey.trim()
  const meta = events?.[key] || {}
  
  // Siempre renderizar el contenedor para mantener el espacio reservado
  return (
    <div 
      className="flex items-center justify-center gap-0.5 mt-1 h-2 min-h-[8px] pointer-events-none"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {meta.clase && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Clase" />}
      {meta.examen && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="Examen" />}
      {meta.evento && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Evento" />}
      {meta.comedor && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" title="Comedor" />}
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label' as any,
  buttonVariant = 'ghost',
  formatters,
  components: externalComponents,
  eventsByDay,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  eventsByDay?: Record<string, any>
}) {
  // Removed getDefaultClassNames as it's not available in this version

  // Extraer components de props para evitar que sobrescriba nuestra definición
  const { components: propsComponents, ...restProps } = props as any

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
      formatters={{
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      } as any}
      classNames={{
        root: cn('w-fit'),
        months: cn(
          'flex gap-4 flex-col md:flex-row relative'
        ),
        month: cn('flex flex-col w-full gap-4'),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between'
        ),
        nav_button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        nav_button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none'
        ),
        // Hide the per-month caption since we already show a main header above the calendars
        // Hide per-month caption and related dropdown labels; we keep the main header nav above
        month_caption: cn('hidden'),
        dropdowns: cn('hidden'),
        dropdown_root: cn('hidden'),
        dropdown: cn('hidden'),
        caption_label: cn('hidden'),
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
        // No estilos especiales para el día actual: que se vea como cualquier otro
        today: cn(''),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground'
        ),
        disabled: cn(
          'text-muted-foreground opacity-50'
        ),
        hidden: cn('invisible'),
        ...classNames,
      }}
      {...restProps}
      components={{
        Root: ({ className, rootRef, ...props }: any) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }: any) => {
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
        WeekNumber: ({ children, ...props }: any) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        // Asegurar que nuestros componentes tengan prioridad sobre los externos
        ...(externalComponents || {}),
        ...(propsComponents || {}),
        // IMPORTANTE: DayContent debe estar DESPUÉS de externalComponents y propsComponents
        // para que tenga prioridad y no sea sobrescrito
        // En react-day-picker v8, DayContent renderiza el contenido dentro del botón del día
        DayContent: (dayContentProps: any) => {
          const { date, displayMonth, modifiers = {}, ...contentProps } = dayContentProps
          
          if (!date) {
            return null
          }
          
          return (
            <>
              <span
                className={cn(
                  'relative text-base font-normal',
                  modifiers.outside
                    ? 'text-gray-400 opacity-60 dark:text-gray-500'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                {date.getDate()}
              </span>
              <EventDots date={date} />
            </>
          )
        },
        // También personalizar DayButton para asegurar el layout correcto
        DayButton: (dayButtonProps: any) => {
          const { date, displayMonth, modifiers = {}, children, ...buttonProps } = dayButtonProps
          
          if (!date) {
            return <button {...buttonProps}>{children}</button>
          }
          
          return (
            <button
              {...buttonProps}
              className={cn(
                // Layout base
                'flex aspect-square size-auto w-full min-w-[60px] h-[80px] flex-col gap-1 leading-none font-normal',
                // Selected single -> show a subtle rounded rectangle outline
                modifiers.selected &&
                  !modifiers.range_start &&
                  !modifiers.range_end &&
                  !modifiers.range_middle &&
                  'bg-transparent rounded-lg text-gray-900 dark:text-white border border-gray-300 hover:bg-transparent',
                // Range visuals
                modifiers.range_middle && 'bg-accent text-accent-foreground rounded-none',
                modifiers.range_start && 'bg-primary text-primary-foreground rounded-md rounded-l-md',
                modifiers.range_end && 'bg-primary text-primary-foreground rounded-md rounded-r-md',
                // Estilos para días fuera del mes
                modifiers.outside && 'text-gray-400 opacity-60 dark:text-gray-500',
                // Estilos para el día de hoy
                modifiers.today && 'text-blue-600 dark:text-blue-400',
                // Estilos para el día seleccionado (si no es range)
                modifiers.selected &&
                  !modifiers.range_start &&
                  !modifiers.range_end &&
                  !modifiers.range_middle &&
                  'bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white',
                buttonProps.className
              )}
            >
              {children}
            </button>
          )
        },
      }}
    />
    </EventsContext.Provider>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers = {},
  ...props
}: any) {
  // Verificar que day existe y tiene date
  if (!day || !day.date) {
    console.error('CalendarDayButton: day o day.date es undefined', { day, props })
    return null
  }
  
  const dayKey = day.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  
  // Removed getDefaultClassNames as it's not available in this version
  const events = React.useContext(EventsContext)

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  
  // Normalizar la clave para asegurar que coincida exactamente con el formato usado en eventsByDay
  const key = dayKey.trim()
  let meta = events?.[key] || {}
  
  // Si no se encuentra con la clave normalizada, intentar con la clave original (por si hay espacios)
  if (!meta || Object.keys(meta).length === 0) {
    meta = events?.[dayKey] || {}
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
        // Selected single -> show a subtle rounded rectangle outline (like Home)
        'data-[selected-single=true]:bg-transparent data-[selected-single=true]:rounded-lg data-[selected-single=true]:text-gray-900 dark:data-[selected-single=true]:text-white',
        // Borde persistente para seleccionado
        'data-[selected-single=true]:border data-[selected-single=true]:border-gray-300 data-[selected-single=true]:hover:bg-transparent',
        // Range visuals (middle and edges)
        'data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground',
        'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
        'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
        // Focus styling
        'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50',
        'dark:hover:text-accent-foreground',
        // Layout
        'flex aspect-square size-auto w-full min-w-[60px] h-[80px] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]',
        // Range rounding helpers
        'data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md',
        // Number styling
        '[&>span]:text-sm [&>span]:opacity-70',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'relative text-base font-normal',
          modifiers.outside
            ? 'text-gray-400 opacity-60 dark:text-gray-500'
            : 'text-gray-900 dark:text-gray-100'
        )}
      >
        {day.date.getDate()}
      </span>
      {/* Render event dots - Siempre renderizar el contenedor para mantener alineación */}
      <div 
        className="flex items-center justify-center gap-0.5 mt-1 h-2 min-h-[8px] pointer-events-none"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        {meta.clase && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Clase" />}
        {meta.examen && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="Examen" />}
        {meta.evento && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Evento" />}
        {meta.comedor && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" title="Comedor" />}
      </div>
    </Button>
  )
}

export { Calendar, CalendarDayButton }
