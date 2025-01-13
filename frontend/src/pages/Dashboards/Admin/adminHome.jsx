import { useEffect, useMemo, useState } from "react";
import StatBox from "@/components/statBox";
import { Loader2 } from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/datePicker";
import { Input } from "@/components/ui/input";
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
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis } from "recharts";
import { chartData, chartConfig, patientDummyData, BarChartConfig, BarChartData } from '../Doctor/dashboardData'
import { toast } from "sonner";
import { calculateAge, formatTimeNoSeconds } from "@/utility/generalUtility";

function AdminHome() {
    const [stats, setStats] = useState({
        todays_appointments: 0,
        completed_appointments: 0,
        new_patients: 0,
        returning_patients: 0,
        avg_daily_appointments: 0
    });
    const [appointmentChartData, setAppointmentChartData] = useState([]);
    const [doctorPerformance, setDoctorPerformance] = useState([]);
    const [pastWeekAppointments, setPastWeekAppointments] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, chartRes, performanceRes, appointmentsRes, appointmentsPieRes] = await Promise.all([
                api.get("/api/dashboard/admin/stats/"),
                api.get("/api/dashboard/admin/appointments-chart/"),
                api.get("/api/dashboard/admin/doctor-performance/"),
                api.get("/api/dashboard/admin/past-week-appointments/"),
                api.get("/api/dashboard/admin./appointments-pie-chart/")
            ]);

            setStats(statsRes.data);
            setAppointmentChartData(chartRes.data);
            setDoctorPerformance(performanceRes.data);
            setPastWeekAppointments(appointmentsRes.data);
            setPieChartData(appointmentsPieRes.data);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Search handler for past week appointments
    const handleSearch = async () => {
        try {
            const response = await api.get(`/api/dashboard/admin/past-week-appointments/?search=${searchQuery}`);
            setPastWeekAppointments(response.data);
        } catch (error) {
            console.error("Error searching appointments:", error);
            toast.error("Failed to search appointments");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle search input changes with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery !== '') {
                handleSearch();
            } else {
                // If search is empty, fetch all appointments
                fetchDashboardData();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

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

    // Calculate total visitors
    const totalPie = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
    }, []);


    const handleGenerateReport = async () => {
        try {
            setReportLoading(true);
            const response = await api.get('/api/admin/system-report/')

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `system_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Report generated successfully');
        } catch (error) {
            // If the PDF downloaded successfully despite the error, don't show error message
            if (error.name === 'AxiosError' && error.code === 'ERR_NETWORK' && error.message === 'Network Error') {
                const contentType = error.request?.getResponseHeader('content-type');
                if (contentType?.includes('application/pdf')) {
                    return; // PDF downloaded successfully, ignore the error
                }
            } else {
                console.error('Error generating report:', error);
                toast.error('Error generating report. Please try again.');
            }
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <>
            <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 h-lvh">
                {/* Row 1 - Stat Boxes */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6">
                        <div className="col-span-12 md:col-span-6 lg:col-span-2">
                            <StatBox title="Today's Patients" number={stats.todays_appointments} />
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-2">
                            <StatBox title="Completed Appt." number={stats.completed_appointments} />
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-2">
                            <StatBox title="New Patients" number={stats.new_patients} />
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-2">
                            <StatBox title="Returning Patients" number={stats.returning_patients} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col">
                        {/* Bar Chart */}
                        <Card className="p-4 bg-background rounded-lg mb-6 text-foreground mt-6 border-none">
                            <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border p-0 sm:flex-row">
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
                                                    nameKey="Appointments"
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
                                        {console.log(pastWeekAppointments)}
                                        {pastWeekAppointments.map((patient) => (
                                            <TableRow key={patient?.id} className="border-border">
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
                    <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-6">
                        <div className="col-span-12 md:col-span-6 lg:col-span-2">
                            <StatBox title="Avg. Appt. Daily" number={stats.avg_daily_appointments} />
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-2 bg-background rounded-lg p-4 text-foreground">
                            <div className="flex flex-row items-center justify-between text-center">
                                <h1 className="text-lg font-semibold">Generate Report</h1>
                                <Button
                                    className="w-1/2"
                                    onClick={handleGenerateReport}
                                    disabled={reportLoading}
                                >
                                    {
                                        reportLoading ? <Loader2 className="animate-spin text-primary" /> : (
                                            "Generate"
                                        )
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                    {pieChartData && pieChartData.chart_data && (
                        <Card className="p-4 bg-background rounded-lg mb-6 text-foreground min-h-36 flex flex-col border-none">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Appointment Chart</CardTitle>
                                <CardDescription>
                                    {pieChartData?.period.start_date} - {pieChartData?.period.end_date}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={{
                                        type: "pie",
                                        data: pieChartData.chart_data,
                                        options: {}
                                    }}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={pieChartData.chart_data}
                                            dataKey="count"
                                            nameKey="appointments"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            {pieChartData.chart_data.map((entry, index) => (
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
                                                                    {pieChartData.total_appointments}
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
                    )}
                    <Card className="px-4 mb-6 bg-background rounded-lg flex-grow text-foreground border-none content-center items-center">
                        {loading ? (
                            <Loader2 className="animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-full max-w-xs flex flex-col items-center">
                                        <Carousel className="w-full">
                                            <div className="flex flex-row justify-between">
                                                <span className="text-2xl font-semibold text-left">Doctor Performance</span>
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
                                                {doctorPerformance.map((doctor, index) => (
                                                    <CarouselItem key={index}>
                                                        <div className="flex flex-col aspect-square items-center justify-center bg-background">
                                                            <ChartContainer
                                                                config={chartConfig}
                                                                className="mx-auto aspect-square max-h-[250px] min-h-[250px]"
                                                            >
                                                                <PieChart>
                                                                    <ChartTooltip
                                                                        cursor={false}
                                                                        content={<ChartTooltipContent hideLabel />}
                                                                    />
                                                                    <Pie
                                                                        data={doctor?.chart_data}
                                                                        dataKey="visitors"
                                                                        nameKey="browser"
                                                                        innerRadius={60}
                                                                        strokeWidth={5}
                                                                    >
                                                                        {doctor?.chart_data.map((entry, index) => (
                                                                            <Cell
                                                                                key={`cell-${index}`}
                                                                                fill={PieStatusColors[entry.browser]}
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
                                                                                                {doctor?.total_appointments}
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
                                                            <div className="text-center space-y-2">
                                                                <h3 className="text-xl font-semibold">{doctor?.doctor_name}</h3>
                                                                <div className="flex justify-center space-x-4">
                                                                    <span className="text-sm text-gray-500">{doctor?.office_number}</span>
                                                                    <span className="text-sm text-gray-500">{doctor?.specialization}</span>
                                                                </div>
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

export default AdminHome;
