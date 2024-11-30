import CompactListBox from "@/components/compactListBox";
import PatientList from "@/components/patientList"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Copy, Ellipsis } from "lucide-react";

function PatientProfile() {

    const [selectedConversation, setSelectedConversation] = useState(null);
    const conversations = [
        { id: 1, name: 'John Doe', current: 'in-patient', avatar: '/path/to/doctor-avatar.png' },
        { id: 2, name: 'Jane Doe', current: 'out-patient', avatar: '/path/to/pharmacy-avatar.png' },
    ];

    const appointmentData = [
        {
            id: 1,
            doctorName: 'Dr. Smith',
            appointmentDate: '2023-11-28',
            status: 'Scheduled',
            flowUpRequired: true,
            appointmentTime: '10:00 AM'
        },
        {
            id: 2,
            doctorName: 'Dr. Johnson',
            appointmentDate: '2023-11-29',
            status: 'Completed',
            flowUpRequired: false,
            appointmentTime: '02:00 PM'
        },
        {
            id: 3,
            doctorName: 'Dr. Williams',
            appointmentDate: '2023-11-30',
            status: 'Canceled',
            flowUpRequired: true,
            appointmentTime: '03:30 PM'
        },
    ];

    const statusColors = {
        Scheduled: "bg-primary/20 text-primary font-semibold",
        Completed: "bg-green-400/20 text-green-400 font-semibold",
        Canceled:  "bg-red-400/20 text-red-400 font-semibold",
    };

    return (
        <div className="flex overflow-y-auto">
            <PatientList
                conversations={conversations}
                onSelectConversation={(id) => setSelectedConversation(id)}
            />
            <div className="">
                <div className="flex flex-col sm:flex-row p-6 gap-4 h-lvh">
                    {/* Left Section (Main Content) */}
                    <div className="flex flex-col space-y-4 flex-grow sm:w-3/4">
                        <Card className=" bg-background rounded-lg flex flex-col border-none h-fit">
                            <CardHeader className="flex flex-row justify-between">
                                <div className="flex items-center space-x-2">
                                    <Avatar className="size-12 mr-2">
                                        <AvatarImage src="link" alt="Profile Image" />
                                        <AvatarFallback className="bg-muted text-foreground">PA</AvatarFallback>
                                    </Avatar>
                                    <Label className="text-2xl font-semibold text-foreground line-clamp-1 break-all">John Doe</Label>
                                </div>
                                <Button className="">Edit</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-gray-500 text-sm">Address</label>
                                        <span>123 Main St, Anytown, USA</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Age</label>
                                        <span>30</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Date of Birth</label>
                                        <span>January 1, 1990</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Blood Type</label>
                                        <span>O+</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">CPR</label>
                                        <span>12345678</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Emergency Contact Name</label>
                                        <span>Jane Smith</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Emergency Contact Number</label>
                                        <span>(555) 123-4567</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Gender</label>
                                        <span>Male</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Place of Birth</label>
                                        <span>New York, USA</span>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-sm">Religion</label>
                                        <span>None</span>
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
                                <TabsContent value="workups">Make changes to your account here.</TabsContent>
                                <TabsContent value="appointments">
                                    {/* TODO: Make this scroll infinitly and have strict number of rows to scroll */}
                                    <div className="overflow-y-auto max-h-[31rem] rounded-md">
                                        <Table className="w-full">
                                            <TableHeader>
                                                <TableRow className="border-border">
                                                    <TableHead className="sticky top-0 z-10 text-left">Doctor Name</TableHead>
                                                    <TableHead className="sticky top-0 z-10 text-left">Date</TableHead>
                                                    <TableHead className="sticky top-0 z-10 text-left">Time</TableHead>
                                                    <TableHead className="sticky top-0 z-10 text-center">Status</TableHead>
                                                    <TableHead className="sticky top-0 z-10 text-center">Follow Up</TableHead>
                                                    <TableHead className="sticky top-0 z-10">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {appointmentData.map((appointment) => (
                                                    <TableRow key={appointment.id} className="border-border">
                                                        <TableCell>{appointment.doctorName}</TableCell>
                                                        <TableCell>{appointment.appointmentDate}</TableCell>
                                                        <TableCell>{appointment.appointmentTime}</TableCell>
                                                        <TableCell>
                                                            <div
                                                            className={`px-2 py-1 text-sm  text-center rounded-md ${statusColors[appointment.status]}`}
                                                          >
                                                            {appointment.status}
                                                          </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">{appointment.flowUpRequired ? 'Yes' : 'No'}</TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" onClick={() => console.log("View user:", user)}>
                                                                        <Ellipsis className="text-foreground" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem className="flex flex-row justify-between">Copy ID <Copy/></DropdownMenuItem>
                                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500">Delete</DropdownMenuItem>
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
                                <h3 className="font-medium text-foreground mb-2">Patient Notes</h3>
                                <Textarea placeholder="Enter notes..." className="w-full min-h-28 flex-grow bg-border resize-none text-foreground text-sm" />
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientProfile