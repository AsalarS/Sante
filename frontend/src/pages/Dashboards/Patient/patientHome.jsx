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
import { Label, Pie, PieChart } from "recharts";
import { chartData, chartConfig, patientDummyData } from '../Doctor/dashboardData'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function PatientHome() {
  const [loading, setLoading] = useState(false);

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
              <StatBox title="Total Appointments" number="34" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Appt. Done" number="10" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Medications" number="15" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Careplans" number="20" />
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
                  {dummyCarePlans.map((plan) => (
                    <TableRow key={plan.id} className="border-border">
                      <TableCell className="font-semibold text-lg text-left line-clamp-1 break-all">
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
                      <TableCell >
                        <div className={`px-2 py-1 text-sm text-center rounded-md ${{
                          Immediate: "bg-primary/20 text-primary",
                          "Long-term": "bg-chart-5/20 text-chart-5",
                        }[plan.care_plan_type]
                          }`}>
                          {plan.care_plan_type}
                        </div>
                      </TableCell>
                      <TableCell>{plan.date_of_completion}</TableCell>
                      <TableCell>{`${plan.done_by.first_name} ${plan.done_by.last_name}`}</TableCell>
                      <TableCell className="line-clamp-2 break-words">
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
                    {dummyPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id} className="border-border">
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
                  {dummyDiagnoses.map((diagnosis) => (
                    <TableRow key={diagnosis.id} className="border-border">
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
          <Card className="p-4 bg-background rounded-lg mb-6 text-foreground flex flex-col items-center justify-center border-none">
            <CardHeader className="text-2xl font-semibold text-foreground">
              Next Appointment
            </CardHeader>

            <div className="flex flex-col space-y-4 w-full">


              <div className="flex flex-row justify-between w-full">
                <div>
                  <h3 className="text-xl font-semibold">Dr. Ali Alfardan</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>36.133</span>
                    <span>•</span>
                    <span>Specialization</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 rounded-full">
                    <Clock size={12} className="text-primary" />
                    <span className="text-xs font-medium text-primary">Today</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-border items-center gap-4">
                <span className="text-sm text-muted-foreground">Until Appointment</span>
                <span className="text-2xl font-bold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  30:00
                </span>
              </div>
            </div>
          </Card>
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
          <Card className="px-4 bg-background rounded-lg flex-grow text-foreground border-none content-center items-center">
            {loading ? (
              <Loader2 className="animate-spin text-primary" />
            ) : (
              <>
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-xs flex flex-col items-center">
                    <Carousel className="w-full">
                      <div className="flex flex-row justify-between">
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
                        {Array.from({ length: 5 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="flex flex-col aspect-square items-center justify-center bg-background">
                              <Avatar className="w-36 h-36 mb-4">
                                <AvatarImage src="path-to-image.jpg" alt="Ali Alfardan's profile image" />
                                <AvatarFallback className="bg-muted text-4xl">
                                  AA
                                </AvatarFallback>
                              </Avatar>

                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold">Ali Alfardan</h3>
                                <div className="flex justify-center space-x-4">
                                  <span className="text-sm text-gray-500">36.133</span>
                                  <span className="text-sm text-gray-500">Specilzation</span>
                                </div>
                                <span className="font-bold bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text mr-2">3</span>
                                Total Appointments
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