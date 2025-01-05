import CompactListBox from "@/components/compactListBox";
import PatientList from "@/components/patientList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Ellipsis, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { apiRequest, calculateAge } from "@/utility/generalUtility";
import { format } from "date-fns";
import PatientProfileDialog from "@/components/Dialogs/patientProfileDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const statusColors = {
  Scheduled: "bg-primary/20 text-primary font-semibold",
  Completed: "bg-green-400/20 text-green-400 font-semibold",
  Cancelled: "bg-red-400/20 text-red-400 font-semibold",
  "No Show": "bg-orange-400/20 text-orange-400 font-semibold",
};

function PatientProfile({ patientId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/api/user/${patientId}/`);
        if (response.status === 200) {
          const patient = response.data;
          setPatient(patient);
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchAppointments = async () => {
      try {
        const response = await api.get(`/api/patient/appointments/${patientId}/`);
        if (response.status === 200) {
          const appointmentData = response.data;
          setAppointments(appointmentData);
        } else {
          console.error("Failed to fetch appointments:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCarePlans = async () => {
      try {
        const response = await api.get(`/api/careplans/user/${patientId}/`);
        if (response.status === 200) {
          const carePlanData = response.data;
          setCarePlans(carePlanData);
        } else {
          console.error("Failed to fetch care plans:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch care plans:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDiagnoses = async () => {
      try {
        const response = await apiRequest(`/api/diagnoses/user/${patientId}/`, "Error fetching diagnoses");
        setDiagnoses(response);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        const response = await api.get(`/api/prescriptions/user/${patientId}/`);
        if (response.status === 200) {
          const prescriptionsData = response.data;
          setPrescriptions(prescriptionsData);
        } else {
          console.error("Failed to fetch prescriptions:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data
    fetchDiagnoses();
    fetchAppointments();
    fetchCarePlans();
    fetchPrescriptions();
    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      toast.success("ID copied to clipboard");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  const handleSave = async (updatedPatient) => {
    try {
      const response = await api.patch(`/api/user/${updatedPatient.id}/`, updatedPatient);
      if (response.status === 200) {
        toast.success("Patient data updated successfully");
        setPatient(updatedPatient);
        setDialogOpen(false);
      } else {
        toast.error("Failed to update patient data");
      }
    } catch (error) {
      console.error("Failed to update patient data:", error);
      toast.error("An error occurred while updating the patient data");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await api.patch(`/api/appointments/${appointmentId}/`, { status: "Cancelled" });
      if (response.status === 200) {
        toast.success("Appointment cancelled successfully");
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId ? { ...appointment, status: "Cancelled" } : appointment
          )
        );
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("An error occurred while canceling the appointment");
    }
  };

  const handleNotesChange = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row p-6 gap-4 h-lvh">
        {/* Left Section (Main Content) */}
        <div className="flex flex-col space-y-4 flex-grow sm:w-3/4">
          <Card className=" bg-background rounded-lg flex flex-col border-none h-fit">
            <CardHeader className="flex flex-row justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="size-12 mr-2">
                  <AvatarImage src="link" alt="Profile Image" />
                  <AvatarFallback className="bg-muted text-foreground">
                    {`${patient?.first_name.charAt(0).toUpperCase()}${patient?.last_name.charAt(0).toUpperCase()}`}
                  </AvatarFallback>
                </Avatar>
                <Label className="text-2xl font-semibold text-foreground line-clamp-1 break-all">
                  {patient?.first_name} {patient?.last_name}
                </Label>
              </div>
              {(userRole === "doctor" || userRole === "receptionist") && (
                <Button onClick={() => setDialogOpen(true)}>Edit</Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-500 text-sm">Address</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.address || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.address || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Age</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{calculateAge(patient?.date_of_birth) || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{calculateAge(patient?.date_of_birth) || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Date of Birth</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.date_of_birth || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.date_of_birth || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Blood Type</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.blood_type || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.blood_type || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">CPR</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.CPR_number || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.CPR_number || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Emergency Contact Name</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.emergency_contact_name || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.emergency_contact_name || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Emergency Contact Number</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.emergency_contact_phone || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.emergency_contact_phone || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Gender</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.gender || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.gender || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Place of Birth</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.place_of_birth || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.place_of_birth || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Religion</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="line-clamp-1 break-all">{patient?.religion || "None"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{patient?.religion || "None"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background p-4 rounded-lg flex-grow flex flex-col border-none">
            <Tabs defaultValue={userRole != "nurse" ? "appointments" : "care_plans"}>
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="care_plans">Care Plans</TabsTrigger>
                <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                <TabsTrigger value="Information">Information</TabsTrigger>
              </TabsList>

              {/* Appointment Tab */}
              <TabsContent value="appointments">
                <div className="overflow-y-auto max-h-[31rem] rounded-md">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="sticky top-0 z-10 text-left">
                          Doctor Name
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 text-left">
                          Date
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 text-left">
                          Time
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 text-center">
                          Status
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 text-center">
                          Follow Up
                        </TableHead>
                        <TableHead className="sticky top-0 z-10">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments?.map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="border-border"
                        >
                          <TableCell>{appointment.doctor?.first_name} {appointment.doctor?.last_name}</TableCell>
                          <TableCell>{appointment.appointment_date}</TableCell>
                          <TableCell>{format(new Date(`1970-01-01T${appointment.appointment_time}`), "HH:mm")}</TableCell>
                          <TableCell>
                            <div
                              className={`px-2 py-1 text-sm  text-center rounded-md ${statusColors[appointment.status]
                                }`}
                            >
                              {appointment.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {appointment.follow_up_required ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                >
                                  <Ellipsis className="text-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="flex flex-row justify-between" onClick={() => handleCopyId(appointment.id)}>
                                  Copy ID <Copy />
                                </DropdownMenuItem>
                                {/* TODO: Add edit functioanlity */}
                                {/* Open the appointment and pass user id and if the user is a nurse pass readonly*/}
                                {(userRole.toLowerCase() === "doctor" || userRole.toLowerCase() === "nurse") && (appointment.status === "Scheduled" || appointment.status === "Completed") && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const state = { patientId: patient?.id };
                                      if (userRole.toLowerCase() === "nurse") {
                                        state.paramReadOnly = true;
                                      }
                                      navigate(`/${userRole}/patients/appointment/${appointment.id}`, { state });
                                    }}
                                  >
                                    Open
                                  </DropdownMenuItem>
                                )}
                                {appointment.status != "Cancelled" &&
                                  (
                                    <>
                                      <DropdownMenuItem>Edit</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleCancelAppointment(appointment.id)}>
                                        Cancel
                                      </DropdownMenuItem>
                                    </>)
                                }
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Care Plan Tab */}
              <TabsContent value="care_plans">
                <div className="overflow-y-auto max-h-[31rem] rounded-md">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Done By</TableHead>
                        <TableHead>Date Done</TableHead>
                        <TableHead>Instructions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carePlans?.map((plan) => (
                        <TableRow key={plan.id} className="border-border">
                          <TableCell className="line-clamp-2 break-words">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  {plan.care_plan_title}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{plan.care_plan_title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`px-2 py-1 text-sm text-center rounded-md ${{
                                Immediate: "bg-primary/20 text-primary",
                                "Long-term": "bg-chart-5/20 text-chart-5",
                              }[plan.care_plan_type]
                                }`}>
                              {plan.care_plan_type}
                            </div></TableCell>
                          <TableCell>{plan.date}</TableCell>
                          <TableCell>{plan.done_by?.first_name} {plan.done_by?.last_name}</TableCell>
                          <TableCell>{plan.date_of_completion}</TableCell>
                          <TableCell className="line-clamp-2 break-words max-w-44">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  {plan.additional_instructions}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{plan.additional_instructions}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                >
                                  <Ellipsis className="text-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="flex flex-row justify-between" onClick={() => handleCopyId(plan.id)}>
                                  Copy ID <Copy />
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-green-500 focus:text-green-600">Complete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Diagnoses Tab */}
              <TabsContent value="diagnoses">
                <div className="overflow-y-auto max-h-[31rem] rounded-md">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Diagnosis</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead>Diagnosed By</TableHead>
                        <TableHead>Diagnosis Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diagnoses?.map((diagnosis) => (
                        <TableRow key={diagnosis.id} className="border-border">
                          <TableCell className="line-clamp-1 break-words">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  {diagnosis.diagnosis_name}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{diagnosis.diagnosis_name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`px-2 py-1 text-sm text-center rounded-md ${{
                                Primary: "bg-primary/20 text-primary",
                                Secondary: "bg-chart-5/20 text-chart-5",
                              }[diagnosis.diagnosis_type]
                                }`}
                            >
                              {diagnosis.diagnosis_type}
                            </div>
                          </TableCell>
                          <TableCell>{diagnosis.diagnosed_by?.first_name} {diagnosis.diagnosed_by?.last_name}</TableCell>
                          <TableCell>
                            {diagnosis.date}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                  <Ellipsis className="text-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="flex flex-row justify-between" onClick={() => handleCopyId(diagnosis.id)}>
                                  Copy ID <Copy />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="Information">
                <div className="p-4 flex flex-col gap-4 grow h-full">
                  <div className="">
                    <h3 className="font-medium text-foreground mb-2 ">
                      Patient Notes
                    </h3>
                    <Textarea
                      placeholder="Enter notes..."
                      className="w-full min-h-28 flex-grow bg-border/50 resize-none text-foreground text-sm"
                      value={patient?.patient_notes || ""}
                      onChange={(e) => handleNotesChange("patient_notes", e.target.value)}
                      readOnly={userRole !== "doctor"}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Family History
                    </h3>
                    <Textarea
                      placeholder="Enter notes..."
                      className="w-full min-h-28 flex-grow bg-border/50 resize-none text-foreground text-sm"
                      value={patient?.family_history || ""}
                      onChange={(e) => handleNotesChange("family_history", e.target.value)}
                      readOnly={userRole !== "doctor"}
                    />
                  </div>
                  {
                    userRole === "doctor" && (
                      <Button className="w-32 self-end mt-2" onClick={() => handleSave(patient)}>
                        Update
                      </Button>
                    )
                  }
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Section (Sidebar) */}
        {userRole === "doctor" && (
          <div className="flex flex-col space-y-4 min-w-2/12 overflow-y-auto">
            {/* Patient  Medical Information */}
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Allergies"
                data={patient?.allergies || {}}
                onClickIcon={() => console.log("Allergies icon clicked")}
                onClickSelf={() => console.log("Allergies clicked")}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Prescriptions"
                data={prescriptions}
                onClickIcon={() =>
                  console.log("Current Medications icon clicked")
                }
                onClickSelf={() => console.log("Current Medications clicked")}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Surgeries"
                data={patient?.past_surgeries || {}}
                onClickIcon={() => console.log("Surgeries icon clicked")}
                onClickSelf={() => console.log("Surgeries clicked")}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Chronic Conditions"
                data={patient?.chronic_conditions || {}}
                onClickIcon={() => console.log("Surgeries icon clicked")}
                onClickSelf={() => console.log("Surgeries clicked")}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64 p-4 bg-background rounded-lg shadow-md flex flex-col gap-4">
              <Button className="w-full">Generate Documents</Button>
              <Button
                className="w-full"
                onClick={() => navigate("/doctor/patients/appointment/", {
                  state: { patientId: patient?.id },
                })}
              >
                New Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
      <PatientProfileDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        patientData={patient}
        onSave={handleSave}
      />
    </div>
  );
}

export default PatientProfile;
