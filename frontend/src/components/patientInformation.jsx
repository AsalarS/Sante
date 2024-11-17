import CompactListBox from "@/components/compactListBox";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

function PatientInformation() {
    return (
        <div className="bg-dash-hover h-screen flex flex-col sm:flex-row p-6 gap-4">
            {/* Left Section (Main Content) */}
            <div className="flex flex-col space-y-4 flex-grow sm:w-3/4">
                {/* <div className="bg-background p-4 rounded-lg flex items-center space-x-4">
                    <Avatar className="size-12">
                        <AvatarImage src="link" alt="Profile Image" />
                        <AvatarFallback className="bg-muted text-foreground">PA</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-semibold text-foreground">John Doe</h2>
                </div> */}
                <div className="bg-background p-4 rounded-lg flex-grow flex flex-col">
                    <h3 className="font-medium text-foreground mb-2">Complaints</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 flex-grow bg-border resize-none text-foreground" />
                </div>
                <div className="bg-background p-4 rounded-lg flex-grow flex flex-col">
                    <h3 className="font-medium text-foreground mb-2">Observations</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 flex-grow bg-border resize-none text-foreground" />
                </div>
                <div className="bg-background p-4 rounded-lg flex-grow flex flex-col">
                    <h3 className="font-medium text-foreground">Assesment</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 flex-grow bg-border resize-none text-foreground" />
                </div>
                <div className="bg-background p-4 rounded-lg flex-grow flex flex-col">
                    <h3 className="font-medium text-foreground mb-2">Care Plan</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 flex-grow bg-border resize-none text-foreground" />
                </div>
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
