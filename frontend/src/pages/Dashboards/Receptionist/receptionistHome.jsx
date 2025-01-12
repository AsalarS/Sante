import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import api from "@/api";
import Scheduler from "@/components/schduler";
import { useNavigate, useLocation } from "react-router-dom";

export default function ReceptionistHome() {
  const [schedule, setSchedule] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointmentId, setAppointmentId] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDateChange = (date) => setAppointmentDate(date);

  useEffect(() => {
    const search = location.search;
    const params = new URLSearchParams(search);
    const appointmentIdParam = params.get("appointmentId");

    if (appointmentIdParam) {
      setAppointmentId(appointmentIdParam);
      fetchAppointmentDetails(appointmentIdParam);
    }
  }, [location.search]);

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const response = await api.get(`/api/appointments/${appointmentId}/`);
      if (response.status === 200) {
        setAppointmentData(response.data);
        console.log("Fetched appointment details:", response.data);
        
      } else {
        console.error("Failed to fetch appointment details:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching appointment details:", err);
    }
  };

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
        console.log("Fetched schedule:", response.data.schedule);
        
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
  
  useEffect(() => {
    fetchSchedule();
  }, [appointmentDate]); 

  const handleSaveSuccess = () => {
    fetchSchedule();
    navigate("/receptionist/");
    setAppointmentId(null);
    setAppointmentData(null);
  };

  return (
    <>
      <div className="flex flex-col p-4 gap-6 max-w-full">
        <div className="bg-background rounded-md w-full h-16 flex justify-between items-center p-4">
          <div className="flex justify-between">
            <Button onClick={() => navigate("/receptionist/patients/")} variant="secondary">Go to Patients</Button>
          </div>
          <div className="flex justify-end gap-4">
            <DatePicker
              className="h-12"
              initialValue={appointmentDate}
              onDateChange={handleDateChange}
            />
            <Button
              className="mt-1"
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setAppointmentDate(today);
              }}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto max-w-full">
          <Scheduler 
            scheduleData={schedule ? schedule : []} 
            date={appointmentDate} 
            appointmentId={appointmentId}
            appointmentData={appointmentData}
            onSaveSuccess={handleSaveSuccess} // Refresh schedule on save
          />
        </div>
      </div>
    </>
  );
}
