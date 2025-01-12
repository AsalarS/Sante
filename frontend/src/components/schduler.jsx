import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AppointmentDialog } from "./Dialogs/appointmentDialog";

const generateHours = () => {
  const hours = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    hours.push(`${hourStr}:00`);
    hours.push(`${hourStr}:20`);
    hours.push(`${hourStr}:40`);
  }
  return hours;
};

const to12HourFormat = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isWithinShiftHours = (timeSlot, shiftStart, shiftEnd) => {
  // Handle empty or invalid times
  if (!timeSlot || !shiftStart || !shiftEnd) return false;
  
  const slotMinutes = timeToMinutes(timeSlot);
  const startMinutes = timeToMinutes(shiftStart);
  const endMinutes = timeToMinutes(shiftEnd);

  if (startMinutes > endMinutes) {
    // Overnight shift
    return slotMinutes >= startMinutes || slotMinutes <= endMinutes;
  } else {
    // Same day shift - include exact start time
    return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
  }
};

const isAvailableDay = (availableDays, currentDate) => {
  const dayName = new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long' });
  return availableDays.includes(dayName);
};

const Scheduler = ({ scheduleData, date, appointmentData, onSaveSuccess }) => {
  const hours = generateHours();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!scheduleData) return;

    const processedEvents = scheduleData.flatMap((schedule) => {
      return schedule.appointments.map((appointment) => ({
        id: appointment.id,
        doctorId: schedule.doctor.id,
        time: appointment.time,
        status: appointment.status,
        appointment: {
          id: appointment.id,
          patient_id: appointment.patient_id,
          patient_first_name: appointment.patient_first_name,
          patient_last_name: appointment.patient_last_name,
          patient_cpr: appointment.patient_cpr,
          patient_email: appointment.patient_email,
          status: appointment.status
        }
      }));
    });

    setEvents(processedEvents);
  }, [scheduleData]);

  const [highlighted, setHighlighted] = useState({ row: null, col: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState(null);

  useEffect(() => {
    if (appointmentData) {
      setSelectedCellData({
        doctorId: appointmentData?.doctor?.id,
        doctorName: appointmentData?.doctor?.first_name + ' ' + appointmentData?.doctor?.last_name,
        office: appointmentData?.office_number,
        date: appointmentData?.appointment_date,
        time: appointmentData?.appointment_time,
        app_id: appointmentData?.id,
        patient_id: appointmentData?.patient?.id,
        patient_first_name: appointmentData?.patient?.first_name,
        patient_last_name: appointmentData?.patient?.last_name,
        patient_email: appointmentData?.patient?.email,
        patient_cpr: appointmentData?.patient?.cpr,
        status: appointmentData?.status
      });
      setDialogOpen(true);
    }
  }, [appointmentData]);

  const handleCellHover = (row, col) => {
    setHighlighted({ row, col });
  };

  const handleCellLeave = () => {
    setHighlighted({ row: null, col: null });
  };

  const handleCellClick = (doctor, hour, appointment = null) => {
    const currentDate = new Date(date);
    const formattedDate = currentDate.toISOString().split('T')[0];
    
    setSelectedCellData({
      doctorId: doctor.id,
      doctorName: doctor.name,
      office: `Room ${doctor.office_number}`,
      date: formattedDate,
      time: hour,
      ...(appointment && {
        app_id: appointment.id,
        patient_id: appointment.appointment.patient_id,
        patient_first_name: appointment.appointment.patient_first_name,
        patient_last_name: appointment.appointment.patient_last_name,
        patient_email: appointment.appointment.patient_email,
        patient_cpr: appointment.appointment.patient_cpr,
        status: appointment.status
      })
    });
    setDialogOpen(true);
  };

  const findAppointment = (doctorId, hour) => {
    return events.find(
      event => event.doctorId === doctorId && event.time === hour
    );
  };

  const checkAvailability = (hour, doctor) => {
    // First check if there's an existing appointment
    const appointment = findAppointment(doctor.id, hour);
    if (appointment) return true; // Always show existing appointments
    
    // Then check shift hours and available days
    return isWithinShiftHours(hour, doctor.shift_start, doctor.shift_end) &&
           doctor.available_days.includes(new Date(date).toLocaleDateString('en-US', { weekday: 'long' }));
  };

  if (!scheduleData || scheduleData.length === 0) {
    return <div className="p-4 text-center">No schedule data available</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="inline-block min-w-full">
          <table className="w-full">
            <thead className="sticky top-0 bg-background z-10">
              <tr>
                <th className="bg-background px-3 py-2 w-32 min-w-[8rem] sticky left-0 z-20 text-center text-foreground">Time</th>
                {scheduleData.map((schedule, rowIndex) => (
                  <th
                    key={rowIndex}
                    className={`bg-btn-normal text-foreground px-3 py-2 text-sm text-center min-w-[200px]
                              ${highlighted.row === rowIndex ? "bg-btn-hover" : ""}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{schedule.doctor.name}</span>
                      <span className="text-xs text-muted-foreground">{schedule.doctor.specialization}</span>
                      <span className="text-xs text-muted-foreground">Room {schedule.doctor.office_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {to12HourFormat(schedule.doctor.shift_start)} - {to12HourFormat(schedule.doctor.shift_end)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {hours.map((hour, colIndex) => (
                <tr key={colIndex}>
                  <td
                    className={`bg-background px-3 py-2 text-sm text-foreground sticky left-0 z-10 text-center
                              ${highlighted.col === colIndex ? "bg-btn-hover" : ""}`}
                    onMouseEnter={() => handleCellHover(null, colIndex)}
                    onMouseLeave={handleCellLeave}
                  >
                    {to12HourFormat(hour)}
                  </td>

                  {scheduleData.map((schedule, rowIndex) => {
                    const appointment = findAppointment(schedule.doctor.id, hour);
                    const isAvailable = checkAvailability(hour, schedule.doctor);

                    return (
                      <td
                        key={rowIndex}
                        className={`border-y border-border/50 px-3 py-2 text-center text-sm relative h-24
                                  ${!isAvailable && !appointment ? 'bg-gray-100 dark:bg-red-500/5 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-primary/10'}`}
                        onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                        onMouseLeave={handleCellLeave}
                        onClick={() => (isAvailable || appointment) && handleCellClick(schedule.doctor, hour, appointment)}
                      >
                        {appointment ? (
                          <HoverCard>
                            <HoverCardTrigger>
                              <div className="bg-chart-5/50 border-l-8 border-chart-5 text-foreground p-1 rounded cursor-pointer h-full flex flex-col text-left pl-2">
                                <span className="text-sm">
                                  {to12HourFormat(appointment.time)} - 
                                  <span className="font-semibold">{" "}{appointment.status}</span>
                                </span>
                                <span className="text-xl font-semibold truncate">
                                  {appointment.appointment.patient_first_name} {appointment.appointment.patient_last_name}
                                </span>
                                <span className="font-semibold text-foreground/50 leading-3">
                                  {appointment.appointment.patient_cpr}
                                </span>
                              </div>
                            </HoverCardTrigger>
                          </HoverCard>
                        ) : (
                          isAvailable && (
                            <div className="h-full flex items-center justify-center text-muted-foreground/15">
                              Available
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <AppointmentDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        appointment={selectedCellData}
        onSaveSuccess={() => {
          setDialogOpen(false);
          onSaveSuccess();
        }}
      />
    </div>
  );
};

export default Scheduler;