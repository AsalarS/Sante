import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import { Input } from "@/components/ui/input";
import Scheduler from "@/components/schduler"; // Assuming Scheduler is in this path

export function ReceptionistAppointment() {
    return (
        <>
            <div className="flex flex-col p-4 gap-6 max-w-full">
                <div className="bg-background rounded-md w-full h-16 flex justify-between items-center p-4">
                    <div className="flex justify-between">
                        <Input placeholder="Search patients" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <DatePicker className="h-12"/>
                        <Button className="mt-1">Today</Button>
                    </div>
                </div>

                {/* Apply overflow-x-auto here to make the table scrollable */}
                <div className="overflow-x-auto max-w-full">
                    <Scheduler />
                </div>
            </div>
        </>
    );
}
