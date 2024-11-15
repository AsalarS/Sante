import CompactListBox from "@/components/compactListBox";
import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function PatientInformation() {
    const listData = [
        { title: "General Stats", data: ["℃ 37", "92%", "80/70", "9 g/dL"] },
        { title: "Allergies", data: ["Nuts", "Penicillin"] },
        { title: "Current Medications", data: ["Medicine A", "Medicine B"] },
        { title: "Surgeries", data: ["F", "23y", "O+"] },
        { title: "Patient Information", data: ["F", "23y", "O+"] },
    ];

    return (
        <div className="bg-[#E1E7FE] h-screen flex flex-col sm:flex-row p-6 gap-4">
            {/* Left Section (Main Content) */}
            <div className="flex flex-col space-y-4 flex-grow sm:w-3/4">
                <div className="bg-background p-4 rounded-lg flex items-center space-x-4">
                    <Avatar className="size-12">
                        <AvatarImage src="link" alt="Profile Image"/>
                        <AvatarFallback className="bg-muted">PA</AvatarFallback>
                    </Avatar>
                    <h2 className="text-lg font-semibold text-blue-600">John Doe</h2>
                </div>
                <div className="bg-[#D1D5DB] p-4 rounded-lg flex-grow">
                    <h3 className="font-medium text-gray-700 mb-2">Symptoms and Complaints</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 bg-gray-200" />
                </div>
                <div className="bg-[#D1D5DB] p-4 rounded-lg flex-grow">
                    <h3 className="font-medium text-gray-700 mb-2">Interview</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 bg-gray-200" />
                </div>
                <div className="bg-[#D1D5DB] p-4 rounded-lg flex-grow">
                    <h3 className="font-medium text-gray-700 mb-2">Examination</h3>
                    <Textarea placeholder="Enter details..." className="w-full h-32 bg-gray-200" />
                </div>
                <div className="flex space-x-2">
                    <Button className="px-4 py-2 rounded-md">Show Lab Results</Button>
                    <Button className="px-4 py-2 rounded-md">Add Care Plan</Button>
                    <Button className="px-4 py-2 rounded-md">Generate Document</Button>
                </div>
            </div>

            {/* Right Section (Sidebar) */}
            <div className="flex flex-col space-y-4 flex-grow sm:w-1/4">
                {listData.map((item, index) => (
                    <CompactListBox
                        displayAsBadges={true}
                        key={index}
                        title={item.title}
                        data={item.data}
                        onClickIcon={() => console.log(`${item.title} icon clicked`)}
                        onClickSelf={() => console.log(`${item.title} clicked`)}
                        className="flex-grow"
                    />
                ))}
            </div>
        </div>
    );
}

export default PatientInformation;
