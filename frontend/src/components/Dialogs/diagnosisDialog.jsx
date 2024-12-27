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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api";
import { toast } from "sonner";

export function DiagnosisDialog({
  dialogOpen,
  setDialogOpen,
  appointmentId,
  diagnosisData: initialDiagnosisData,
}) {
  const [diagnosisData, setDiagnosisData] = useState(initialDiagnosisData || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDiagnosisData(initialDiagnosisData || {});
  }, [initialDiagnosisData]);

  const handleChange = (field, value) => {
    setDiagnosisData((prev) => ({ ...prev, [field]: value }));
  };

//   TODO: make this work
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/api/appointment/${appointmentId}/diagnosis/`, diagnosisData);
      if (response.status === 200) {
        toast.success("Diagnosis updated successfully");
        setDialogOpen(false);
      } else {
        toast.error("Failed to update diagnosis");
      }
    } catch (error) {
      console.error("Failed to update diagnosis:", error);
      toast.error("An error occurred while updating the diagnosis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <div className="content-center mb-4 font-bold flex flex-row items-center">
            <DialogTitle>Diagnosis</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          <Label className="mb-2">Name</Label>
          <Input
            type="text"
            value={diagnosisData.diagnosis_name || ""}
            onChange={(e) => handleChange("diagnosis_name", e.target.value)}
          />

          <Label className="mt-6 mb-2">Type</Label>
          <Select
            value={diagnosisData.diagnosis_type || ""}
            onValueChange={(value) => handleChange("diagnosis_type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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