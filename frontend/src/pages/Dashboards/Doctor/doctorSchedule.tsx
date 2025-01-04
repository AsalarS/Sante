'use client'

import Calendar from '@/components/scheduling/calendar/calendar'
import { CalendarEvent, Mode } from '@/components/scheduling/calendar/calendar-types'
import { apiRequest } from '@/utility/generalUtility'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

const statusColors = {
  Scheduled: "primary",
  Completed: "green-400",
  Cancelled: "red-400",
  "No Show": "orange-400",
};

export default function DoctorSchedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [mode, setMode] = useState<Mode>('day')
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState<boolean>(true)

  const fetchSchedule = async () => {
    try {
      const response = await apiRequest('/api/user/schedule/', 'Error fetching schedule')
      const calendarEvents = response.map((event: any) => ({
        id: event.id,
        title: `${event.patient.first_name} ${event.patient.last_name}`,
        color: statusColors[event.status as keyof typeof statusColors],
        start: new Date(event.start),
        end: new Date(event.end),
        patient: {
          id: event.patient.id,
          first_name: event.patient.first_name,
          last_name: event.patient.last_name,
          email: event.patient.email,
          profile_image: event.patient.profile_image,
        },
        status: event.status,
      }))
      setEvents(calendarEvents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  return (
    <>
      {loading ? (
        <Loader2 className='w-10 h-10 text-primary animate-spin m-auto' />
      ) : (
        <Calendar
          events={events || []}
          setEvents={setEvents}
          mode={mode}
          setMode={setMode}
          date={date}
          setDate={setDate}
        />
      )}
    </>
  )
}
