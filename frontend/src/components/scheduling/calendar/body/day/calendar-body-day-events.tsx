import { useNavigate } from 'react-router-dom'
import { useCalendarContext } from '../../calendar-context'
import { isSameDay } from 'date-fns'

export default function CalendarBodyDayEvents() {
  const navigate = useNavigate()
  const { events, date, setManageEventDialogOpen, setSelectedEvent } =
    useCalendarContext()
  const userRole = localStorage.getItem('role')
  const dayEvents = events.filter((event) => isSameDay(event.start, date))
  return !!dayEvents.length ? (
    <div className="flex flex-col gap-2 pl-2 pr-2 border-border">
      <p className="font-medium p-2 pb-0 font-heading text-foreground">Appointments</p>
      <div className="flex flex-col gap-2">

        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-2 px-2 cursor-pointer"
            onClick={(e) => {
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
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full bg-${event.color}`} />
              <p className="text-muted-foreground text-sm font-medium">
                {event.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="p-2 text-muted-foreground border-border">No appointments today...</div>
  )
}
