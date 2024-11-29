import CompactListBox from "@/components/compactListBox";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Heart, CircleGauge, Thermometer, Activity, Wind, PenLine, Plus, CornerDownRight, Ellipsis } from "lucide-react";
import { Card } from "./ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "./ui/badge";

function PatientInformation() {
    return (
        <div className="bg-even-darker-background flex flex-col sm:flex-row p-6 gap-4 h-lvh ">
            {/* Left Section (Main Content) */}
            <div className="flex flex-col space-y-4 flex-grow sm:w-3/4 overflow-y-auto">
                {/* <div className="bg-background p-4 rounded-lg flex items-center space-x-4">
                    <Avatar className="size-12">
                        <AvatarImage src="link" alt="Profile Image" />
                        <AvatarFallback className="bg-muted text-foreground">PA</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-semibold text-foreground">John Doe</h2>
                </div> */}
                <Card className="bg-background p-4 rounded-lg inline-block border-none">
                    <div className="flex flex-row justify-between mb-2">
                        <span className="text-lg font-semibold mb-2 ml-1">Vitals</span>
                        <Button className="size-8" variant={"secondary"}><PenLine size={20} /></Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Heart Rate */}
                        <div className="bg-red-300 dark:bg-red-300/20 text-white rounded-md  p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <Heart className="text-white bg-red-500 rounded-full p-2 w-10 h-10" />
                                <h3 className="font-semibold">Heart Rate</h3>
                            </div>
                            <h1 className="text-4xl font-bold flex flex-col items-center">90 <span className="text-white/40 text-lg">BPM</span></h1>
                        </div>

                        {/* Blood Pressure */}
                        <div className="bg-blue-300 dark:bg-blue-300/20 text-white rounded-md p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <CircleGauge className="text-white bg-blue-500 rounded-full p-2 w-10 h-10" />
                                <h3 className="font-semibold">Blood Pressure</h3>
                            </div>
                            <h1 className="text-3xl font-bold flex flex-col items-center ">120/80<span className="text-white/40 text-lg">mmHg</span></h1>
                        </div>

                        {/* Temperature */}
                        <div className="bg-green-300 dark:bg-green-300/20 text-white rounded-md p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <Thermometer className="text-white bg-green-500 rounded-full p-2 w-10 h-10" />
                                <h3 className="font-semibold">Temperature</h3>
                            </div>
                            <h1 className="text-4xl font-bold flex flex-col items-center">36.8°<span className="text-white/40 text-lg">Celsius</span></h1>
                        </div>

                        {/* Oxygen Saturation */}
                        <div className="bg-yellow-400/60 dark:bg-yellow-300/20 text-white rounded-md p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <Wind className="text-white bg-yellow-500 rounded-full p-2 w-10 h-10" />
                                <h3 className="font-semibold line-clamp-2 break-words">O₂ Saturation</h3>
                            </div>
                            <h1 className="text-4xl font-bold flex flex-col items-center">98%<span className="text-white/40 text-lg">Percent</span></h1>
                        </div>
                        {/* Respiratory Rate */}
                        <div className="bg-purple-300 dark:bg-purple-300/20 text-white rounded-md p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <Activity className="text-white bg-purple-500 rounded-full p-2 w-10 h-10" />
                                <h3 className="font-semibold line-clamp-2 break-words">Respiratory Rate</h3>
                            </div>
                            <h1 className="text-3xl font-bold flex flex-col items-center">16 <span className="text-white/40 text-lg">BPM</span></h1>
                        </div>
                    </div>
                </Card>
                {/* Diagnoses */}
                <Card className="bg-background p-4 rounded-lg shrink flex flex-col border-none">
                    <div className="flex flex-row justify-between mb-2">
                        <span className="text-lg font-semibold mb-2 ml-1">Diagnoses</span>
                        <Button className="size-8" variant={"secondary"}><Plus size={20} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-32">
                        {Array.from({ length: 0 }, (_, index) => (
                            <div key={index} className="bg-background-hover rounded-md p-4 flex flex-row justify-between w-">
                                <div className="self-center">
                                    <div className="flex flex-row mb-1 self-center">
                                        <span className="font-semibold line-clamp-1 break-all">Mild</span>
                                        {/* Primary or secondary diagnosis */}
                                        <Badge className="text-white ml-4">Primary</Badge>
                                    </div>
                                </div>
                                <Button variant={"ghost"} className="self-center bg-neutral-200 dark:bg-neutral-600 dark:hover:dark:bg-neutral-500/70 w-10 h-10"><Ellipsis /></Button>
                            </div>
                        ))}
                    </div>
                </Card>
                {/* Care Plan */}
                <Card className="bg-background p-4 rounded-lg shrink flex flex-col border-none">
                    <div className="flex flex-row justify-between mb-2">
                        <span className="text-lg font-semibold mb-2 ml-1">Care Plan</span>
                        <Button className="size-8" variant={"secondary"}><Plus size={20} /></Button>
                    </div>
                    {/* List of plans */}
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-60">
                        {Array.from({ length: 0 }, (_, index) => (
                            <div key={index} className="w-full bg-background-hover rounded-md p-4 flex flex-row justify-between mb-2">
                                <div className="self-center">
                                    <div className="flex flex-row mb-1">
                                        <span className="font-semibold line-clamp-1 break-all">Consult Radiology {index + 1}</span>
                                        {/* Type of consult */}
                                        <Badge className="text-white ml-4">Consult</Badge>
                                    </div>
                                    <div className="flex flex-row">
                                        <CornerDownRight className="" size={16} />
                                        <span className="text-sm ml-2 line-clamp-1 break-all">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sit amet consequat est, in venenatis nunc.</span>
                                    </div>
                                </div>
                                <Button variant={"ghost"} className="self-center bg-neutral-200 dark:bg-neutral-600 dark:hover:dark:bg-neutral-500/70 w-10 h-10">
                                    <Ellipsis />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
                {/* Observations */}
                <Card className="bg-background p-4 rounded-lg flex flex-col border-none grow">
                    <span className="text-lg font-semibold mb-2 ml-1 text-foreground">Notes</span>
                    <Textarea placeholder="Enter details..." className="w-full flex-grow bg-muted dark:bg-border resize-none text-foreground" />
                </Card>
                {/* <div className="flex space-x-2">
                    <Button className="px-4 py-2 rounded-md">Show Lab Results</Button>
                    <Button className="px-4 py-2 rounded-md">Add Care Plan</Button>
                    <Button className="px-4 py-2 rounded-md">Generate Document</Button>
                </div> */}
            </div>

            {/* Right Section (Sidebar) */}
            <div className="flex flex-col space-y-4 min-w-2/12 overflow-y-auto">
                {/* <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={true}
                        title="General Stats"
                        data={["℃ 37", "92%", "80/70", "9 g/dL", "℃ 37", "92%", "80/70", "9 g/dL", "℃ 37", "92%", "80/70", "9 g/dL"]}
                        onClickIcon={() => console.log("General Stats icon clicked")}
                        onClickSelf={() => console.log("General Stats clicked")}
                        className="flex-grow"
                    />
                </div> */}
                {/* Patient Card */}
                <div className="max-w-64">
                    <div className="p-4 bg-background rounded-lg shadow-md cursor-pointer">
                        <div className="flex items-center space-x-2 mb-3">
                            <Avatar className="size-12 mr-2">
                                <AvatarImage src="link" alt="Profile Image" />
                                <AvatarFallback className="bg-muted text-foreground">PA</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-foreground line-clamp-1 break-all">John Doe</h3>
                        </div>
                        <div className="flex justify-center">
                            <div className="flex h-5 items-center space-x-4 text-sm text-foreground font-bold">
                                <div>23y</div>
                                <Separator orientation="vertical" />
                                <div>Male</div>
                                <Separator orientation="vertical" />
                                <div>O+</div>
                            </div>
                        </div>
                        <Button className="w-full mt-6 text-white">View Profile</Button>
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
                <div className="max-w-64">
                    <CompactListBox
                        displayAsBadges={false}
                        title="Patient Information"
                        data={["F", "23y", "23y", "O+"]}
                        onClickIcon={() => console.log("Patient Information icon clicked")}
                        onClickSelf={() => console.log("Patient Information clicked")}
                        className="flex-grow"
                    />
                </div>
            </div>
        </div>
    );
}

export default PatientInformation;
