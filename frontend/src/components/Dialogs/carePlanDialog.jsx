import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";

export function CarePlanDialog({
  dialogOpen,
  setDialogOpen,
  carePlanData,
  onSave,
  editable,
  isLoading,
}) {
  const [carePlan, setCarePlan] = useState(carePlanData || { care_plan_title: "", care_plan_type: "", additional_instructions: "" });

  useEffect(() => {
    setCarePlan(carePlanData || { care_plan_title: "", care_plan_type: "", additional_instructions: "" });
  }, [carePlanData]);

  const handleChange = (field, value) => {
    setCarePlan((prev) => ({ ...prev, [field]: value }));
  };

  // Simple validation: Make sure required fields are filled before saving
  const isValid = carePlan.care_plan_title && carePlan.care_plan_type;

  const handleSave = () => {
    if (isValid) {
      onSave(carePlan); // Pass the updated care plan back to the parent
      setDialogOpen(false); // Close the dialog
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <div className="content-center mb-4 font-bold flex flex-row items-center">
            <DialogTitle>Care Plan</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          <Label className="mb-2">Care Plan Title</Label>
          <Input
            type="text"
            value={carePlan.care_plan_title || ""}
            onChange={(e) => handleChange("care_plan_title", e.target.value)}
            readOnly={!editable}
          />

          <Label className="mt-6 mb-2">Care Plan Type</Label>
          <Select
            value={carePlan.care_plan_type || ""}
            onValueChange={(value) => handleChange("care_plan_type", value)}
            disabled={!editable}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select care plan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="Long-term">Long-term</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Label className="mt-6 mb-2">Additional Instructions</Label>
          <Textarea
            className="resize-none text-sm"
            value={carePlan.additional_instructions || ""}
            onChange={(e) => handleChange("additional_instructions", e.target.value)}
            readOnly={!editable}
          />
        </div>

        {carePlan.date_of_completion && <div className="flex flex-row gap-4 text-foreground/50 items-center mx-auto">
          <span className="text-foreground/80 text-sm font-semibold">Completed By :</span>
            <span>{carePlan?.done_by}</span>
            -
            <span>{carePlan?.date_of_completion}</span>
          </div> 
        }

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSave} disabled={!isValid || isLoading}>
            {isLoading ? <Loader2 className="text-white animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}