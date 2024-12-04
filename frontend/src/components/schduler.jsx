import { useState } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CalendarDays } from "lucide-react"

// Sample data for doctors and events
const doctorsData = [
    { id: 'doc1', name: 'Dr. Alice' },
    { id: 'doc2', name: 'Dr. Bob' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },
    { id: 'doc3', name: 'Dr. Charlie' },

    // Add more doctors as needed
];

const initialEvents = [
    {
        id: 'e1',
        doctorId: 'doc1',
        title: 'Consultation',
        start: '09:00',
        end: '10:30',
        patient: 'John Doe',
    },
    {
        id: 'e2',
        doctorId: 'doc2',
        title: 'Check-up',
        start: '11:00',
        end: '12:00',
        patient: 'Jane Doe'
    },
    {
        id: 'e3',
        doctorId: 'doc1',
        title: 'Follow-up',
        start: '13:00',
        end: '14:00',
        patient: 'Jack Doe'
    },

    // Add more events as needed
];

// Helper function to generate hours
const generateHours = () => {
    const hours = [];
    for (let hour = 6; hour < 20; hour++) { // 6 AM to 8 PM
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        hours.push(`${displayHour}:00 ${ampm}`);
        hours.push(`${displayHour}:30 ${ampm}`);
    }
    return hours;
};

const Scheduler = () => {
    const hours = generateHours();
    const [doctors] = useState(doctorsData);
    const [events, setEvents] = useState(initialEvents);
    const [highlighted, setHighlighted] = useState({ row: null, col: null });

    // Helper to calculate event positioning
    const calculatePosition = (start, end) => {
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);

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
                            ${highlighted.row === rowIndex ? 'bg-btn-hover' : ''}`}
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
                                    className={`bg-background px-3 py-2 text-sm text-foreground cursor-pointer
                            ${highlighted.col === colIndex ? 'bg-btn-hover' : ''}`}
                                    onMouseEnter={() => handleCellHover(null, colIndex)}
                                    onMouseLeave={handleCellLeave}
                                >
                                    {hour}
                                </td>

                                {/* Doctor cells */}
                                {doctors.map((doctor, rowIndex) => (
                                    <td
                                        key={rowIndex}
                                        className={`border border-border px-3 py-2 text-center text-sm cursor-pointer relative h-24`}
                                        onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                                        onMouseLeave={handleCellLeave}
                                    >
                                        {/* Event rendering for each hour */}
                                        {events
                                            .filter((event) => {
                                                const [eventStartHour, eventStartMinute] = event.start.split(':').map(Number);
                                                const [eventEndHour, eventEndMinute] = event.end.split(':').map(Number);

                                                return (
                                                    event.doctorId === doctor.id &&
                                                    ((eventStartHour * 60 + eventStartMinute) <= (colIndex + 6) * 60 &&
                                                        (eventEndHour * 60 + eventEndMinute) > (colIndex + 6) * 60)
                                                );
                                            })
                                            .map((event) => {
                                                const { top, height } = calculatePosition(event.start, event.end);
                                                return (
                                                    <HoverCard key={event.id}>
                                                        <HoverCardTrigger>
                                                            <div
                                                                className="bg-chart-5/50 border-l-8 border-chart-5 text-white p-1 rounded cursor-pointer h-full flex flex-col text-left"
                                                            >
                                                                <span className='text-sm'>
                                                                    {event.start + " - " + event.end}
                                                                </span>
                                                                <span className='text-xl font-semibold'>
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
                                                                    <h4 className="text-lg font-bold">{event.patient}</h4>
                                                                    <p className="text-sm">
                                                                        {event.patient}
                                                                    </p>
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

    );
};


export default Scheduler;
