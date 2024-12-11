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

function PatientProfile({ patientId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get(`/api/user-info/${patientId}/`);
        if (response.status === 200) {
          const patient = response.data;
          console.log("Patients:", patient);

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

    fetchPatients();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const appointmentData = [
    {
      id: 1,
      doctorName: "Dr. Smith",
      appointmentDate: "2023-11-28",
      status: "Scheduled",
      flowUpRequired: true,
      appointmentTime: "10:00 AM",
    },
    {
      id: 2,
      doctorName: "Dr. Johnson",
      appointmentDate: "2023-11-29",
      status: "Completed",
      flowUpRequired: false,
      appointmentTime: "02:00 PM",
    },
    {
      id: 3,
      doctorName: "Dr. Williams",
      appointmentDate: "2023-11-30",
      status: "Canceled",
      flowUpRequired: true,
      appointmentTime: "03:30 PM",
    },
  ];

  const statusColors = {
    Scheduled: "bg-primary/20 text-primary font-semibold",
    Completed: "bg-green-400/20 text-green-400 font-semibold",
    Canceled: "bg-red-400/20 text-red-400 font-semibold",
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
                    PA
                  </AvatarFallback>
                </Avatar>
                <Label className="text-2xl font-semibold text-foreground line-clamp-1 break-all">
                  John Doe
                </Label>
              </div>
              <Button className="">Edit</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-500 text-sm">Address</label>
                  <span>{patient.address || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Age</label>
                  <span>{calculateAge(patient.date_of_birth) || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Date of Birth
                  </label>
                  <span>{patient.date_of_birth || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Blood Type
                  </label>
                  <span>{patient.blood_type || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">CPR</label>
                  <span>{patient.CPR_number || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Emergency Contact Name
                  </label>
                  <span>{patient.emergency_contact_name || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Emergency Contact Number
                  </label>
                  <span>{patient.emergency_contact_phone || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Gender</label>
                  <span>{patient.gender || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Place of Birth
                  </label>
                  <span>{patient.place_of_birth || "None"}</span>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">
                    Religion
                  </label>
                  <span>{patient.religion || "None"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background p-4 rounded-lg flex-grow flex flex-col border-none">
            <Tabs defaultValue="appointments">
              <TabsList className="flex justify-center w-fit mx-auto mb-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="workups">Workups</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="information">Information</TabsTrigger>
              </TabsList>
              <TabsContent value="workups">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="appointments">
                {/* TODO: Make this scroll infinitly and have strict number of rows to scroll */}
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
                      {appointmentData.map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="border-border"
                        >
                          <TableCell>{appointment.doctorName}</TableCell>
                          <TableCell>{appointment.appointmentDate}</TableCell>
                          <TableCell>{appointment.appointmentTime}</TableCell>
                          <TableCell>
                            <div
                              className={`px-2 py-1 text-sm  text-center rounded-md ${
                                statusColors[appointment.status]
                              }`}
                            >
                              {appointment.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {appointment.flowUpRequired ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    console.log("View user:", user)
                                  }
                                >
                                  <Ellipsis className="text-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="flex flex-row justify-between">
                                  Copy ID <Copy />
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                  Delete
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
            </Tabs>
          </Card>
        </div>

        {/* Right Section (Sidebar) */}
        <div className="flex flex-col space-y-4 min-w-2/12 overflow-y-auto">
          {/* Patient Card */}
          <div className="max-w-64">
            <div className="p-4 bg-background rounded-lg shadow-md cursor-pointer">
              <h3 className="font-medium text-foreground mb-2">
                Patient Notes
              </h3>
              <Textarea
                placeholder="Enter notes..."
                className="w-full min-h-28 flex-grow bg-border resize-none text-foreground text-sm"
                value={patient.patient_notes || ""}
              />
            </div>
          </div>
          {/* Patient  Medical Information */}
          <div className="max-w-64">
            <CompactListBox
              displayAsBadges={true}
              title="Allergies"
              data={["Nuts", "23y", "23y", "Penicillin"]}
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
              data={["F", "23y", "23y", "O+"]}
              onClickIcon={() => console.log("Surgeries icon clicked")}
              onClickSelf={() => console.log("Surgeries clicked")}
              className="flex-grow"
            />
          </div>
          <div className="max-w-64 p-4 bg-background rounded-lg shadow-md flex flex-col gap-4">
            <Button className="w-full">Generate Documents</Button>
            <Button
              className="w-full"
              onClick={() => navigate("appointment/1")}
            >
              New Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
