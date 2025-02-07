import { useEffect, useMemo, useState } from "react";
import StatBox from "@/components/statBox";
import { Clock, Loader2 } from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Label, Pie, PieChart } from "recharts";
import { chartData, chartConfig, patientDummyData } from '../Doctor/dashboardData'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import NextAppointmentCard from "@/components/patientAppointmentDisplay";

function PatientHome() {
  const [loading, setLoading] = useState(false);
  const [carePlans, setCarePlans] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [statusPieChartData, setStatusPieChartData] = useState({});
  const [nextAppointment, setNextAppointment] = useState({});
  const [previousDoctors, setPreviousDoctors] = useState([]);
  const [patientStats, setPatientStats] = useState({});

  const fetchPatientDashboardData = async () => {
    try {
      setLoading(true);

      const [
        statusPieChartRes,
        nextAppointmentRes,
        previousDoctorsRes,
        patientStatsRes
      ] = await Promise.all([
        api.get("/api/patient/pie-chart/"),
        api.get("/api/patient/next-appointment/"),
        api.get("/api/patient/previous-doctors/"),
        api.get("/api/patient/stats/")
      ]);

      // Set the responses into state
      setStatusPieChartData(statusPieChartRes.data);
      setNextAppointment(nextAppointmentRes.data);
      setPreviousDoctors(previousDoctorsRes.data);
      setPatientStats(patientStatsRes.data);


    } catch (error) {
      console.error("Error fetching patient's dashboard data:", error);
      toast.error("Failed to load patient's dashboard data");
    } finally {
      setLoading(false);
    }
  };


  // Fetch all patient's dashboard data
  const fetchPatientTables = async () => {
    try {
      setLoading(true);

      const [
        carePlansRes,
        diagnosesRes,
        prescriptionsRes
      ] = await Promise.all([
        api.get("/api/patient/care-plans/"),
        api.get("/api/patient/diagnoses/"),
        api.get("/api/patient/prescriptions/")
      ]);

      // Setting data for the patient dashboard
      setCarePlans(carePlansRes.data);
      setDiagnoses(diagnosesRes.data);
      setPrescriptions(prescriptionsRes.data);

    } catch (error) {
      console.error("Error fetching patient's dashboard data:", error);
      toast.error("Failed to load patient's dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const PieStatusColors = {
    Scheduled: "#6b88fe",
    Completed: "#2eb88a",
    Cancelled: "#fe6c8c",
    "No Show": "#FB923C"
  };

  useEffect(() => {
    fetchPatientDashboardData();
    fetchPatientTables();
  }, []);

  // Calculate total visitors
  const totalPie = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <>
      <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 bg-even-darker-background h-full text-foreground">
        {/* Row 1 - Stat Boxes */}
        <div className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6">
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Total Appointments" number={patientStats?.total_appointments} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Appt. Done" number={patientStats?.completed_appointments} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Cancelled Appt." number={patientStats?.canceled_appointments} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Diagnoses" number={diagnoses.length} />
            </div>
          </div>

          {/* Table */}
          <div className="mx-auto py-3 text-foreground">

            {/* Care Plans Table */}
            <div className="overflow-y-auto max-h-80 rounded-md mb-8 mt-4">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="sticky top-0 z-10 text-left">Care Plan Title</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Type</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Date of Completion</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Done By</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Instructions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carePlans?.map((plan) => (
                    <TableRow key={crypto.randomUUID()} className="border-border">
                      <TableCell className="font-semibold text-lg text-left line-clamp-1 break-all">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              {plan?.care_plan_title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{plan?.care_plan_title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell >
                        <div className={`px-2 py-1 text-sm text-center rounded-md ${{
                          Immediate: "bg-primary/20 text-primary",
                          "Long-term": "bg-chart-5/20 text-chart-5",
                        }[plan?.care_plan_type]
                          }`}>
                          {plan?.care_plan_type}
                        </div>
                      </TableCell>
                      <TableCell>{plan?.date_of_completion}</TableCell>
                      <TableCell>{plan?.done_by}</TableCell>
                      <TableCell className="line-clamp-2 break-words">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              {plan?.additional_instructions}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{plan?.additional_instructions}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>


            {/* Prescriptions Table */}
            <div className="rounded-md mb-8">
              <div className="max-h-80 overflow-y-auto border border-border rounded-md">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow className="border-border">
                      <TableHead className="text-left">Medication Name</TableHead>
                      <TableHead className="text-left">Dosage</TableHead>
                      <TableHead className="text-left">Duration</TableHead>
                      <TableHead className="text-left">Instructions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions?.map((prescription) => (
                      <TableRow key={prescription.id + crypto.randomUUID()} className="border-border">
                        <TableCell className="font-semibold text-lg text-left line-clamp-1 break-all">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {prescription.medication_name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{prescription.medication_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.duration} days</TableCell>
                        <TableCell className="line-clamp-2 break-words">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {prescription.special_instructions}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{prescription.special_instructions}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Diagnoses Table */}
            <div className="overflow-y-auto max-h-80 rounded-md">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="sticky top-0 z-10 text-left">Diagnosis Name</TableHead>
                    <TableHead className="sticky top-0 z-10 text-left">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diagnoses?.map((diagnosis) => (
                    <TableRow key={diagnosis.id + crypto.randomUUID()} className="border-border">
                      <TableCell className="font-semibold text-lg text-left line-clamp-1 break-all">
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
                        <div className={`px-2 py-1 text-sm text-center rounded-md ${{
                          Primary: "bg-primary/20 text-primary",
                          Secondary: "bg-chart-5/20 text-chart-5",
                        }[diagnosis.diagnosis_type]
                          }`}>
                          {diagnosis.diagnosis_type}
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
        <div className="col-span-12 lg:col-span-2 flex flex-col mb-3">
          <NextAppointmentCard
            nextAppointment={{
              doctor_name: nextAppointment?.doctor_name,
              office_number: nextAppointment?.office_number,
              specialization: nextAppointment?.specialization,
              date: nextAppointment?.appointment_date,
              time: nextAppointment?.appointment_time,
              appointment_id: nextAppointment?.appointment_id,
            }}
          />
          <Card className="py-4 bg-background rounded-lg mb-6 text-foreground min-h-36 flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Appointment Chart</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
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
                    data={statusPieChartData?.chart_data}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {statusPieChartData?.chart_data?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PieStatusColors[entry.status]}
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
                                {statusPieChartData?.total_appointments?.toLocaleString()}
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
          <Card className="px-4 bg-background rounded-lg grow text-foreground border-none content-center items-center">
            {loading ? (
              <Loader2 className="animate-spin text-primary" />
            ) : (
              <>
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-xs flex flex-col items-center">
                    <Carousel className="w-full">
                      <div className="flex flex-row justify-between mt-4">
                        <span className="text-2xl font-semibold text-left">Previous Doctors</span>
                        <div className="flex justify-end gap-2 mb-4">
                          <CarouselPrevious
                            className="relative translate-y-0 translate-x-0 left-0 top-0"
                          />
                          <CarouselNext
                            className="relative translate-y-0 translate-x-0 right-0 top-0"
                          />
                        </div>
                      </div>
                      <CarouselContent>
                        {previousDoctors.map((doctor) => (
                          <CarouselItem key={crypto.randomUUID()}>
                            <div className="flex flex-col aspect-square items-center justify-center bg-background">
                              <Avatar className="w-36 h-36 mb-4">
                                <AvatarImage src={doctor?.profileImage} alt={`${doctor?.firstNafirst_nameme} ${doctor?.first_name}'s profile image`} />
                                <AvatarFallback className="bg-muted text-4xl">
                                  {doctor?.first_name?.charAt(0)}{doctor?.last_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold">{doctor?.first_name} {doctor?.last_name}</h3>
                                <div className="flex justify-center space-x-4">
                                  <span className="text-sm text-gray-500">{doctor?.office_number}</span>
                                  <span className="text-sm text-gray-500">{doctor?.specialization}</span>
                                </div>
                                <span className="font-bold bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text mr-2">
                                  {doctor?.totalAppointments}
                                </span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export default PatientHome;