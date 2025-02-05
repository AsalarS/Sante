import CompactListBox from "@/components/compactListBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { apiRequest, calculateAge } from "@/utility/generalUtility";
import PatientProfileDialog from "@/components/Dialogs/patientProfileDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import PatientProfileTables from "@/components/patientProfileTables";
import PatientList from "@/components/patientList";
import PatientProfileList from "@/components/patientProfileList";
import PrescriptionList from "@/components/patientProfilePrescriptionsList";
import CompactPrescriptionList from "@/components/compactPrescriptionsList";


function PatientProfile({ patientId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeListType, setActiveListType] = useState(null);
  const [showProfileList, setShowProfileList] = useState(false);
  const userRole = localStorage.getItem("role");

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

  useEffect(() => {
    // Fetch data
    fetchDiagnoses();
    fetchAppointments();
    fetchCarePlans();
    if (userRole === "doctor") {
      fetchPrescriptions();
    }
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

  const handleCompleteCareplan = async (careplanId) => {
    try {
      const response = await api.post(`/api/careplans/${careplanId}/complete/`);
      if (response.status === 200) {
        toast.success("Care plan completed successfully");
        fetchCarePlans();
      } else {
        toast.error("Failed to complete care plan");
      }
    } catch (error) {
      console.error("Failed to complete care plan:", error);
      toast.error("An error occurred while completing the care plan");
    }
  }

  const handleIconClick = (type) => {
    // If a list is already showing, close it first to ensure clean state
    if (showProfileList) {
      setShowProfileList(false);
      // Small delay to allow state to clear
      setTimeout(() => {
        setActiveListType(type);
        setShowProfileList(true);
      }, 100);
    } else {
      setActiveListType(type);
      setShowProfileList(true);
    }
  };
  const handleMinimizeClick = () => {
    setShowProfileList(false);
  };

  const handleListSave = async (type, data) => {
    try {
      if (type === 'prescriptions') {
        // Use the dedicated prescriptions endpoint
        
        const response = await api.patch(
          `/api/prescriptions/user/${patientId}/`,
          { prescriptions: data }
        );

        if (response.status === 200) {
          setPrescriptions(data);
          toast.success('Prescriptions updated successfully');
        }
      } else {
        // Handle other types using the existing patient endpoint
        const updateData = {
          [type]: data
        };

        const response = await api.patch(
          `/api/user/${patientId}/`,
          updateData
        );

        if (response.status === 200) {
          setPatient(prev => ({
            ...prev,
            [type]: data
          }));
          toast.success(`${type.replace(/^./, char => char.toUpperCase())} updated successfully`);
        }
      }
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
      toast.error(`Failed to update ${type}`);
    }
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
            {showProfileList ? (
              activeListType === 'prescriptions' ? (
                <PrescriptionList
                  readOnly
                  onClickMinimize={handleMinimizeClick}
                  initialData={prescriptions || {}}
                  onSave={(updatedPrescriptions) => handleListSave('prescriptions', updatedPrescriptions)}
                />
              ) : (
                <PatientProfileList
                  readOnly={userRole !== "doctor"}
                  onClickMinimize={handleMinimizeClick}
                  title={activeListType === 'allergies' ? 'Allergies' :
                    activeListType === 'past_surgeries' ? 'Surgeries' :
                      'Chronic Conditions'}
                  initialData={activeListType === 'allergies' ? patient?.allergies :
                    activeListType === 'past_surgeries' ? patient?.past_surgeries :
                      patient?.chronic_conditions || {}}
                  onSave={handleListSave}
                  type={activeListType}
                />
              )
            ) : (
              <PatientProfileTables
                appointments={appointments}
                patient={patient}
                carePlans={carePlans}
                diagnoses={diagnoses}
                handleCopyId={handleCopyId}
                handleCancelAppointment={handleCancelAppointment}
                handleNotesChange={handleNotesChange}
                handleSave={handleSave}
                handleCompleteCareplan={handleCompleteCareplan}
              />
            )}
          </Card>
        </div>

        {/* Right Section (Sidebar) */}
        {(userRole === "doctor" || userRole === "nurse") && (
          <div className="flex flex-col space-y-4 min-w-2/12 overflow-y-auto">
            {/* Patient  Medical Information */}
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Allergies"
                data={patient?.allergies || {}}
                onClickIcon={() => handleIconClick('allergies')}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactPrescriptionList
                prescriptions={prescriptions}
                onClickIcon={() => handleIconClick('prescriptions')}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Surgeries"
                data={patient?.past_surgeries || {}}
                onClickIcon={() => handleIconClick('past_surgeries')}
                className="flex-grow"
              />
            </div>
            <div className="max-w-64">
              <CompactListBox
                displayAsBadges={true}
                title="Chronic Conditions"
                data={patient?.chronic_conditions || {}}
                onClickIcon={() => handleIconClick('chronic_conditions')}
                className="flex-grow"
              />
            </div>
            {userRole === "doctor" && (
              <div className="max-w-64 p-4 bg-background rounded-lg shadow-md flex flex-col gap-4">
                <Button
                  className="w-full"
                  onClick={() => navigate("/doctor/patients/appointment/", {
                    state: { patientId: patient?.id },
                  })}
                >
                  New Appointment
                </Button>
              </div>
            )}
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
