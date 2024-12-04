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
import { chartData, chartConfig, patientDummyData, BarChartConfig, BarChartData } from '@/pages/Dashboards/Doctor/dashboardData'
import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";
import Scheduler from "@/components/schduler";

function ReceptionistHome() {
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
    Scheduled: "bg-primary/20 text-primary font-semibold",
    Completed: "bg-green-400/20 text-green-400 font-semibold",
    Canceled: "bg-red-400/20 text-red-400 font-semibold",
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
      <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 h-dvh">
        {/* Row 1 - Stat Boxes */}
        <div className="col-span-12 lg:col-span-6 ">
          {/*  Scheduler */}
          <Card className="p-4 bg-background rounded-lg mb-6 text-foreground border-none">

            </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2 flex flex-col">
          <div>
          <div className="grid grid-cols-2 grid-rows-2 gap-6">
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
          </div>
          <div className="bg-background rounded-lg flex-grow text-foreground mb-6 border-none h-96 overflow-y-auto mt-6">
            <div className="text-lg font-semibold p-4 sticky top-0 bg-background w-full z-50 rounded-lg">
              Available Doctors
            </div>
            <div className="flex flex-col p-4 overflow-y-auto">
              <ul className="flex flex-col">
                {Array.from({ length: 12 }, (_, index) => (
                  <li key={index} className="flex items-center p-4 border-b hover:bg-background-hover cursor-pointer border-border">
                    <ChatBubbleAvatar src="" className="w-12 h-12 mr-3 text-foreground bg-muted" fallback={index} />
                    <div>
                      <div className="font-semibold text-lg text-foreground line-clamp-1 break-all">Dr. Ali Alfardan</div>
                      <div className="text-sm text-muted-foreground line-clamp-1 break-all">Radiology</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default ReceptionistHome;
