import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { Button } from "./ui/button";
import { Copy, Ellipsis } from "lucide-react";
import { format, set } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AppointmentVitalsDialog } from "./Dialogs/appointmentVitals-Dialog";
import { useState } from "react";

export default function PatientProfileTables({
    appointments,
    carePlans,
    diagnoses,
    patient,
    handleCopyId,
    handleCancelAppointment,
    handleNotesChange,
    handleSave,
    handleCompleteCareplan,
}) {
    const userRole = localStorage.getItem("role");
    const navigate = useNavigate();
    const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const statusColors = {
        Scheduled: "bg-primary/20 text-primary font-semibold",
        Completed: "bg-green-400/20 text-green-400 font-semibold",
        Cancelled: "bg-red-400/20 text-red-400 font-semibold",
        "No Show": "bg-orange-400/20 text-orange-400 font-semibold",
    };
    return (
        <>
            <Tabs defaultValue={userRole != "nurse" ? "appointments" : "care_plans"}>
                <TabsList className="w-full grid grid-cols-4 mb-4">
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="care_plans">Care Plans</TabsTrigger>
                    <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                    <TabsTrigger value="Information">Information</TabsTrigger>
                </TabsList>

                {/* Appointment Tab */}
                <TabsContent value="appointments">
                    <div className="overflow-y-auto max-h-[31rem] rounded-md animate-appear">
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
                                                    {
                                                        userRole.toLowerCase() === "nurse" && appointment.status === "Scheduled" && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-green-500 focus:text-green-600"
                                                                    onClick={() => {
                                                                        setSelectedAppointmentId(appointment.id);
                                                                        setSelectedAppointment(appointment);
                                                                        setVitalsDialogOpen(true);
                                                                    }}
                                                                >
                                                                    Update Vitals
                                                                </DropdownMenuItem>
                                                            </>

                                                        )
                                                    }
                                                    {appointment.status != "Cancelled" &&
                                                        (
                                                            <>
                                                                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleCancelAppointment(appointment.id)}>
                                                                    Cancel
                                                                </DropdownMenuItem>

                                                            </>
                                                        )
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
                    <div className="overflow-y-auto max-h-[31rem] rounded-md animate-appear">
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
                                        <TableCell className="line-clamp-2 break-words">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        {plan.done_by?.first_name} {plan.done_by?.last_name}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{plan.done_by?.first_name} {plan.done_by?.last_name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
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
                                                    {(userRole.toLowerCase() === "nurse" && plan.date_of_completion === null) && (
                                                        <DropdownMenuItem className="text-green-500 focus:text-green-600" onClick={() => handleCompleteCareplan(plan.id)}>Complete</DropdownMenuItem>
                                                    )}
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
                    <div className="overflow-y-auto max-h-[31rem] rounded-md animate-appear">
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
                    <div className="p-4 flex flex-col gap-4 grow h-full animate-appear">
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

            {/* Vitals Dialog */}
            <AppointmentVitalsDialog
                dialogOpen={vitalsDialogOpen}
                setDialogOpen={setVitalsDialogOpen}
                appointmentId={selectedAppointmentId}
                vitalsData={selectedAppointment}
                editable={true}
            />
        </>
    );
}