import Calendar from "@/components/scheduling/calendar/calendar"
import { CalendarEvent, Mode } from '@/components/scheduling/calendar/calendar-types'
import { apiRequest } from '@/utility/generalUtility'
import { Loader2 } from 'lucide-react'

import { useState, useEffect } from 'react'

function ReceptionistAppointment() {
  const [events, setEvents] = useState < CalendarEvent[] > ([])
  const [mode, setMode] = useState < Mode > ('day')
  const [date, setDate] = useState < Date > (new Date())
  const [loading, setLoading] = useState < boolean > (true)
  return (
    <>
      <Calendar
        events={events || []}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
      />
    </>
  );
}

export default ReceptionistAppointment;