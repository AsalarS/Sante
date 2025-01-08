import { DatePickerWithRange } from "@/components/datePicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/utility/generalUtility";
import { Activity, CircleGauge, ClipboardList, Clock, CornerDownRightIcon, Heart, Loader2, MapPin, PillBottle, Stethoscope, Thermometer, Wind } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { format, set } from 'date-fns';

export const statusColors = {
  Scheduled: "bg-primary/10 dark:bg-primary/10 text-primary border-primary/20 dark:border-primary/40",
  Completed: "bg-green-400/10 dark:bg-green-400/10 text-green-500 dark:text-green-400 border-green-200 dark:border-green-900",
  Cancelled: "bg-red-400/10 dark:bg-red-400/10 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900",
  "No Show": "bg-orange-400/10 dark:bg-orange-400/10 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-900",
};

// Cache for storing fetched detail data
const detailsCache = new Map();

export function useAppointmentDetails() {
  const userId = localStorage.getItem('user_id');
  const [appointments, setAppointments] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState({});

  // Fetch base appointments
  const fetchAppointments = async () => {
    if (!userId) return;
    try {
      const response = await apiRequest(`/api/patient/appointments/${userId}/`, "Failed to fetch appointments");
      setAppointments(response);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Fetch details for a specific appointment
  const fetchAppointmentDetails = useCallback(async (appointmentId) => {
    // Check cache first
    if (detailsCache.has(appointmentId)) {
      const cachedData = detailsCache.get(appointmentId);
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, ...cachedData } : apt
      ));
      return;
    }

    // Set loading state for this specific appointment
    setLoadingDetails(prev => ({ ...prev, [appointmentId]: true }));

    try {
      // Fetch all details in parallel
      const [prescriptions, diagnoses, carePlans] = await Promise.all([
        apiRequest(`/api/appointments/prescriptions/${appointmentId}/`, "Failed to fetch prescriptions"),
        apiRequest(`/api/appointments/diagnoses/${appointmentId}/`, "Failed to fetch diagnoses"),
        apiRequest(`/api/appointments/careplans/${appointmentId}/`, "Failed to fetch care plans"),
      ]);

      const details = { prescriptions, diagnoses, carePlans };

      // Update cache
      detailsCache.set(appointmentId, details);

      // Update appointment with details
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, ...details } : apt
      ));
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [appointmentId]: false }));
    }
  }, []);

  // Clear cache when component unmounts or when appointments refresh
  useEffect(() => {
    return () => {
      detailsCache.clear();
    };
  }, [appointments]);

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  return {
    appointments,
    loadingAppointments,
    loadingDetails,
    fetchAppointmentDetails
  };
}

