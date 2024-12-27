import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppointmentVitalsDialog } from "@/components/Dialogs/appointmentVitals-Dialog";
import { DiagnosisDialog } from "@/components/Dialogs/diagnosisDialog";
import api from "@/api";
import CompactListBox from "@/components/compactListBox";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Heart, CircleGauge, Thermometer, Activity, Wind, PenLine, Plus, CornerDownRight, Ellipsis, ChevronLeft, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { calculateAge } from "@/utility/generalUtility";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CarePlanDialog } from "./Dialogs/carePlanDialog";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

function AppointmentPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const patientId = location.state?.patientId;

    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [carePlans, setCarePlans] = useState([]);
    const [selectedCarePlan, setSelectedCarePlan] = useState(null);
    const [diagnoses, setDiagnoses] = useState([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
    const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
    const [carePlanDialogOpen, setCarePlanDialogOpen] = useState(false);
    const [idCounter, setIdCounter] = useState(1);

    const fetchAppointments = async () => {
        try {
            const response = await api.get(`/api/appointments/${id}/`);
            if (response.status === 200) {
                const appointmentData = response.data;
                setAppointment(appointmentData);
            } else {
                console.error("Failed to fetch appointments:", response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientData = async () => {
        try {
            const response = await api.get(`/api/user-info/${patientId}/`);
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

    const fetchCarePlans = async () => {
        try {
            const response = await api.get(`/api/appointments/careplans/${id}/`);
            if (response.status === 200) {
                const carePlanData = response.data;
                setCarePlans(carePlanData);
            } else if (response.status === 404) {
                console.warn("Care plans not found (404):", response.statusText);
            } else {
                console.error("Failed to fetch care plans:", response.statusText);
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error("Failed to fetch care plans:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDiagnoses = async () => {
        try {
            const response = await api.get(`/api/appointments/diagnoses/${id}/`);
            if (response.status === 200) {
                const diagnosesData = response.data;
                setDiagnoses(diagnosesData);
            } else if (response.status === 404) {
                console.warn("Diagnoses not found (404):", response.statusText);
            } else {
                console.error("Failed to fetch diagnoses:", response.statusText);
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error("Failed to fetch diagnoses:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Patient Data Fetch
    useEffect(() => {
        fetchPatientData();
    }, [id]);

    // Vitals Data Refresh on dialog close
    useEffect(() => {
        if (!vitalsDialogOpen) {
            fetchAppointments();
        }
    }, [id, vitalsDialogOpen]);

    // Care Plan Data Refresh on dialog close
    useEffect(() => {
        if (!carePlanDialogOpen) {
            fetchCarePlans();
        }
    }, [id, carePlanDialogOpen]);

    // Disnogses Data Refresh on dialog close
    useEffect(() => {
        if (!diagnosisDialogOpen) {
            fetchDiagnoses();
        }
    }, [id, diagnosisDialogOpen]);

    const handleAppointmentChange = (field, value) => {
        setAppointment((prev) => ({ ...prev, [field]: value }));
    };

    // Function to handle save a new diagnosis or update existing
    const handleSaveDiagnosis = (diagnosis) => {
        if (diagnosis.id) {
            // Update existing diagnosis by matching `id`
            setDiagnoses((prevDiagnoses) =>
                prevDiagnoses.map((d) =>
                    d.id === diagnosis.id ? diagnosis : d
                )
            );
        } else {
            // Add new diagnosis, and set a new id using the counter
            const newDiagnosis = { ...diagnosis, id: idCounter };
            setDiagnoses((prevDiagnoses) => [...prevDiagnoses, newDiagnosis]);
            setIdCounter((prev) => prev + 1); // Increment the counter for the next ID
        }
    };

    // Function to handle save a new care plan or update existing
    const handleSaveCarePlan = (carePlan) => {
        if (carePlan.id) {
            // Update existing care plan by matching `id`
            setCarePlans((prevCarePlans) =>
                prevCarePlans.map((cp) =>
                    cp.id === carePlan.id ? carePlan : cp
                )
            );
        } else {
            // Add new care plan, and set a new id using the counter
            const newCarePlan = { ...carePlan, id: idCounter };
            setCarePlans((prevCarePlans) => [...prevCarePlans, newCarePlan]);
            setIdCounter((prev) => prev + 1); // Increment the counter for the next ID
        }
    };
    // Function to handle adding a new care plan
    const handleAddCarePlan = (newCarePlan) => {
        setCarePlans((prevCarePlans) => [
            ...prevCarePlans,
            { ...newCarePlan, id: idCounter }, // Assign the next sequential ID
        ]);
        setIdCounter((prev) => prev + 1); // Increment the counter
    };

    // Callback functions to update state when new data is added
    const handleAddDiagnosis = (newDiagnosis) => {
        setDiagnoses((prevDiagnoses) => [
            ...prevDiagnoses,
            { ...newDiagnosis, id: idCounter }, // Assign the next sequential ID
        ]);
        setIdCounter((prev) => prev + 1); // Increment the counter
    };

    // Open the dialog and pass the selected diagnosis data
    const handleEditDiagnosis = (diagnosis) => {
        setSelectedDiagnosis(diagnosis);  // Set the selected diagnosis to pass to the dialog
        setDiagnosisDialogOpen(true);
    };

    // Open the dialog and pass the selected diagnosis data
    const handleEditCarePlan = (carePlan) => {
        setSelectedCarePlan(carePlan);  // Set the selected diagnosis to pass to the dialog
        setCarePlanDialogOpen(true);
    };

    const handleOpenDiagnsisDialog = () => {
        setSelectedDiagnosis(null); // Clear selected diagnosis
        setDiagnosisDialogOpen(true); // Open dialog
    };

    const handleDeleteDiagnosis = (indexToDelete) => {
        if (indexToDelete !== undefined) {
            setDiagnoses((prevDiagnoses) => {
                return prevDiagnoses.filter((_, index) => index !== indexToDelete);
            });
        }
    };

    const handleDeleteCarePlan = (indexToDelete) => {
        if (indexToDelete !== undefined) {
            setCarePlans((prevCarePlans) => {
                return prevCarePlans.filter((_, index) => index !== indexToDelete);
            });
        }
    };

    // Fetch appointment, care plans, and diagnoses when the component mounts

    const saveAppointment = async () => {
        setLoading(true);
        try {
            //Patch the appointment data
            console.log("app data ", appointment);

            const appointmentResponse = await api.patch(`/api/appointments/${id}/`, appointment);
            if (appointmentResponse.status === 200) {
                toast.success("Appointment updated successfully!");

                //Create care plans if there are any
                if (carePlans.length > 0) {
                    const carePlanPromises = carePlans.map((plan) => {
                        return api.patch(`/api/appointments/careplans/${id}/`, plan);
                    });
                    await Promise.all(carePlanPromises);
                    toast.success("Care plans saved successfully!");
                }

                //Create diagnoses if there are any
                if (diagnoses.length > 0) {
                    const diagnosesPromises = diagnoses.map((diagnosis) => {
                        return api.patch(`/api/appointments/diagnoses/${id}/`, diagnosis);
                    });
                    await Promise.all(diagnosesPromises);
                    toast.success("Diagnoses saved successfully!");
                }

                // Step 4: Navigate to the previous page or /patients
                if (window.history.length > 1) {
                    navigate(-1);  // Go back to the previous page
                } else {
                    navigate("/patients");  // Go to /patients if no previous page
                }
            } else {
                toast.error("Failed to save appointment.");
            }
        } catch (error) {
            console.error("Error saving appointment:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="bg-even-darker-background flex flex-col sm:flex-row p-6 gap-4 h-lvh ">
            {/* Left Section (Main Content) */}
            <div className="flex flex-col space-y-4 flex-grow sm:w-3/4 overflow-y-auto">
                {/* Title */}
                <div className="rounded-md flex flex-row items-center justify-between">
                    <div className="flex flex-row">
                        <div className="flex text-foreground bg-btn-normal rounded-md mr-4 items-center p-1 hover:bg-btn-normal/80 w-fit"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    // Go back to the previous page
                                    navigate(-1);
                                } else {
                                    // If there's no history, navigate to the /patients page
                                    navigate('/patients');
                                }
                            }}>
                            <ChevronLeft size={24} />
                        </div>
                        <div className="flex flex-row content-center self-center">
                            <h1 className="text-foreground font-bold text-xl">Appointment</h1>
                            <Badge className="text-white ml-2">
                                {appointment ? appointment?.status : "New"}
                            </Badge>
                        </div>
                    </div>
                    {appointment &&
                        <div className="bg-background p-2 px-3 rounded-lg self-end">
                            <span className="text-foreground font-semibold">
                                {/* Formatted Date and Time */}
                                {appointment?.appointment_date}
                                {" "}
                                {appointment?.appointment_time &&
                                    format(new Date(`1970-01-01T${appointment.appointment_time}`), "HH:mm")}
                            </span>
                        </div>
                    }
                </div>
                <div className="flex flex-col space-y-4 flex-grow overflow-y-auto">
                    <Card className="bg-background p-4 rounded-lg inline-block border-none">
                        <div className="flex flex-row justify-between mb-2">
                            <span className="text-lg font-semibold mb-2 ml-1">Vitals</span>
                            <Button className="size-8" variant={"secondary"} onClick={() => setVitalsDialogOpen(true)}><PenLine size={20} /></Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* Heart Rate */}
                            <div className="bg-red-300 dark:bg-red-300/20 text-white rounded-md  p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Heart className="text-white bg-red-500 rounded-full p-2 w-10 h-10" />
                                    <h3 className="font-semibold">Heart Rate</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center">{appointment?.heart_rate || "0"} <span className="text-white/40 text-lg">BPM</span></h1>
                            </div>
                            {/* Blood Pressure */}
                            <div className="bg-blue-300 dark:bg-blue-300/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <CircleGauge className="text-white bg-blue-500 rounded-full p-2 w-10 h-10" />
                                    <h3 className="font-semibold">Blood Pressure</h3>
                                </div>
                                <h1 className="text-3xl font-bold flex flex-col items-center ">{appointment?.blood_pressure || "0/0"}<span className="text-white/40 text-lg">mmHg</span></h1>
                            </div>
                            {/* Temperature */}
                            <div className="bg-green-300 dark:bg-green-300/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Thermometer className="text-white bg-green-500 rounded-full p-2 w-10 h-10" />
                                    <h3 className="font-semibold">Temperature</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center">{appointment?.temperature || "0.0"}°<span className="text-white/40 text-lg">Celsius</span></h1>
                            </div>
                            {/* Oxygen Saturation */}
                            <div className="bg-yellow-400/60 dark:bg-yellow-300/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Wind className="text-white bg-yellow-500 rounded-full p-2 w-10 h-10" />
                                    <h3 className="font-semibold line-clamp-2 break-words">O₂ Saturation</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center">{appointment?.o2_sat || "0"}%<span className="text-white/40 text-lg">Percent</span></h1>
                            </div>
                            {/* Respiratory Rate */}
                            <div className="bg-purple-300 dark:bg-purple-300/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Activity className="text-white bg-purple-500 rounded-full p-2 w-10 h-10" />
                                    <h3 className="font-semibold line-clamp-2 break-words">Respiratory Rate</h3>
                                </div>
                                <h1 className="text-3xl font-bold flex flex-col items-center">{appointment?.resp_rate || "0"} <span className="text-white/40 text-lg">BPM</span></h1>
                            </div>
                        </div>
                    </Card>
                    {/* Diagnoses */}
                    <Card className="bg-background p-4 rounded-lg shrink flex flex-col border-none">
                        <div className="flex flex-row justify-between mb-2">
                            <span className="text-lg font-semibold mb-2 ml-1">Diagnoses</span>
                            <Button
                                className="size-8"
                                variant={"secondary"}
                                onClick={() => { setSelectedDiagnosis(null); setDiagnosisDialogOpen(true); }}
                            >
                                <Plus size={20} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-32">
                            {diagnoses?.map((diagnosis, index) => (
                                <div key={index} className="bg-background-hover rounded-md p-4 flex flex-row justify-between">
                                    <div className="self-center">
                                        <div className="flex flex-row mb-1 self-center">
                                            <span className="font-semibold line-clamp-1 break-all">{diagnosis.diagnosis_name}</span>
                                            {/* Primary or secondary diagnosis */}
                                            <Badge className="text-white ml-4">{diagnosis.diagnosis_type}</Badge>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant={"ghost"}
                                                className="self-center w-10 h-10 ml-2"
                                            >
                                                <Ellipsis />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() => handleEditDiagnosis(diagnosis)}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => handleDeleteDiagnosis(diagnosis, index)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </Card>
                    {/* Care Plan */}
                    <Card className="bg-background p-4 rounded-lg shrink flex flex-col border-none">
                        <div className="flex flex-row justify-between mb-2">
                            <span className="text-lg font-semibold mb-2 ml-1">Care Plan</span>
                            <Button
                                className="size-8"
                                variant={"secondary"}
                                onClick={() => { setSelectedCarePlan(null); setCarePlanDialogOpen(true); }}
                            >
                                <Plus size={20} />
                            </Button>
                        </div>
                        {/* List of plans */}
                        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-60">
                            {/* TODO: Add tooltip for instructions*/}
                            {carePlans?.map((plan, index) => (
                                <div key={index} className="bg-background-hover rounded-md p-4 flex flex-row justify-between mb-2">
                                    <div className="self-center">
                                        <div className="flex flex-row mb-1">
                                            <span className="font-semibold line-clamp-1 break-all">{plan.care_plan_title}</span>
                                            {/* Type of consult */}
                                            <Badge className="text-white ml-4">{plan.care_plan_type}</Badge>
                                        </div>
                                        {plan.additional_instructions && <div className="flex flex-row">
                                            <CornerDownRight className="" size={16} />
                                            <span className="text-sm ml-2 line-clamp-1 break-all">{plan.additional_instructions}</span>
                                        </div>}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant={"ghost"}
                                                className="self-center w-10 h-10 ml-2"
                                            >
                                                <Ellipsis />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() => handleEditCarePlan(plan)}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-500 focus:text-red-500"
                                                onClick={() => handleDeleteCarePlan(plan, index)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </Card>
                    {/* Observations */}
                    <Card className="bg-background p-4 rounded-lg flex flex-col border-none grow">
                        <span className="text-lg font-semibold mb-2 ml-1 text-foreground">Notes</span>
                        <Textarea
                            value={appointment?.notes || ""}
                            placeholder="Enter details..."
                            className="w-full flex-grow bg-muted dark:bg-border resize-none text-foreground"
                            onChange={(e) => handleAppointmentChange("notes", e.target.value)}
                        />
                    </Card>
                </div>
            </div>

            {/* Right Section (Sidebar) */}
            <div className="flex flex-col space-y-4 min-w-2/12 overflow-y-auto">
                {/* <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="General Stats"
                        data={["℃ 37", "92%", "80/70", "9 g/dL", "℃ 37", "92%", "80/70", "9 g/dL", "℃ 37", "92%", "80/70", "9 g/dL"]}
                        onClickIcon={() => console.log("General Stats icon clicked")}
                        onClickSelf={() => console.log("General Stats clicked")}
                        className="flex-grow"
                    />
                </div> */}
                {/* Patient Card */}
                <div className="max-w-64">
                    <div className="p-4 bg-background rounded-lg shadow-md cursor-pointer">
                        <div className="flex items-center space-x-2 mb-3">
                            <Avatar className="size-12 mr-2">
                                <AvatarImage src="link" alt="Profile Image" />
                                <AvatarFallback className="bg-muted text-foreground">{patient?.first_name.charAt(0).toUpperCase()}{patient?.last_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-foreground line-clamp-1 break-all">{patient?.first_name} {patient?.last_name}</h3>
                        </div>
                        <div className="flex justify-center">
                            <div className="flex h-5 items-center space-x-4 text-sm text-foreground font-bold">
                                <div>{calculateAge(patient?.date_of_birth)}</div>
                                <Separator orientation="vertical" />
                                <div>{patient?.gender}</div>
                                <Separator orientation="vertical" />
                                <div>{patient?.blood_type}</div>
                            </div>
                        </div>
                        <Popover>
                            <PopoverTrigger className="w-full"><Button className="w-full mt-6 text-white">View Profile</Button></PopoverTrigger>
                            <PopoverContent >Place content for the popover here.</PopoverContent>
                        </Popover>

                    </div>
                </div>
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
                        data={["Medicine A", "23y", "23y", "Medicine B"]}
                        onClickIcon={() => console.log("Current Medications icon clicked")}
                        onClickSelf={() => console.log("Current Medications clicked")}
                        className="flex-grow"
                    />
                </div>
                <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="Surgeries"
                        data={["F", "23y", "23y", "O+"]}
                        onClickIcon={() => console.log("Surgeries icon clicked")}
                        onClickSelf={() => console.log("Surgeries clicked")}
                        className="flex-grow"
                    />
                </div>
                <div className="max-w-64 p-4 bg-background rounded-lg shadow-md flex flex-col">
                    <div className="flex text-foreground justify-between mb-4">
                        <label>Follow up</label>
                        <Switch
                            checked={appointment?.follow_up_required ?? false}
                            onCheckedChange={(value) => handleAppointmentChange("follow_up_required", value)}
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={saveAppointment}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-white w-6 h-6" />
                        ) : (
                            (appointment ? "Update" : "Complete") + " Appointment"
                        )}
                    </Button>
                </div>
            </div>


            {/* Dialogs */}

            {/* Vitals Dialog */}
            <AppointmentVitalsDialog
                dialogOpen={vitalsDialogOpen}
                setDialogOpen={setVitalsDialogOpen}
                appointmentId={id}
                vitalsData={appointment}
                editable={true}
            />

            {/* Diagnosis Dialog */}
            <DiagnosisDialog
                key={diagnosisDialogOpen ? 'open' : 'closed'}
                dialogOpen={diagnosisDialogOpen}
                setDialogOpen={setDiagnosisDialogOpen}
                appointmentId={id}
                diagnosisData={selectedDiagnosis}
                editable={true}
                onSave={handleSaveDiagnosis}
            />

            {/* Care Plan Dialog */}
            <CarePlanDialog
                key={carePlanDialogOpen ? 'open' : 'closed'}
                dialogOpen={carePlanDialogOpen}
                setDialogOpen={setCarePlanDialogOpen}
                appointmentId={id}
                carePlanData={selectedCarePlan}
                editable={true}
                onSave={handleSaveCarePlan}
            />
        </div>
    );
}

export default AppointmentPage;
