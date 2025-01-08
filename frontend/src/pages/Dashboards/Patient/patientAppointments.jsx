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
import { Activity, CircleGauge, ClipboardList, Clock, CornerDownRightIcon, Heart, MapPin, PillBottle, Stethoscope, Thermometer, Wind } from "lucide-react";
import { useState } from "react";

export const statusColors = {
  Scheduled: "bg-primary/10 dark:bg-primary/10 text-primary border-primary/20 dark:border-primary/40",
  Completed: "bg-green-400/10 dark:bg-green-400/10 text-green-500 dark:text-green-400 border-green-200 dark:border-green-900",
  Cancelled: "bg-red-400/10 dark:bg-red-400/10 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900",
  "No Show": "bg-orange-400/10 dark:bg-orange-400/10 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-900",
};

const dummyCarePlans = [
  {
    id: '1',
    care_plan_title: 'Physical Therapy',
    care_plan_type: 'Long-term',
    date_of_completion: '2023-12-01',
    done_by: {
      first_name: 'Emily',
      last_name: 'Smith',
    },
    additional_instructions: 'Attend sessions twice a week.',
  },
  {
    id: '2',
    care_plan_title: 'Diet Plan',
    care_plan_type: 'Immediate',
    date_of_completion: '2023-11-15',
    done_by: {
      first_name: 'Michael',
      last_name: 'Brown',
    },
    additional_instructions: 'Follow the diet strictly for 2 weeks.',
  },
  {
    id: '3',
    care_plan_title: 'Cardiac Rehabilitation',
    care_plan_type: 'Long-term',
    date_of_completion: '2024-01-10',
    done_by: {
      first_name: 'David',
      last_name: 'Johnson',
    },
    additional_instructions: 'Daily exercises and monitoring.',
  },
  {
    id: '4',
    care_plan_title: 'Mental Health Counseling',
    care_plan_type: 'Immediate',
    date_of_completion: '2023-11-30',
    done_by: {
      first_name: 'Sarah',
      last_name: 'Connor',
    },
    additional_instructions: 'Weekly sessions with a counselor.',
  },
  {
    id: '5',
    care_plan_title: 'Post-Surgery Recovery',
    care_plan_type: 'Short-term',
    date_of_completion: '2023-12-20',
    done_by: {
      first_name: 'Laura',
      last_name: 'Wilson',
    },
    additional_instructions: 'Follow-up visits and physical therapy.',
  },
];

const dummyPrescriptions = [
  {
    id: '1',
    medication_name: 'Amoxicillin',
    dosage: '500mg',
    duration: 7,
    special_instructions: 'Take after meals.',
  },
  {
    id: '2',
    medication_name: 'Ibuprofen',
    dosage: '200mg',
    duration: 5,
    special_instructions: 'Take with water.',
  },
  {
    id: '3',
    medication_name: 'Metformin',
    dosage: '850mg',
    duration: 30,
    special_instructions: 'Take before breakfast.',
  },
  {
    id: '4',
    medication_name: 'Lisinopril',
    dosage: '10mg',
    duration: 14,
    special_instructions: 'Take once daily.',
  },
  {
    id: '5',
    medication_name: 'Atorvastatin',
    dosage: '20mg',
    duration: 30,
    special_instructions: 'Take in the evening.',
  },
];

const dummyDiagnoses = [
  {
    id: '1',
    diagnosis_name: 'Hypertension',
    diagnosis_type: 'Primary',
  },
  {
    id: '2',
    diagnosis_name: 'Diabetes',
    diagnosis_type: 'Secondary',
  },
  {
    id: '3',
    diagnosis_name: 'Asthma',
    diagnosis_type: 'Primary',
  },
  {
    id: '4',
    diagnosis_name: 'Chronic Kidney Disease',
    diagnosis_type: 'Secondary',
  },
  {
    id: '5',
    diagnosis_name: 'Hyperlipidemia',
    diagnosis_type: 'Primary',
  },
];
const dummyAppointments = [
  {
    id: '1',
    patient: {
      first_name: 'John',
      last_name: 'Doe',
    },
    doctor: {
      first_name: 'Emily',
      last_name: 'Smith',
    },
    appointment_date: '2023-10-01',
    appointment_time: '10:00',
    status: 'Scheduled',
    notes: 'Regular check-up',
  },
  {
    id: '2',
    patient: {
      first_name: 'Jane',
      last_name: 'Doe',
    },
    doctor: {
      first_name: 'Michael',
      last_name: 'Brown',
    },
    appointment_date: '2023-10-02',
    appointment_time: '11:00',
    status: 'Completed',
    notes: 'Follow-up visit',
  },
  {
    id: '3',
    patient: {
      first_name: 'Alice',
      last_name: 'Smith',
    },
    doctor: {
      first_name: 'David',
      last_name: 'Johnson',
    },
    appointment_date: '2023-10-03',
    appointment_time: '09:00',
    status: 'Cancelled',
    notes: 'Cancelled by patient',
  },
  {
    id: '4',
    patient: {
      first_name: 'Bob',
      last_name: 'Marley',
    },
    doctor: {
      first_name: 'Sarah',
      last_name: 'Connor',
    },
    appointment_date: '2023-10-04',
    appointment_time: '14:00',
    status: 'No Show',
    notes: 'Patient did not show up',
  },
  {
    id: '5',
    patient: {
      first_name: 'Charlie',
      last_name: 'Brown',
    },
    doctor: {
      first_name: 'Laura',
      last_name: 'Wilson',
    },
    appointment_date: '2023-10-05',
    appointment_time: '16:00',
    status: 'Completed',
    notes: 'Routine check-up',
  },
];



function PatientAppointments() {
  return (
    <div className="container mx-auto px-4 py-3 text-foreground">
      <div className="bg-background rounded-md w-full h-16 flex justify-between items-center p-4 mb-6">
        <div className="flex justify-between">
          <Input placeholder="Search patients" />
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
      <Accordion type="single" collapsible className="w-full">
        {dummyAppointments.map((appointment) => (
          <AccordionItem
            key={appointment.id}
            value={`item-${appointment.id}`}
            className="bg-background border border-border rounded-lg mb-4 px-2"
          >
            <AccordionTrigger>
              <div className="flex flex-row justify-between w-full items-center">
                {/* Left section - Date */}
                <div className="flex items-center">
                  <div className="flex flex-col items-center text-center w-20">
                    <span className="text-foreground">Wed</span>
                    <span className="text-foreground text-4xl font-semibold">23</span>
                    <span className="text-foreground text-xs">Oct</span>
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
                    <span className="font-semibold text-foreground ml-2">Dr. {appointment?.doctor?.first_name} {appointment?.doctor?.last_name}</span>
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
                        <span className="text-sm">{appointment?.appointment_time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Office {appointment?.office_number}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4">
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
                    <div className="h-52 overflow-y-auto p-4 space-y-3">
                      {dummyDiagnoses?.map((diagnosis) => (
                        <div 
                          key={diagnosis.id} 
                          className="bg-border rounded-lg p-3 border border-border transition-colors hover:bg-background-hover"
                        >
                          <div className="font-medium text-sm text-card-foreground line-clamp-1 break-all">{diagnosis.diagnosis_name}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all">{diagnosis.diagnosis_type}</div>
                        </div>
                      ))}
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
                    <div className="h-52 overflow-y-auto p-4 space-y-3">
                      {dummyCarePlans?.map((plan) => (
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
                      ))}
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
                    <div className="h-52 overflow-y-auto p-4 space-y-3">
                      {dummyPrescriptions?.map((prescription) => (
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
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default PatientAppointments;