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
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// // Sample data for doctors and events
// const doctorsData = [
//   { id: "doc1", name: "Dr. Alice" },
//   { id: "doc2", name: "Dr. Bob" },
//   { id: "doc3", name: "Dr. Charlie" },
//   { id: "doc3", name: "Dr. Charlie" },
// ];

// const initialEvents = [
//   {
//     id: "e1",
//     doctorId: "doc1",
//     title: "Consultation",
//     start: "09:00",
//     end: "10:30",
//     patient: "John Doe",
//   },
//   {
//     id: "e2",
//     doctorId: "doc2",
//     title: "Check-up",
//     start: "11:00",
//     end: "12:00",
//     patient: "Jane Doe",
//   },
//   {
//     id: "e3",
//     doctorId: "doc1",
//     title: "Follow-up",
//     start: "13:00",
//     end: "14:00",
//     patient: "Jack Doe",
//   },
// ];

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

const Scheduler = ({ doctorsData, eventsData }) => {
  const hours = generateHours();
  const [doctors] = useState(doctorsData);
  const [events, setEvents] = useState(eventsData);
  const [highlighted, setHighlighted] = useState({ row: null, col: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");

  // Handle double-click on cell
  const handleCellDoubleClick = (event, doctorId, colIndex) => {
    const cellEvents = events.filter((event) => {
      const [eventStartHour, eventStartMinute] = event.start
        .split(":")
        .map(Number);
      const [eventEndHour, eventEndMinute] = event.end.split(":").map(Number);

      return (
        event.doctorId === doctorId &&
        eventStartHour * 60 + eventStartMinute <= (colIndex + 6) * 60 &&
        eventEndHour * 60 + eventEndMinute > (colIndex + 6) * 60
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
    const [endHour, endMinute] = end.split(":").map(Number);

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
              {doctors.map((doctor, rowIndex) => (
                <th
                  key={rowIndex}
                  className={`bg-btn-normal text-foreground px-3 py-2 text-sm text-center
                            ${
                              highlighted.row === rowIndex ? "bg-btn-hover" : ""
                            }`}
                >
                  {doctor.name}
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
                {doctors.map((doctor, rowIndex) => (
                  <td
                    key={rowIndex}
                    className={`border border-border px-3 py-2 text-center text-sm cursor-pointer relative h-24`}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={handleCellLeave}
                    onDoubleClick={(event) =>
                      handleCellDoubleClick(event, doctor.id, colIndex)
                    }
                  >
                    {/* Event rendering for each hour */}
                    {events
                      .filter((event) => {
                        const [eventStartHour, eventStartMinute] = event.start
                          .split(":")
                          .map(Number);
                        const [eventEndHour, eventEndMinute] = event.end
                          .split(":")
                          .map(Number);

                        return (
                          event.doctorId === doctor.id &&
                          eventStartHour * 60 + eventStartMinute <=
                            (colIndex + 6) * 60 &&
                          eventEndHour * 60 + eventEndMinute >
                            (colIndex + 6) * 60
                        );
                      })
                      .map((event) => {
                        const { top, height } = calculatePosition(
                          event.start,
                          event.end
                        );
                        return (
                          <HoverCard key={event.id}>
                            <HoverCardTrigger>
                              <div className="bg-chart-5/50 border-l-8 border-chart-5 text-white p-1 rounded cursor-pointer h-full flex flex-col text-left">
                                <span className="text-sm">
                                  {event.start + " - " + event.end}
                                </span>
                                <span className="text-xl font-semibold">
                                  {event.patient}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="flex text-left space-x-4">
                                <Avatar>
                                  <AvatarImage src="https://github.com/vercel.png" />
                                  <AvatarFallback>VC</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <h4 className="text-lg font-bold">
                                    {event.patient}
                                  </h4>
                                  <p className="text-sm">{event.patient}</p>
                                  <div className="flex items-center pt-2">
                                    <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                    <span className="text-xs text-muted-foreground">
                                      {event.start + " - " + event.end}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="text-foreground">
          <DialogHeader>
            <div className="content-center mb-4 font-bold">
              <span>View Appointment</span>
            <Badge className="text-white ml-2">Scheduled</Badge>
            </div>

          </DialogHeader>
          <Label>Patient</Label>
          <Input placeholder="Patient" />
          <Label>Doctor</Label>
          <Input placeholder="Doctor" className="mb-0" />
          <p className="text-sm text-muted text-right static">Room: 501</p>
          <div className="flex flex-row justify-around mt-0">
            <div>
              <Label>Date</Label>
              <Input placeholder="Date" />
            </div>
            <div>
              <Label>Time</Label>
              <Input placeholder="Time" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Scheduler;
