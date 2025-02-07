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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import PatientProfileList from "./patientProfileList";
import PrescriptionList from "./patientProfilePrescriptionsList";
import CompactPrescriptionList from "./compactPrescriptionsList";

function AppointmentPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { paramReadOnly } = useParams();
    const location = useLocation();
    const [patientId, setPatientId] = useState(location.state?.patientId);
    const [readOnly, setReadOnly] = useState(false);
    const userRole = localStorage.getItem("role");
    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [carePlans, setCarePlans] = useState([]);
    const [prescriptions, setPrescriptions] = useState({});
    const [selectedCarePlan, setSelectedCarePlan] = useState(null);
    const [diagnoses, setDiagnoses] = useState([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
    const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
    const [carePlanDialogOpen, setCarePlanDialogOpen] = useState(false);
    const [idCounter, setIdCounter] = useState(1);
    const [showList, setShowList] = useState(false);
    const [activeListType, setActiveListType] = useState(null);
    // Add a state to track whether diagnoses or careplans have been modified
    const [diagnosesDirty, setDiagnosesDirty] = useState(false);
    const [carePlansDirty, setCarePlansDirty] = useState(false);

    const fetchAppointments = async () => {
        if (!id) return;

        try {
            const response = await api.get(`/api/appointments/${id}/`);
            if (response.status === 200) {
                const appointmentData = response.data;
                setAppointment(appointmentData);
                if (appointmentData?.status?.toLowerCase() != "scheduled") {
                    setReadOnly(true);
                }
                if (!patientId || patientId === "undefined" || isNaN(patientId)) {
                    setPatientId(appointmentData?.patient.id);
                }

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
            const response = await api.get(`/api/user/${patientId}/`);;
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
                const carePlanData = response.data.map((plan) => ({
                    ...plan,
                    key: plan.key || `${plan.care_plan_title}-${Date.now()}`
                }));
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
                const diagnosesData = response.data.map((diagnosis) => ({
                    ...diagnosis,
                    key: diagnosis.key || `${diagnosis.diagnosis_name}-${Date.now()}`,
                }));
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

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get(`/api/appointments/prescriptions/${id}/`);

            if (response.status === 200) {
                setPrescriptions(response.data);
            } else if (response.status === 404) {
                console.warn("Prescriptions not found (404):", response.statusText);
            } else {
                console.error("Failed to fetch prescriptions:", response.statusText);
            }
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error("Failed to fetch prescriptions:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Patient Data Fetch
    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        }
    }, [patientId]);

    // Vitals Data Refresh on dialog close
    useEffect(() => {
        if (!vitalsDialogOpen) {
            fetchAppointments();
        }
    }, [id, vitalsDialogOpen]);

    // Fetch diagnoses and care plans on load
    useEffect(() => {
        if (id) {
            fetchDiagnoses();
            fetchCarePlans();
            fetchPrescriptions();
        }
    }, [id]);

    // Set read only state when paramReadOnly is passed as a parameter
    useEffect(() => {
        if (paramReadOnly && paramReadOnly.toLowerCase() === 'true' || userRole !== 'doctor') {
            setReadOnly(true);
        }
    }, [paramReadOnly]);

    const handleAppointmentChange = (field, value) => {
        setAppointment((prev) => ({ ...prev, [field]: value }));
    };

    // Modified handleSaveDiagnosis to only update local state
    const handleSaveDiagnosis = (diagnosis) => {
        setDiagnoses((prevDiagnoses) => {
            if (!diagnosis.id) {
                // For new diagnoses, create a temporary local ID
                diagnosis.id = `temp_${Date.now()}`;
                diagnosis.key = `${diagnosis.diagnosis_name}-${Date.now()}`;
                return [...prevDiagnoses, diagnosis];
            }

            return prevDiagnoses.map((d) =>
                d.id === diagnosis.id ? diagnosis : d
            );
        });

        // Mark diagnoses as modified
        setDiagnosesDirty(true);
        setDiagnosisDialogOpen(false);
    };

    const handleSaveCarePlan = (carePlan) => {
        setCarePlans(prevCarePlans => {
            if (!carePlan.id) {
                // For new care plans, create a temporary local ID and ensure we have a key
                const newCarePlan = {
                    ...carePlan,
                    id: `temp_${Date.now()}`,
                    key: carePlan.key || `${carePlan.care_plan_title}-${Date.now()}`
                };
                return [...prevCarePlans, newCarePlan];
            }
            return prevCarePlans.map(cp =>
                cp.id === carePlan.id ? {
                    ...carePlan,
                    key: carePlan.key || `${carePlan.care_plan_title}-${Date.now()}`
                } : cp
            );
        });
        setCarePlansDirty(true);
        setCarePlanDialogOpen(false);
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

    const handleDeleteDiagnosis = (diagnosis) => {
        setDiagnoses(prevDiagnoses =>
            prevDiagnoses.filter(d => d.id !== diagnosis.id)
        );
        setDiagnosesDirty(true);
    };

    const handleDeleteCarePlan = (carePlan) => {
        setCarePlans(prevCarePlans =>
            prevCarePlans.filter(cp => cp.id !== carePlan.id)
        );
        setCarePlansDirty(true);
    };

    const saveAppointment = async (complete = false) => {
        setLoading(true);
        try {
            // Set status to Completed if complete is true
            if (complete) {
                appointment.status = 'Completed';
            }

            // save/update the appointment
            const appointmentResponse = await api.patch(`/api/appointments/${id}/`, appointment);

            if (appointmentResponse.status !== 200) {
                throw new Error('Failed to save appointment');
            }

            //Handle diagnoses synchronization
            if (diagnosesDirty) {
                //fetch all existing diagnoses from the API
                const existingDiagnosesResponse = await api.get(`/api/appointments/diagnoses/${id}/`);
                const existingDiagnoses = existingDiagnosesResponse.data || [];

                // Find diagnoses to delete (ones in API but not in local state)
                const diagnosesToDelete = existingDiagnoses.filter(existingDiagnosis =>
                    !diagnoses.some(localDiagnosis =>
                        localDiagnosis.id === existingDiagnosis.id ||
                        localDiagnosis.key === existingDiagnosis.key
                    )
                );

                // Delete removed diagnoses
                const deletePromises = diagnosesToDelete.map(diagnosis =>
                    api.delete(`/api/appointments/diagnoses/${id}/${diagnosis.id}/`)
                );
                await Promise.all(deletePromises);

                // Save/update remaining diagnoses
                if (diagnoses.length > 0) {
                    const diagnosesToSave = diagnoses.map(diagnosis => ({
                        ...diagnosis,
                        appointment_id: id,
                        id: diagnosis.id.startsWith('temp_') ? undefined : diagnosis.id
                    }));

                    const savePromises = diagnosesToSave.map(diagnosis =>
                        api.patch(`/api/appointments/diagnoses/${id}/`, {
                            id: diagnosis.id,
                            diagnosis_name: diagnosis.diagnosis_name,
                            diagnosis_type: diagnosis.diagnosis_type
                        }
                        )
                    );

                    await Promise.all(savePromises);
                }
                setDiagnosesDirty(false);
            }

            // Handle care plans synchronization
            if (carePlansDirty) {
                // First, fetch all existing care plans from the API
                const existingCarePlansResponse = await api.get(`/api/appointments/careplans/${id}/`);
                const existingCarePlans = existingCarePlansResponse.data || [];

                // Find care plans to delete (ones in API but not in local state)
                const carePlansToDelete = existingCarePlans.filter(existingPlan =>
                    !carePlans.some(localPlan =>
                        localPlan.id === existingPlan.id ||
                        localPlan.key === existingPlan.key
                    )
                );

                // Delete removed care plans
                const deletePromises = carePlansToDelete.map(plan =>
                    api.delete(`/api/appointments/careplans/${id}/`, {
                        data: { id: plan.id }
                    })
                );
                await Promise.all(deletePromises);

                // Save/update remaining care plans
                if (carePlans.length > 0) {
                    const carePlansToSave = carePlans.map(plan => ({
                        ...plan,
                        appointment_id: id,
                        id: plan.id.startsWith('temp_') ? undefined : plan.id
                    }));

                    const savePromises = carePlansToSave.map(plan =>
                        api.patch(`/api/appointments/careplans/${id}/`, plan)
                    );

                    await Promise.all(savePromises);
                }
                setCarePlansDirty(false);
            }

            toast.success("Appointment saved successfully!");

            // Navigate away only after everything is saved
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate(`/${userRole}/patients`);
            }

        } catch (error) {
            console.error("Error saving appointment data:", error);
            toast.error("An error occurred while saving. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleIconClick = (type) => {
        // If a list is already showing, close it first to ensure clean state
        if (showList) {
            setShowList(false);
            // Small delay to allow state to clear
            setTimeout(() => {
                setActiveListType(type);
                setShowList(true);
            }, 100);
        } else {
            setActiveListType(type);
            setShowList(true);
        }
    };

    const handleMinimizeClick = () => {
        setShowList(false);
    };

    const handleListSave = async (type, data) => {
        try {
            if (type === 'prescriptions') {
                // Handle prescriptions CRUD operations
                const { new: newPrescriptions, modified: modifiedPrescriptions, deleted: deletedPrescriptions } = data;

                // Create new prescriptions
                for (const prescription of newPrescriptions) {
                    await api.post(`/api/appointments/prescriptions/${id}/`, prescription);
                }

                // Update modified prescriptions
                for (const prescription of modifiedPrescriptions) {
                    
                    await api.patch(`/api/prescriptions/${prescription.id}/`, prescription);
                }

                // Delete removed prescriptions
                for (const prescriptionId of deletedPrescriptions) {
                    await api.delete(`/api/prescriptions/${prescriptionId}/`);
                }

                // Refresh prescriptions after all operations
                const updatedPrescriptions = await api.get(`/api/appointments/prescriptions/${id}/`);
                setPrescriptions(updatedPrescriptions.data);

                toast.success('Prescriptions updated successfully');
            } else {
                // Handle other types using the existing patient endpoint
                const updateData = {
                    [type]: data
                };
                const response = await api.patch(`/api/user/${patientId}/`, updateData);

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
            <div className="flex flex-col space-y-4 grow sm:w-3/4 overflow-y-auto">
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
                                    navigate(`/${userRole}/patients`);
                                }
                            }}>
                            <ChevronLeft size={24} />
                        </div>
                        <div className="flex flex-row content-center self-center">
                            <h1 className="text-foreground font-bold text-xl">Appointment</h1>
                            <Badge className="text-white ml-2">
                                {appointment?.appointment_date ? appointment?.status : "New"}
                            </Badge>
                            {readOnly && (
                                <Badge className="text-white ml-2 bg-red-500 hover:bg-red-600">
                                    Read Only
                                </Badge>
                            )}
                        </div>
                    </div>
                    {appointment?.appointment_date &&
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
                <div className="flex flex-col space-y-4 grow overflow-y-auto">
                    <Card className="bg-background p-4 rounded-lg inline-block border-none">
                        <div className="flex flex-row justify-between mb-2">
                            <span className="text-lg font-semibold mb-2 ml-1">Vitals</span>
                            {!readOnly && (
                                <Button className="size-8" size="icon" variant={"secondary"} onClick={() => setVitalsDialogOpen(true)}><PenLine size={20} /></Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* Heart Rate */}
                            <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-white rounded-md  p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Heart className="text-white bg-red-500 rounded-lg p-2 w-10 h-10" />
                                    <h3 className="font-semibold text-gray-700 dark:text-white">Heart Rate</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center text-foreground">{appointment?.heart_rate || "0"}
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">BPM</span>
                                </h1>
                            </div>
                            {/* Blood Pressure */}
                            <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <CircleGauge className="text-white bg-blue-500 rounded-lg p-2 w-10 h-10" />
                                    <h3 className="font-semibold text-gray-700 dark:text-white">Blood Pressure</h3>
                                </div>
                                <h1 className="text-3xl font-bold flex flex-col items-center text-foreground">{appointment?.blood_pressure || "0/0"}
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">mmHg</span>
                                </h1>
                            </div>
                            {/* Temperature */}
                            <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Thermometer className="text-white bg-green-500 rounded-lg p-2 w-10 h-10" />
                                    <h3 className="font-semibold text-gray-700 dark:text-white">Temperature</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center text-foreground">{appointment?.temperature || "0.0"}°
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">Celsius</span>
                                </h1>
                            </div>
                            {/* Oxygen Saturation */}
                            <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Wind className="text-white bg-amber-500 rounded-lg p-2 w-10 h-10" />
                                    <h3 className="font-semibold line-clamp-2 break-words text-gray-700 dark:text-white">O₂ Saturation</h3>
                                </div>
                                <h1 className="text-4xl font-bold flex flex-col items-center text-foreground">{appointment?.o2_sat || "0"}%
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">Percent</span>
                                </h1>
                            </div>
                            {/* Respiratory Rate */}
                            <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-white rounded-md p-4 flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <Activity className="text-white bg-purple-500 rounded-lg p-2 w-10 h-10" />
                                    <h3 className="font-semibold line-clamp-2 break-words text-gray-700 dark:text-white">Respiratory Rate</h3>
                                </div>
                                <h1 className="text-3xl font-bold flex flex-col items-center text-foreground">{appointment?.resp_rate || "0"}
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">BrPM</span>
                                </h1>
                            </div>
                        </div>
                    </Card>
                    {!showList ? (
                        <>
                            {/* Diagnoses */}
                            <Card className="bg-background p-4 rounded-lg shrink flex flex-col border-none">
                                <div className="flex flex-row justify-between mb-2">
                                    <span className="text-lg font-semibold mb-2 ml-1">Diagnoses</span>
                                    {!readOnly && (
                                        <Button
                                            className="size-8"
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => {
                                                setSelectedDiagnosis(null);
                                                setDiagnosisDialogOpen(true);
                                            }}
                                        >
                                            <Plus size={20} />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-32">
                                    {diagnoses?.map((diagnosis) => (
                                        <div key={diagnosis.key} className="bg-background-hover rounded-md p-4 flex flex-row justify-between">
                                            <div className="self-center">
                                                <div className="flex flex-row mb-1 self-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="font-semibold line-clamp-1 break-all">
                                                                {diagnosis?.diagnosis_name}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{diagnosis?.diagnosis_name}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {/* Primary or secondary diagnosis */}
                                                    <Badge className="text-white ml-4">{diagnosis?.diagnosis_type}</Badge>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="self-center w-10 h-10 ml-2">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEditDiagnosis(diagnosis)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500 focus:text-red-500"
                                                        onClick={() => handleDeleteDiagnosis(diagnosis)}
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
                                    {!readOnly && (
                                        <Button
                                            className="size-8"
                                            variant="secondary"
                                            onClick={() => {
                                                setSelectedCarePlan(null);
                                                setCarePlanDialogOpen(true);
                                            }}
                                        >
                                            <Plus size={20} />
                                        </Button>
                                    )}
                                </div>

                                {/* List of plans */}
                                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-60">
                                    {carePlans?.map((plan) => (
                                        <div key={plan.key} className="bg-background-hover rounded-md p-4 flex flex-row justify-between mb-2">
                                            <div className="self-center">
                                                <div className="flex flex-row mb-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="font-semibold line-clamp-1 break-all">
                                                                {plan.care_plan_title}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{plan.care_plan_title}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {/* Type of consult */}
                                                    <Badge className="text-white ml-4">{plan.care_plan_type}</Badge>
                                                </div>
                                                {plan.additional_instructions && (
                                                    <div className="flex flex-row">
                                                        <CornerDownRight className="" size={16} />
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-sm ml-2 line-clamp-1 break-all">
                                                                    {plan.additional_instructions}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{plan.additional_instructions}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="self-center w-10 h-10 ml-2">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEditCarePlan(plan)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500 focus:text-red-500"
                                                        onClick={() => handleDeleteCarePlan(plan)}
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
                                    readOnly={readOnly}
                                    value={appointment?.notes || ""}
                                    placeholder="Enter details..."
                                    className="w-full grow bg-muted dark:bg-border resize-none text-foreground"
                                    onChange={(e) => handleAppointmentChange("notes", e.target.value)}
                                />
                            </Card>
                        </>
                    ) : (
                        activeListType === 'prescriptions' ? (
                            <Card className="bg-background p-4 rounded-lg grow flex flex-col border-none">
                                <PrescriptionList
                                    readOnly={userRole !== "doctor"}
                                    onClickMinimize={handleMinimizeClick}
                                    initialData={prescriptions}
                                    onSave={(updatedPrescriptions) => handleListSave('prescriptions', updatedPrescriptions)}
                                    appointmentId={id}
                                />
                            </Card>
                        ) : (
                            <Card className="bg-background p-4 rounded-lg grow flex flex-col border-none">
                                <PatientProfileList
                                    readOnly={userRole !== "doctor"}
                                    onClickMinimize={handleMinimizeClick}
                                    title={activeListType === 'allergies' ? 'Allergies' :
                                        activeListType === 'prescriptions' ? 'Prescriptions' :
                                            activeListType === 'past_surgeries' ? 'Surgeries' :
                                                'Chronic Conditions'}
                                    initialData={activeListType === 'prescriptions' ? prescriptions :
                                        activeListType === 'allergies' ? patient?.allergies :
                                            activeListType === 'past_surgeries' ? patient?.past_surgeries :
                                                patient?.chronic_conditions || {}}
                                    onSave={handleListSave}
                                    type={activeListType}
                                />
                            </Card>
                        )
                    )}
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
                        className="grow"
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
                        <div className="flex justify-center flex-col items-center">
                            <HoverCard>
                                <HoverCardTrigger>
                                    {patient && (
                                        <div className="flex h-5 items-center space-x-4 text-sm text-foreground font-bold">
                                            <div className="hover:underline">{patient?.date_of_birth ? calculateAge(patient.date_of_birth) : ''}</div>
                                            {patient?.gender && (
                                                <>
                                                    <Separator orientation="vertical" className="bg-white/30 h-4" />
                                                    <div className="hover:underline">{patient?.gender || ''}</div>
                                                </>
                                            )}
                                            {patient?.blood_type && (
                                                <>
                                                    <Separator orientation="vertical" className="bg-white/30 h-4" />
                                                    <div className="hover:underline">{patient?.blood_type || ''}</div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </HoverCardTrigger>
                                <HoverCardContent className="bg-background rounded-lg shadow-lg p-4 w-72">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-gray-500 text-sm">Address</label>
                                            <span>{patient?.address || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Age</label>
                                            <span>{calculateAge(patient?.date_of_birth) || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">DOB</label>
                                            <span>{patient?.date_of_birth || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Blood Type</label>
                                            <span>{patient?.blood_type || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">CPR</label>
                                            <span>{patient?.CPR_number || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Emergency Name</label>
                                            <span>{patient?.emergency_contact_name || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Emergency Phone</label>
                                            <span>{patient?.emergency_contact_phone || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Gender</label>
                                            <span>{patient?.gender || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Birthplace</label>
                                            <span>{patient?.place_of_birth || "None"}</span>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm">Religion</label>
                                            <span>{patient?.religion || "None"}</span>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                            <Button className="w-full mt-4" onClick={() => navigate(`/${userRole}/patients/${patient?.id}`)}>Open Profile</Button>
                        </div>
                    </div>
                </div>
                {/* Patient  Medical Information */}
                <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="Allergies"
                        data={patient?.allergies || {}}
                        onClickIcon={() => console.log("Allergies icon clicked")}
                        className="grow"
                    />
                </div>
                <div className="max-w-64">

                    <CompactPrescriptionList
                        prescriptions={prescriptions}
                        onClickIcon={() => handleIconClick('prescriptions')}
                        className="grow"
                    />
                </div>
                <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="Surgeries"
                        data={patient?.past_surgeries || {}}
                        onClickIcon={() => handleIconClick('past_surgeries')}
                        className="grow"
                    />
                </div>
                <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="Chronic Conditions"
                        data={patient?.chronic_conditions || {}}
                        onClickIcon={() => handleIconClick('chronic_conditions')}
                        className="grow"
                    />
                </div>
                {!readOnly && (
                    <div className="max-w-64 p-4 bg-background rounded-lg shadow-md flex flex-col">
                        <div className="flex text-foreground justify-between mb-4">
                            <label>Follow up</label>
                            <Switch
                                readOnly={readOnly}
                                checked={appointment?.follow_up_required ?? false}
                                onCheckedChange={(value) => handleAppointmentChange("follow_up_required", value)}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => saveAppointment(false)}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin text-white w-6 h-6" />
                            ) : (
                                "Update"
                            )}
                        </Button>
                        <Button
                            className="w-full mt-2"
                            onClick={() => saveAppointment(true)}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin text-white w-6 h-6" />
                            ) : (
                                "Complete"
                            )}
                        </Button>
                    </div>
                )}
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
                key={`diagnosis-${diagnosisDialogOpen}-${selectedDiagnosis?.id || 'new'}`}
                dialogOpen={diagnosisDialogOpen}
                setDialogOpen={setDiagnosisDialogOpen}
                appointmentId={id}
                diagnosisData={selectedDiagnosis}
                editable={true}
                onSave={handleSaveDiagnosis}
            />

            {/* Care Plan Dialog */}
            <CarePlanDialog
                key={`careplan-${carePlanDialogOpen}-${selectedCarePlan?.id || 'new'}`}
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
