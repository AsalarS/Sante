import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarDays } from "lucide-react";
import { AppointmentDialog } from "./appointmentDialog";

// Helper function to generate hours
const generateHours = () => {
  const hours = [];
  for (let hour = 6; hour < 20; hour++) {
    // 6 AM to 8 PM
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    hours.push(`${displayHour}:00 ${ampm}`);
    hours.push(`${displayHour}:30 ${ampm}`);
  }
  return hours;
};

const Scheduler = ({ scheduleData, date }) => {
  const hours = generateHours();
  const [doctors] = useState(
    scheduleData != null ? scheduleData.map((item) => item.doctor) : []
  );
  const [events, setEvents] = useState(
    scheduleData.flatMap((item) =>
      item.slots
        .filter((slot) => slot.appointment)
        .map((slot) => ({
          id: `${item.doctor.id}-${slot.time}`,
          doctorId: item.doctor.id,
          start: slot.time,
          end: slot.time,
          patient: slot.appointment.patient || "Unknown Patient",
        }))
    )
  );
  const [highlighted, setHighlighted] = useState({ row: null, col: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");
  const [selectedCellData, setSelectedCellData] = useState(null);

  // Handle double-click on cell
  const handleCellDoubleClick = (event, doctorId, colIndex) => {
    const doctorEntry = scheduleData.find(
      (item) => item.doctor.id === doctorId
    );

    if (!doctorEntry) {
      console.error("Doctor not found for ID:", doctorId);
      return;
    }

    const doctor = doctorEntry.doctor; // Extract doctor details
    const clickedHour = hours[colIndex]; // Get the hour using colIndex

    if (!clickedHour) {
      console.error("Clicked hour is undefined for column index:", colIndex);
      return;
    }

    const convertTo24HourFormat = (time) => { //Convert the time to 24 hour format to filter the time slots
      const [hour, minutePart] = time.split(":");
      const [minute, period] = minutePart.split(" ");
      let hour24 = parseInt(hour, 10);
      if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
      }
      return `${hour24.toString().padStart(2, "0")}:${minute}`;
    };

    const clickedHour24 = convertTo24HourFormat(clickedHour);
    const slot = doctorEntry.slots.find((slot) => slot.time === clickedHour24);
    
    const status = slot ? slot.status : "";  

    setSelectedCellData({
      app_id: slot.appointment.id,
      doctorName: doctor.name,
      doctorId: doctor.id,
      office: doctor.office_number,
      time: clickedHour,
      date: date,
      status: status,
      patient_id : slot.appointment?.patient_id,
      patient_first_name :slot.appointment?.patient_first_name,
      patient_last_name :slot.appointment?.patient_last_name,
      patient_email :slot.appointment?.patient_email,
      patient_cpr :slot.appointment?.patient_cpr,
    });

    setDialogOpen(true);
  };

  // Helper to calculate event positioning
  const calculatePosition = (start, end) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = (end || start).split(":").map(Number);

    const totalMinutesStart = (startHour - 6) * 60 + startMinute;
    const totalMinutesEnd = (endHour - 6) * 60 + endMinute;

    const top = (totalMinutesStart / (14 * 60)) * 100; // 14 hours span
    const height = ((totalMinutesEnd - totalMinutesStart) / (14 * 60)) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  const handleCellHover = (row, col) => {
    setHighlighted({ row, col });
  };

  const handleCellLeave = () => {
    setHighlighted({ row: null, col: null });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table-fixed min-w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr>
              {/* Empty header 0, 0 */}
              <th className="bg-background px-3 py-2"></th>

              {/* Doctor headers */}
              {scheduleData.map((schedule, rowIndex) => (
                <th
                  key={rowIndex}
                  className={`bg-btn-normal text-foreground px-3 py-2 text-sm text-center
                            ${highlighted.row === rowIndex ? "bg-btn-hover" : ""
                    }`}
                >
                  {schedule.doctor.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hours.map((hour, colIndex) => (
              <tr key={colIndex}>
                {/* Hour Row Header */}
                <td
                  className={`bg-background px-3 py-2 text-sm text-foreground cursor-pointer w-32 text-center
                            ${highlighted.col === colIndex ? "bg-btn-hover" : ""
                    }`}
                  onMouseEnter={() => handleCellHover(null, colIndex)}
                  onMouseLeave={handleCellLeave}
                >
                  {hour}
                </td>

                {/* event cells */}
                {scheduleData.map((schedule, rowIndex) => (
                  <td
                    key={rowIndex}
                    className={`border border-border px-3 py-2 text-center text-sm cursor-pointer relative h-24`}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={handleCellLeave}
                    onDoubleClick={(event) =>
                      handleCellDoubleClick(event, schedule.doctor.id, colIndex)
                    }
                  >
                    {/* Event rendering for each hour */}
                    {schedule.slots.filter((event) => {
                      const eventTimeIndex =
                        (parseInt(event.time.split(":")[0]) - 6) * 2 +
                        (parseInt(event.time.split(":")[1]) / 30);
                      return eventTimeIndex === colIndex;
                    })
                    .filter((slot) => slot.status !== "Available" && slot.appointment)
                    .map((event) => {
                      const { top, height } = calculatePosition(
                        event.time,
                        event.time + 30
                      );
                      return (
                        <HoverCard key={event.id}>
                          <HoverCardTrigger>
                            <div className="bg-chart-5/50 border-l-8 border-chart-5 text-white p-1 rounded cursor-pointer h-full flex flex-col text-left pl-2">
                              <span className="text-sm">{event.time} - <span className="font-semibold">{event.status}</span></span>
                              <span className="text-xl font-semibold">
                                {event.appointment.patient_first_name} {event.appointment.patient_last_name}
                              </span>
                              <span className="font-semibold text-foreground/50 leading-3">
                                {event.appointment.patient_cpr}
                              </span>
                            </div>
                          </HoverCardTrigger>
                          {/* <HoverCardContent>
                            <div className="flex text-left space-x-4">
                              <Avatar>
                                <AvatarImage src="https://github.com/vercel.png" />
                                <AvatarFallback>
                                  {event.patient.name}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold">
                                  {event.patient}
                                </h4>
                                <p className="text-sm">{event.patient}</p>
                                <div className="flex items-center pt-2">
                                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                  <span className="text-xs text-muted-foreground">
                                    {event.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent> */}
                        </HoverCard>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Dialog Component */}
      <AppointmentDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        appointment={selectedCellData}
      />
    </>
  );
};

export default Scheduler;
