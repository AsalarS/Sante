import { useCalendarContext } from '../../calendar-context'
import { format } from 'date-fns'
import CalendarHeaderDateIcon from './calendar-header-date-icon'
import CalendarHeaderDateChevrons from './calendar-header-date-chevrons'
import CalendarHeaderDateBadge from './calendar-header-date-badge'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function CalendarHeaderDate() {
  const { date } = useCalendarContext()
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole')
  const { id } = useParams()
  
  return (
    <div className="flex items-center gap-2 text-foreground">
      {(id !== undefined && typeof id === 'number' && !isNaN(id)) && (
        <div className="flex text-foreground bg-btn-normal rounded-md mr-4 items-center p-1 hover:bg-btn-normal/80 w-fit"
          onClick={() => {
            if (window.history.length > 1) {
              // Go back to the previous page
              navigate(-1);
            } else {
              // If there's no history, navigate to the /schedule page
              navigate(`/${userRole}/schedule`);
            }
          }}>
          <ChevronLeft size={24} />
        </div>
      )}
      <CalendarHeaderDateIcon />
      <div>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold">{format(date, 'MMMM yyyy')}</p>
          <CalendarHeaderDateBadge />
        </div>
        <CalendarHeaderDateChevrons />
      </div>
    </div>
  )
}
