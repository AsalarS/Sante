import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCalendarContext } from '../../calendar-context'
import { useNavigate } from 'react-router-dom'

export default function CalendarHeaderActionsAdd() {
  const { setNewEventDialogOpen } = useCalendarContext()
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/receptionist/`);
  }

  return (
    <Button
      className="flex items-center gap-1 bg-primary text-background text-white"
      onClick={handleClick}
    >
      <Plus />
      Book
    </Button>
  )
}
