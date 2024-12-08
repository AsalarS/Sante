import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Input } from "@/components/ui/input";
import Scheduler from "@/components/schduler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import api from "@/api";

export function ReceptionistAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");

    const handleDateChange = (event) => setAppointmentDate(event.target.value);

  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentDate) return;

      setLoading(true);
      setError(null);

      try {
        // Perform both requests in parallel
        const [doctorsResponse, appointmentsResponse] = await Promise.all([
          api.post("/api/available-doctors/", {
            appointment_date: appointmentDate,
          }),
          api.post("/api/appointments-by-date/", {
            appointment_date: appointmentDate,
          }),
        ]);

        // Set data from responses
        if (doctorsResponse.status === 200) {
          setDoctors(doctorsResponse.data);
          console.log("doctorsResponse.data", doctorsResponse.data);
          
        } else {
          console.error("Failed to fetch doctors:", doctorsResponse.statusText);
        }

        if (appointmentsResponse.status === 200) {
          setAppointments(appointmentsResponse.data);
        } else {
          console.error(
            "Failed to fetch appointments:",
            appointmentsResponse.statusText
          );
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentDate]); // Trigger whenever appointmentDate changes
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
            <DatePicker className="h-12" initialValue={appointmentDate} onDateChange={(date) => setAppointmentDate(date)}/>
            <Button className="mt-1">Today</Button>
            <Button className="mt-1">Book Appointment</Button>
          </div>
        </div>

        {/* Apply overflow-x-auto here to make the table scrollable */}
        <div className="overflow-x-auto max-w-full">
          {/* <Scheduler /> */}
        </div>
      </div>
    </>
  );
}