function PatientAppointments() {
  const userId = localStorage.getItem('user_id');
  const [loading, setLoading] = useState(true);

  const {
    appointments,
    loadingAppointments,
    loadingDetails,
    fetchAppointmentDetails
  } = useAppointmentDetails();

  // const fetchAppointments = async () => {
  //   if (!userId) return;
  //   try {
  //     const response = await apiRequest(`/api/patient/appointments/${userId}/`, "Failed to fetch appointments");
  //     setAppointments(response);
  //     console.log(response);

  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAppointments();
  // }, [userId]);

  const handleAccordionChange = (appointmentId) => {
    // Only fetch if appointmentId exists (opening) and details haven't been fetched yet
    if (appointmentId && !appointments?.find(apt => apt.id === appointmentId)?.prescriptions) {
      fetchAppointmentDetails(appointmentId);
    }
  };


  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: format(date, 'EEE'), // Gets abbreviated day name (Wed)
      date: format(date, 'd'),  // Gets day of month (23)
      month: format(date, 'MMM') // Gets abbreviated month (Oct)
    };
  };

  return (
    <div className="container mx-auto px-4 py-3 text-foreground">
      <div className="bg-background rounded-md w-full h-16 flex justify-between items-center p-4 mb-6">
        <div className="flex justify-between">
          <Input placeholder="Search appointments" />
        </div>
        <div className="flex justify-end gap-4 items-center">
          <Select>
            <SelectTrigger className="w-[180px] text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange
          // initialValue={appointmentDate}
          // onDateChange={handleDateChange}
          />
          <Button
            className="mt-1"
            onClick={() => setAppointmentDate(new Date().toISOString().split("T")[0])}
          >
            Today
          </Button>
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={handleAccordionChange}
      >
        {appointments?.map((appointment) => (
          <AccordionItem
            key={appointment.id}
            value={`${appointment.id}`}
            className="bg-background border border-border rounded-lg mb-4 px-2"
          >
            <AccordionTrigger>
              <div className="flex flex-row justify-between w-full items-center">
                {/* Left section - Date */}
                <div className="flex items-center">
                  <div className="flex flex-col items-center text-center w-20">
                    {appointment.appointment_date && (
                      <>
                        <span className="text-foreground">
                          {formatAppointmentDate(appointment.appointment_date).day}
                        </span>
                        <span className="text-4xl font-semibold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                          {formatAppointmentDate(appointment.appointment_date).date}
                        </span>
                        <span className="text-foreground text-xs">
                          {formatAppointmentDate(appointment.appointment_date).month}
                        </span>
                      </>
                    )}
                  </div>
                  <Separator orientation="vertical" className="bg-gray-200 h-16 mx-4" />
                </div>

                {/* Middle section - Appointment Details */}
                <div className="flex flex-row flex-grow mx-4 items-center">
                  <div className="flex items-center">
                    <Avatar className="size-12 mr-2">
                      <AvatarImage src="link" alt="Doctor Profile Image" />
                      <AvatarFallback className="bg-muted text-foreground text-s">
                        {`${appointment?.doctor?.first_name?.charAt(0)}${appointment?.doctor?.last_name?.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left ml-2">
                      <span className="font-semibold text-foreground">Dr. {appointment?.doctor?.first_name} {appointment?.doctor?.last_name}</span>
                      {appointment?.doctor?.specialization && (

                        <span className="text-sm text-foreground/50">{appointment?.doctor?.specialization}</span>
                      )}
                    </div>
                  </div>


                  {/* Doctor info and status - pushed to the right */}
                  <div className="flex items-center gap-6 ml-auto">
                    {appointment?.status && (
                      <div className={`text-sm px-3 py-1 rounded-full ${statusColors[appointment.status]}`}>
                        {appointment.status}
                      </div>
                    )}
                    {/* Time and Location */}
                    <div className="flex flex-col gap-2 mr-2">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{appointment?.appointment_time.slice(0, 5)}</span>
                      </div>
                      {appointment?.doctor.office_number && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{appointment?.doctor.office_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4">
              {loadingDetails[appointment.id] ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="animate-fade-in transition-all duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* Heart Rate */}
                    <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 ">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-red-500 p-2 rounded-lg">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Heart Rate
                          </h3>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {appointment?.heart_rate || "0"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            BPM
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 ">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-500 p-2 rounded-lg">
                            <CircleGauge className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Blood Pressure
                          </h3>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {appointment?.blood_pressure || "0/0"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            mmHg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4 ">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-500 p-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Temperature
                          </h3>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {appointment?.temperature || "0.0"}°
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Celsius
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Oxygen Saturation */}
                    <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 ">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-amber-500 p-2 rounded-lg">
                            <Wind className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            O₂ Saturation
                          </h3>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {appointment?.o2_sat || "0"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-lg p-4 ">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Respiratory Rate
                          </h3>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {appointment?.resp_rate || "0"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            BrPM
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {/* Diagnoses Section */}
                    <div className="bg-darker-background rounded-lg border border-border">
                      <div className="flex items-center p-4 border-b border-border">
                        <div className="bg-primary p-2 rounded-lg mr-2">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground">Diagnoses</h3>
                      </div>
                      <div className="max-h-52 overflow-y-auto p-4 space-y-3">
                        {appointment?.diagnoses?.length > 0 ? (
                          appointment.diagnoses.map((diagnosis) => (
                            <div
                              key={diagnosis.id}
                              className="bg-border rounded-lg p-3 border border-border transition-colors hover:bg-background-hover"
                            >
                              <div className="font-medium text-sm text-card-foreground line-clamp-1 break-all">{diagnosis.diagnosis_name}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all">{diagnosis.diagnosis_type}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-foreground/50 self-center text-center">No data available</p>
                        )}
                      </div>
                    </div>

                    {/* Care Plans Section */}
                    <div className="bg-darker-background rounded-lg border border-border">
                      <div className="flex items-center p-4 border-b border-border">
                        <div className="bg-primary p-2 rounded-lg mr-2">
                          <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground">Care Plans</h3>
                      </div>
                      <div className="max-h-52 overflow-y-auto p-4 space-y-3">
                        {appointment?.carePlans?.length > 0 ? (
                          appointment.carePlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-border rounded-lg p-3 border border-border transition-colors hover:bg-background-hover"
                            >
                              <div className="font-medium text-sm text-card-foreground line-clamp-1 break-all">{plan.care_plan_title}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all">{plan.care_plan_type}</div>
                              {plan.additional_instructions && (
                                <div className="text-xs text-muted-foreground mt-2 line-clamp-1 break-all">{plan.additional_instructions}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-foreground/50 self-center text-center">No data available</p>
                        )}
                      </div>
                    </div>

                    {/* Prescriptions Section */}
                    <div className="bg-darker-background rounded-lg border border-border">
                      <div className="flex items-center p-4 border-b border-border">
                        <div className="bg-primary p-2 rounded-lg mr-2">
                          <PillBottle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground">Prescriptions</h3>
                      </div>
                      <div className="max-h-52 overflow-y-auto p-4 space-y-3">
                        {appointment?.prescriptions?.length > 0 ? (
                          appointment.prescriptions.map((prescription) => (
                            <div
                              key={prescription.id}
                              className="bg-border rounded-lg p-3 border border-border transition-colors hover:bg-background-hover"
                            >
                              <div className="font-medium text-sm text-card-foreground line-clamp-1 break-all">{prescription.medication_name}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all">
                                {prescription.dosage} {prescription?.duration && `• ${prescription.duration} days`}
                              </div>
                              {prescription.special_instructions && (
                                <div className="text-xs text-muted-foreground mt-2 line-clamp-1 break-all">{prescription.special_instructions}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-foreground/50 self-center text-center">No data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default PatientAppointments;