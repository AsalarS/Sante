import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import api from "@/api";
import Scheduler from "@/components/schduler";

export function ReceptionistAppointment() {
  const [schedule, setSchedule] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split("T")[0]);

  const handleDateChange = (date) => setAppointmentDate(date);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!appointmentDate) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/schedule/", {
          params: { date: appointmentDate },
        });

        if (response.status === 200) {
          setSchedule(response.data.schedule);
          console.log("Schedule data:", response.data.schedule);
        } else {
          console.error("Failed to fetch schedule:", response.statusText);
        }
      } catch (err) {
        setError("Failed to fetch schedule. Please try again.");
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [appointmentDate]); 

  return (
    <>
      <div className="flex flex-col p-4 gap-6 max-w-full">
        <div className="bg-background rounded-md w-full h-16 flex justify-between items-center p-4">
          <div className="flex justify-between">
            <Input placeholder="Search patients" />
          </div>
          <div className="flex justify-end gap-4">
            <Select>
              <SelectTrigger className="w-[180px] text-foreground">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="dep1">dep1</SelectItem>
                <SelectItem value="dep2">dep2</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker
              className="h-12"
              initialValue={appointmentDate}
              onDateChange={handleDateChange}
            />
            <Button
              className="mt-1"
              onClick={() => setAppointmentDate(new Date().toISOString().split("T")[0])}
            >
              Today
            </Button>
            <Button className="mt-1">Book Appointment</Button>
          </div>
        </div>

        {/* Apply overflow-x-auto here to make the table scrollable */}
        <div className="overflow-x-auto max-w-full">
          <Scheduler scheduleData={schedule ? schedule : []} />
        </div>
      </div>
    </>
  );
}
