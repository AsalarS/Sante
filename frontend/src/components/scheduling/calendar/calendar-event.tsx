import { CalendarEvent as CalendarEventType } from '@/components/scheduling/calendar/calendar-types'
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCalendarContext } from './calendar-context'
import { useNavigate } from 'react-router-dom'

interface EventPosition {
  left: string
  width: string
  top: string
  height: string
}

function getOverlappingEvents(
  currentEvent: CalendarEventType,
  events: CalendarEventType[]
): CalendarEventType[] {
  return events.filter((event) => {
    if (event.id === currentEvent.id) return false
    return (
      currentEvent.start < event.end &&
      currentEvent.end > event.start &&
      isSameDay(currentEvent.start, event.start)
    )
  })
}

function calculateEventPosition(
  event: CalendarEventType,
  allEvents: CalendarEventType[]
): EventPosition {
  const overlappingEvents = getOverlappingEvents(event, allEvents)
  const group = [event, ...overlappingEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  const position = group.indexOf(event)
  const width = `${100 / (overlappingEvents.length + 1)}%`
  const left = `${(position * 100) / (overlappingEvents.length + 1)}%`

  const startHour = event.start.getHours()
  const startMinutes = event.start.getMinutes()

  let endHour = event.end.getHours()
  let endMinutes = event.end.getMinutes()

  if (!isSameDay(event.start, event.end)) {
    endHour = 23
    endMinutes = 59
  }

  const topPosition = startHour * 128 + (startMinutes / 60) * 128
  const duration = endHour * 60 + endMinutes - (startHour * 60 + startMinutes)
  const height = (duration / 60) * 128

  return {
    left,
    width,
    top: `${topPosition}px`,
    height: `${height}px`,
  }
}

export default function CalendarEvent({
  event,
  month = false,
  className,
}: {
  event: CalendarEventType
  month?: boolean
  className?: string
}) {
  const { events, setSelectedEvent, setManageEventDialogOpen } =
    useCalendarContext()

  const style = month ? {} : calculateEventPosition(event, events)
  const userRole = localStorage.getItem('role')
  const navigate = useNavigate()  
  return (
    <div
      key={event.id}
      className={cn(
        `px-3 py-1.5 rounded-md b truncate cursor-pointer text-foreground transition-all duration-300 bg-${event.color}/20 hover:bg-${event.color}/20 border border-${event.color}`,
        !month && 'absolute',
        className
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        if (userRole !== 'receptionist') {
          navigate(`/doctor/patients/appointment/${event.id}`, {
            state: { patientId: event?.patient?.id }
          })
        } else {
          setSelectedEvent(event)
          setManageEventDialogOpen(true)
        }
      }}
    >
      <div
        className={cn(
          `flex flex-row w-full items-center gap-4 text-${event.color}`,
          month && 'flex-row items-center justify-between'
        )}
      >
        <p className={cn('font-bold truncate', month && 'text-xs')}>
          {event.title}
        </p>
        <p className={cn('text-sm', month && 'text-xs')}>
          <span>{format(event.start, 'h:mm a')}</span>
          <span className={cn('mx-1', month && 'hidden')}>-</span>
          <span className={cn(month && 'hidden')}>
            {format(event.end, 'h:mm a')}
          </span>
        </p>
      </div>
    </div>
  )
}
