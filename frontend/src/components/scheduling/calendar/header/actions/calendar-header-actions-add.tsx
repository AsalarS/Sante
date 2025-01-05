import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCalendarContext } from '../../calendar-context'

export default function CalendarHeaderActionsAdd() {
  const { setNewEventDialogOpen } = useCalendarContext()
  return (
    <Button
      className="flex items-center gap-1 bg-primary text-background text-white"
      onClick={() => setNewEventDialogOpen(true)}
    >
      <Plus />
      Book
    </Button>
  )
}
