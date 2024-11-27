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
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts";
import { chartData, chartConfig, patientDummyData, BarChartConfig, BarChartData } from './dashboardData'

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

  const [activeChart, setActiveChart] = useState("desktop")

  const totalBar = useMemo(
    () => ({
      desktop: BarChartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: BarChartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  )

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
          <div className="flex flex-col">
            {/* Bar Chart */}
            <Card className="p-4 bg-background rounded-lg mb-6 text-foreground mt-6 border-none">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Bar Chart - Interactive</CardTitle>
                  <CardDescription>
                    Showing total visitors for the last 3 months
                  </CardDescription>
                </div>
                <div className="flex">
                  {["desktop", "mobile"].map((key) => {
                    const chart = key
                    return (
                      <button
                        key={chart}
                        data-active={activeChart === chart}
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                        onClick={() => setActiveChart(chart)}
                      >
                        <span className="text-xs text-muted-foreground">
                          {BarChartConfig[chart].label}
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                          {totalBar[key].toLocaleString()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={BarChartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={BarChartData}
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
                    <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Calendar */}
            <div className="p-4 bg-background rounded-lg mb-6 text-foreground h-fill">
              <div className="flex justify-between mb-4">
                <div className="flex justify-between">
                  <Input placeholder="Search patients" />
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
                    <TableRow className="border-border">
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
                      <TableRow key={patient.id} className="border-border">
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
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2 flex flex-col">
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

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Ali Alfardan</h3>
              <div className="flex justify-center space-x-4">
                <span className="text-sm text-gray-500">23y</span>
                <span className="text-sm text-gray-500">Male</span>
                <span className="text-sm text-gray-500">O+</span>
              </div>
              <Button className="text-sm text-gray-500" variant={"ghost"} >
                <span className="font-bold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">30:00</span>
                Until Appointment</Button>
            </div>
          </Card>
          <Card className="p-4 bg-background rounded-lg mb-6 text-foreground min-h-36 flex flex-col border-none">
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
                    data={chartData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={60}
                    strokeWidth={5}
                  >
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
                                {totalPie.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Appointments
                              </tspan>
                            </text>
                          )
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
          <Card className="p-4 bg-background rounded-lg flex-grow text-foreground mb-6 border-none">
            {loading ? (
              <Loader2 className="animate-spin text-foreground" />
            ) : (
              <></>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorHome;
