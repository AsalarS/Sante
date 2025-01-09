import React from "react";
import { Maximize2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function CompactPrescriptionList({
    emptyText = "No prescriptions",
    prescriptions = [],
    onClickIcon,
}) {
    return (
        <div className="p-4 bg-background rounded-lg shadow-md">
            {/* Maximize Icon */}
            <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">Prescriptions</h3>
                <span
                    onClick={onClickIcon}
                    className="cursor-pointer text-foreground hover:bg-darker-background p-2 rounded-md"
                >
                    <Maximize2 size={18} />
                </span>
            </div>

            {/* Scrollable Prescriptions List */}
            <div className="overflow-y-auto max-h-40 pr-2 -mr-2">
                {prescriptions.length > 0 ? (
                    <div className="space-y-2">
                        {prescriptions.map((prescription) => (
                            <Tooltip key={prescription.id}>
                                <TooltipTrigger asChild>
                                    <div className="group hover:bg-muted rounded-md p-2 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium text-foreground">
                                                    {prescription.medication_name}
                                                </span>
                                                <div className="text-sm text-muted-foreground">
                                                    {prescription.dosage} • {prescription.duration} days
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                {prescription.special_instructions && (
                                    <TooltipContent side="right" className="max-w-sm">
                                        <p className="font-medium">Special Instructions:</p>
                                        <p className="text-sm">{prescription.special_instructions}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground">{emptyText}</div>
                )}
            </div>
        </div>
    );
}

export default CompactPrescriptionList;