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
import api from "@/api";
import { toast } from "sonner";

export function CarePlanDialog({
  dialogOpen,
  setDialogOpen,
  appointmentId,
  carePlanData: initialCarePlanData,
  editable = true,
}) {
  const [carePlanData, setCarePlanData] = useState(initialCarePlanData || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCarePlanData(initialCarePlanData || {});
  }, [initialCarePlanData]);

  const handleChange = (field, value) => {
    setCarePlanData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/api/appointment/${appointmentId}/careplan/`, carePlanData);
      if (response.status === 200) {
        toast.success("Care Plan updated successfully");
        setDialogOpen(false);
      } else {
        toast.error("Failed to update Care Plan");
      }
    } catch (error) {
      console.error("Failed to update Care Plan:", error);
      toast.error("An error occurred while updating the Care Plan");
    } finally {
      setIsLoading(false);
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
            value={carePlanData.care_plan_title || ""}
            onChange={(e) => handleChange("care_plan_title", e.target.value)}
            readOnly={!editable}
          />

          <Label className="mt-6 mb-2">Care Plan Type</Label>
          <Select
            value={carePlanData.care_plan_type || ""}
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

          <Label className="mt-6 mb-2">Date of Issue</Label>
          <Input
            type="date"
            value={carePlanData.date_of_issue || ""}
            onChange={(e) => handleChange("date_of_issue", e.target.value)}
            readOnly={!editable}
          />

          <Label className="mt-6 mb-2">Date of Completion</Label>
          <Input
            type="date"
            value={carePlanData.date_of_completion || ""}
            onChange={(e) => handleChange("date_of_completion", e.target.value)}
            readOnly={!editable}
          />

          <Label className="mt-6 mb-2">Additional Instructions</Label>
          <Input
            type="text"
            value={carePlanData.additional_instructions || ""}
            onChange={(e) => handleChange("additional_instructions", e.target.value)}
            readOnly={!editable}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="text-white animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}