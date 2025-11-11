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

  // Debug log - stringify snapshot so DevTools doesn't show a live object reference
  try {
    const snapshot = eventsByDay ? JSON.stringify(eventsByDay, Object.keys(eventsByDay || {}).slice(0, 200)) : '{}'
    console.log('📅 Calendar eventsByDay snapshot:', snapshot)
  } catch (err) {
    console.log('📅 Calendar recibiendo eventsByDay (non-serializable):', eventsByDay)
  }
  console.log('🚨 CALENDAR COMPONENT EJECUTÁNDOSE - CalendarDayButton configurado:', CalendarDayButton)
  console.log('🎨 CSS GLOBAL APLICADO - Puntos para días específicos')
  // No DOM-injected fake dots: dots are rendered from eventsByDay passed into the component


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
  // LOG MUY OBVIO PARA VER SI SE EJECUTA - include the computed key used to lookup eventsByDay
  const dayKey = day.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  console.log(`🚨 CalendarDayButton EJECUTÁNDOSE para día: ${dayKey}`)
  
  // Removed getDefaultClassNames as it's not available in this version
  const events = React.useContext(EventsContext)

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  const key = dayKey
  const meta = events?.[key] || {}

  // Debug más detallado - snapshot the event map keys and the resolved meta for this day
  try {
    const keys = events ? Object.keys(events).slice(0, 50) : []
    console.log(`🔍 Día ${key}: eventsByDay keys (sample):`, keys, 'resolved meta:', JSON.stringify(meta))
  } catch (err) {
    console.log(`🔍 Día ${key}:`, { events, meta })
  }

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
          'relative text-base font-bold',
          modifiers.outside
            ? 'text-gray-400 opacity-60 dark:text-gray-500'
            : 'text-gray-900 dark:text-gray-100'
        )}
      >
        {day.date.getDate()}
      </span>
      <div className="flex items-center justify-center gap-0.5 mt-1 min-h-[30px]">
        {/* Render event dots only when there is real data (provided via EventsContext/eventsByDay) */}
        {meta.clase ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Clase" /> : null}
        {meta.examen ? <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Examen" /> : null}
        {meta.evento ? <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Evento" /> : null}
        {meta.comedor ? <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Comedor" /> : null}
      </div>
    </Button>
  )
}

export { Calendar, CalendarDayButton }
