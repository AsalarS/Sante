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

export function DiagnosisDialog({
  dialogOpen,
  setDialogOpen,
  diagnosisData,
  onSave,
}) {
  const [diagnosis, setDiagnosis] = useState(diagnosisData || { diagnosis_name: "", diagnosis_type: "" });
  
  useEffect(() => {
    setDiagnosis(diagnosisData || { diagnosis_name: "", diagnosis_type: "" });
  }, [diagnosisData]);

  const handleChange = (field, value) => {
    setDiagnosis((prev) => ({ ...prev, [field]: value }));
  };

  // Simple validation: Make sure both fields are filled before saving
  const isValid = diagnosis.diagnosis_name && diagnosis.diagnosis_type;

  const handleSave = () => {
    if (isValid) {
      onSave(diagnosis); // Pass the updated diagnosis back to the parent
      setDialogOpen(false); // Close the dialog
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
            value={diagnosis.diagnosis_name || ""}
            onChange={(e) => handleChange("diagnosis_name", e.target.value)}
          />

          <Label className="mt-6 mb-2">Type</Label>
          <Select
            value={diagnosis.diagnosis_type || ""}
            onValueChange={(value) => handleChange("diagnosis_type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select diagnosis type" />
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
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!isValid}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
