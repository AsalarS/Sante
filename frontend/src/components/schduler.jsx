import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
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

const Scheduler = ({ scheduleData }) => {
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

  // Handle double-click on cell
  const handleCellDoubleClick = (event, doctorId, colIndex) => {
    const cellEvents = events.filter((event) => {
      const [eventStartHour, eventStartMinute] = event.time
        .split(":")
        .map(Number);

      return (
        event.doctorId === doctorId &&
        eventStartHour * 60 + eventStartMinute <= (colIndex + 6) * 60 &&
        eventStartHour * 60 + eventStartMinute > (colIndex + 6) * 60
      );
    });

    if (cellEvents.length > 0) {
      setDialogContent("Edit existing event");
      console.log("Edit existing event");
    } else {
      setDialogContent("Create Event ");
      console.log("Create Event");
    }

    // Open dialog
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
                            ${
                              highlighted.row === rowIndex ? "bg-btn-hover" : ""
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
                            ${
                              highlighted.col === colIndex ? "bg-btn-hover" : ""
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
                    {schedule.slots
                      .filter((event) => {
                        const [eventStartHour, eventStartMinute] = event.time
                          .split(":")
                          .map(Number);

                        return (
                          eventStartHour * 60 + eventStartMinute <=
                            (colIndex + 6) * 60 &&
                          eventStartHour * 60 + eventStartMinute >
                            (colIndex + 6) * 60
                        );
                      })
                      .map((event) => {
                        const { top, height } = calculatePosition(
                          event.time,
                          event.time + 30
                        );
                        return (
                          <HoverCard key={event.id}>
                            <HoverCardTrigger>
                              <div className="bg-chart-5/50 border-l-8 border-chart-5 text-white p-1 rounded cursor-pointer h-full flex flex-col text-left">
                                <span className="text-sm">{event.time}</span>
                                <span className="text-xl font-semibold">
                                  {event.patient}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="flex text-left space-x-4">
                                <Avatar>
                                  <AvatarImage src="https://github.com/vercel.png" />
                                  <AvatarFallback>{event.patient.name}</AvatarFallback>
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
                            </HoverCardContent>
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
      <AppointmentDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
    </>
  );
};

export default Scheduler;
