import { useEffect, useState } from "react";
import StatBox from "@/components/statBox";
import { Loader2 } from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function DoctorHome() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/api/users/patients/");
      if (response.status === 200) {
        setPatients(response.data);
        console.log(response.data);
      } else {
        console.error("Failed to fetch patient data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const statusColors = {
    Scheduled: "border-primary text-primary",
    Completed: "border-green-400 text-green-400",
    Canceled: "border-red-400 text-red-400",
  };

  const patientDummyData = [
    {
      id: 1,
      profile_image: "",
      first_name: "Ali",
      last_name: "Alfardan",
      gender: "Male",
      age: "23yrs",
      appointment: "2024/11/12 12:00PM",
      status: "Scheduled",
    },
    {
      id: 2,
      profile_image: "",
      first_name: "Sara",
      last_name: "Ahmed",
      gender: "Female",
      age: "29yrs",
      appointment: "2024/12/01 10:30AM",
      status: "Completed",
    },
    {
      id: 3,
      profile_image: "",
      first_name: "John",
      last_name: "Doe",
      gender: "Male",
      age: "35yrs",
      appointment: "2024/11/28 03:15PM",
      status: "Canceled",
    },
    {
      id: 4,
      profile_image: "",
      first_name: "Emily",
      last_name: "Smith",
      gender: "Female",
      age: "41yrs",
      appointment: "2024/12/03 09:45AM",
      status: "Scheduled",
    },
    {
      id: 5,
      profile_image: "",
      first_name: "Michael",
      last_name: "Brown",
      gender: "Male",
      age: "50yrs",
      appointment: "2024/11/27 02:00PM",
      status: "Completed",
    },
    {
      id: 6,
      profile_image: "",
      first_name: "Sophia",
      last_name: "Johnson",
      gender: "Female",
      age: "31yrs",
      appointment: "2024/12/10 11:30AM",
      status: "Scheduled",
    },
    {
      id: 7,
      profile_image: "",
      first_name: "Omar",
      last_name: "Hassan",
      gender: "Male",
      age: "45yrs",
      appointment: "2024/11/29 04:00PM",
      status: "Canceled",
    },
    {
      id: 8,
      profile_image: "",
      first_name: "Lina",
      last_name: "Farid",
      gender: "Female",
      age: "28yrs",
      appointment: "2024/11/30 01:00PM",
      status: "Scheduled",
    },
    {
      id: 9,
      profile_image: "",
      first_name: "Chris",
      last_name: "Evans",
      gender: "Male",
      age: "39yrs",
      appointment: "2024/12/05 10:15AM",
      status: "Completed",
    },
    {
      id: 10,
      profile_image: "",
      first_name: "Maya",
      last_name: "Ali",
      gender: "Female",
      age: "24yrs",
      appointment: "2024/11/25 05:30PM",
      status: "Scheduled",
    },
  ];

  return (
    <>
      <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 h-lvh">
        {/* Row 1 - Stat Boxes */}
        <div className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6">
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Todays Patients" number="34" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Appt. Done" number="10" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="New Patients" number="15" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Returning Patients" number="20" />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground mt-6"></div>

          {/* Calendar */}
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground mt-6 h-fill">
            <div className="flex justify-between mb-4">
              <div className="flex justify-between">
                <Input placeholder="Search patients"/>
              </div>
              <div className="flex justify-end gap-4">
                <DatePickerWithRange />
                <Button>Today</Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-y-auto max-h-96 rounded-md">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 z-10 text-center"></TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Name</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Gender</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Age</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Appointment</TableHead>
                    <TableHead className="sticky top-0 z-10 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientDummyData.map((patient) => (
                    <TableRow key={patient.id}>
                      {/* Avatar */}
                      <TableCell className="text-center">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={patient.profile_image} alt="profile image" />
                          <AvatarFallback className="bg-muted">
                            {patient.first_name.charAt(0).toUpperCase() +
                              patient.last_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      {/* Name */}
                      <TableCell className="font-semibold text-lg text-left">
                        {`${patient.first_name} ${patient.last_name}`}
                      </TableCell>
                      {/* Gender */}
                      <TableCell>{patient.gender}</TableCell>
                      {/* Age */}
                      <TableCell>{patient.age}</TableCell>
                      {/* Appointment */}
                      <TableCell>{patient.appointment}</TableCell>
                      {/* Status */}
                      <TableCell className="text-center">
                        <div
                          className={`px-2 py-1 text-sm rounded-lg border ${statusColors[patient.status]}`}
                        >
                          {patient.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>


          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2">
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground min-h-36">
            Smaller Box
          </div>
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground min-h-36">
            Smaller Box
          </div>
          <div className="p-4 bg-background rounded-lg shadow-md flex-grow text-foreground">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ul>
                {patients.map((patient, index) => (
                  <li key={index}>{patient.email}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorHome;
