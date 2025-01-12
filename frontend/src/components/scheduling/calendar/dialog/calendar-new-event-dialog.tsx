import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCalendarContext } from '../calendar-context'
import { format } from 'date-fns'
import { ColorPicker } from '../../form/color-picker'
import { DateTimePicker } from '../../form/date-time-picker'
import { CalendarEvent, Patient } from '../calendar-types'

// TODO: Update schema when implementing patient search
// - Remove title field (will be auto-generated from patient name)
// - Add patientId field for storing selected patient's ID
const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'), // This will be patient's name
    start: z.string().datetime(),
    end: z.string().datetime(),
    color: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start)
      const end = new Date(data.end)
      return end >= start
    },
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  )

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } =
    useCalendarContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
      color: 'Scheduled',
    },
  })

  // TODO: Implement patient search functionality
  // 1. Create a new component for patient search (e.g., PatientSearchInput)
  // 2. Add state for selected patient
  // 3. Update onSubmit to use selected patient's data
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Replace this temporary patient data with actual selected patient
    const mockPatient: Patient = {
      id: crypto.randomUUID(),
      first_name: values.title.split(' ')[0] || '',
      last_name: values.title.split(' ')[1] || '',
      email: '',
      profile_image: ''
    }

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: values.title,
      start: new Date(values.start),
      end: new Date(values.end),
      color: values.color,
      patient: mockPatient,
      status: 'scheduled' // Default status for new appointments
    }

    setEvents([...events, newEvent])
    setNewEventDialogOpen(false)
    form.reset()
  }

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent className='text-foreground'>
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* TODO: Replace this with PatientSearchInput component
                Implementation steps:
                1. Create component that uses combobox or command
                2. Add async search functionality
                3. Display patient details in dropdown
                4. Handle selection to update form
            */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Patient</FormLabel>
                  <FormControl>
                    <Input placeholder="Search for patient..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">End</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Status</FormLabel>
                  <FormControl>
                    <ColorPicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Create Appointment</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}