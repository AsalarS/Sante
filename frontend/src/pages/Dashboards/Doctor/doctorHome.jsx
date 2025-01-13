import { useEffect, useMemo, useState } from "react";
import StatBox from "@/components/statBox";
import { Loader2 } from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis } from "recharts";
import { chartData, chartConfig, patientDummyData, BarChartConfig, BarChartData } from './dashboardData'
import { calculateAge } from "@/utility/generalUtility";
import { toast } from "sonner";import AppointmentDisplay from "@/components/doctorAppointmentDisplay";
;

function DoctorHome() {
  const [stats, setStats] = useState({});
  const [nextAppointment, setNextAppointment] = useState([]);
  const [appointmentChartData, setAppointmentChartData] = useState([]);
  const [statusPieData, setStatusPieData] = useState({});
  const [pastWeekAppointments, setPastWeekAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all doctor's dashboard data
  const fetchDoctorDashboardData = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        nextAppointmentsRes,
        appointmentsChartRes,
        statusPieRes,
        pastWeekAppointmentsRes
      ] = await Promise.all([
        api.get("/api/doctor/dashboard/stats/"),
        api.get("/api/doctor/appointments/next/"),
        api.get("/api/doctor/appointments/chart/"),
        api.get("/api/doctor/appointments/status-pie/"),
        api.get("/api/doctor/appointments/past-week/")
      ]);

      setStats(statsRes.data);
      setNextAppointment(nextAppointmentsRes.data);      
      setAppointmentChartData(appointmentsChartRes.data);
      setStatusPieData(statusPieRes.data);
      setPastWeekAppointments(pastWeekAppointmentsRes.data);

    } catch (error) {
      console.error("Error fetching doctor's dashboard data:", error);
      toast.error("Failed to load doctor's dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboardData();
  }, []);


  const statusColors = {
    Scheduled: "bg-primary/20 text-primary font-semibold",
    Completed: "bg-green-400/20 text-green-400 font-semibold",
    Cancelled: "bg-red-400/20 text-red-400 font-semibold",
    "No Show": "bg-orange-400/20 text-orange-400 font-semibold",
  };

  const PieStatusColors = {
    Scheduled: "#6b88fe",
    Completed: "#2eb88a",
    Cancelled: "#fe6c8c",
    "No Show": "#FB923C"
  };

  const [activeChart, setActiveChart] = useState("desktop")

  // Calculate total visitors
  const totalPie = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <>
      <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 h-lvh">
        {/* Row 1 - Stat Boxes */}
        <div className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6">
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Completed Today" number={stats?.completed_today} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Follow Up Rate" number={stats?.follow_up_rate} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Patients This Week" number={stats?.patients_this_week} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Appt. Today" number={stats?.todays_appointments} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col">
            {/* Bar Chart */}
            <Card className="p-4 bg-background rounded-lg mb-6 text-foreground mt-6 border-none">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border/30 p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Appointments Over Time</CardTitle>
                  <CardDescription>Last 6 months of appointment data</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={BarChartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={appointmentChartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          nameKey="views"
                          labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          }}
                        />
                      }
                    />
                    <Bar dataKey={"appointments"} fill={`var(--color-${"desktop"})`} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Calendar */}
            <div className="p-4 bg-background rounded-lg mb-6 text-foreground h-fill">
              <div className="flex justify-between mb-4">
                <div className="flex justify-between gap-4 text-foreground text-lg items-center ml-2 font-semibold">
                  <h1 className="font-bold">Past Weeks Patients</h1>
                </div>
                <div className="flex justify-end gap-4">
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>
              {/* Table */}
              <div className="overflow-y-auto max-h-96 rounded-md">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead className="sticky top-0 z-10 text-center"></TableHead>
                      <TableHead className="sticky top-0 z-10 text-left">Name</TableHead>
                      <TableHead className="sticky top-0 z-10 text-left">Gender</TableHead>
                      <TableHead className="sticky top-0 z-10 text-left">Age</TableHead>
                      <TableHead className="sticky top-0 z-10 text-left">Appointment</TableHead>
                      <TableHead className="sticky top-0 z-10 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastWeekAppointments.map((patient) => (
                      <TableRow key={patient?.id} className="border-border/30">
                        {/* Avatar */}
                        <TableCell className="text-center">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={patient?.profile_image} alt="profile image" />
                            <AvatarFallback className="bg-muted">
                              {patient?.first_name.charAt(0).toUpperCase() +
                                patient?.last_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        {/* Name */}
                        <TableCell className="font-semibold text-lg text-left">
                          {`${patient?.first_name} ${patient?.last_name}`}
                        </TableCell>
                        {/* Gender */}
                        <TableCell>{patient?.gender}</TableCell>
                        {/* Age */}
                        <TableCell>{calculateAge(patient?.dob)}</TableCell>
                        {/* Appointment */}
                        <TableCell>{patient?.appointment_date} - {patient?.appointment_time}</TableCell>
                        {/* Status */}
                        <TableCell className="text-center">
                          <div
                            className={`px-2 py-1 text-sm rounded-md ${statusColors[patient?.status]}`}
                          >
                            {patient?.status}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2 flex flex-col">
          {nextAppointment && (
            <Card className="p-6 bg-background rounded-lg mb-6 text-foreground flex flex-col items-center justify-center border-none">
              <CardHeader className="text-2xl font-bold px-2 text-foreground">
                Next Patient
              </CardHeader>

              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="path-to-image.jpg" alt="Ali Alfardan's profile image" />
                <AvatarFallback className="bg-muted">
                  AA
                </AvatarFallback>
              </Avatar>
              <AppointmentDisplay nextAppointment={{
                appointment_id: nextAppointment?.appointment_id,
                patient_name: nextAppointment?.patient_name,
                patient_dob: nextAppointment?.patient_dob,
                patient_gender: nextAppointment?.patient_gender,
                patient_blood_type: nextAppointment?.patient_blood_type,
                date: nextAppointment?.appointment_date,
                time: nextAppointment?.appointment_time,
              }} />
            </Card>
          )}
          <Card className="p-4 bg-background rounded-lg mb-6 text-foreground min-h-36 flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Appointment Chart</CardTitle>
              <CardDescription>{statusPieData?.period?.start_date} - {statusPieData?.period?.end_date}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={statusPieData?.chart_data}
                    dataKey="count"
                    nameKey="appointments"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {statusPieData?.chart_data?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PieStatusColors[entry.appointments]}
                      />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {statusPieData.total_appointments.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Appointments
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>

              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                6 month appointment data
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorHome;
