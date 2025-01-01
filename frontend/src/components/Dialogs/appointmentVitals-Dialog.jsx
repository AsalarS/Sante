import React, { useState, useEffect } from "react";
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
import api from "@/api";
import { toast } from "sonner";
import NumberField from "../ui/number-input";

export function AppointmentVitalsDialog({
  dialogOpen,
  setDialogOpen,
  appointmentId,
  vitalsData: initialVitalsData,
}) {
  const [vitalsData, setVitalsData] = useState(initialVitalsData || {});
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVitalsData(initialVitalsData || {});
    if (initialVitalsData?.blood_pressure) {
      const [sys, dia] = initialVitalsData.blood_pressure.split('/');
      setSystolic(parseInt(sys, 10));
      setDiastolic(parseInt(dia, 10));
    }
  }, [initialVitalsData]);

  const handleChange = (field, value) => {
    setVitalsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedVitalsData = {
        ...vitalsData,
        blood_pressure: `${systolic}/${diastolic}`,
      };

      const response = await api.patch(`/api/appointments/${appointmentId}/`, updatedVitalsData);
      if (response.status >= 200 && response.status < 300) {
        toast.success("Vitals updated successfully");
        setDialogOpen(false);
      } else {
        toast.error("Failed to update vitals");
      }
    } catch (error) {
      console.error("Failed to update vitals:", error);
      toast.error("An error occurred while updating the vitals");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <div className="content-center mb-4 font-bold flex flex-row items-center">
            <DialogTitle>Appointment Vitals</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          <Label className="mb-2">Heart Rate</Label>
          <NumberField
            value={vitalsData.heart_rate || 0}
            onChange={(value) => handleChange("heart_rate", value)}
            min={0}
            max={300}
            step={10}
            allowNegative={false}
            prefix=""
            suffix=" BPM"
          />

          <Label className="mt-6 mb-2">Blood Pressure</Label>
          <div className="flex flex-row gap-4">
            <NumberField
              value={systolic}
              onChange={(value) => setSystolic(value)}
              min={0}
              max={300}
              step={1}
              allowNegative={false}
              prefix=""
              suffix=" mmHg"
            />
            <span className="text-3xl select-none">/</span>
            <NumberField
              value={diastolic}
              onChange={(value) => setDiastolic(value)}
              min={0}
              max={300}
              step={1}
              allowNegative={false}
              prefix=""
              suffix=" mmHg"
            />
          </div>

          <Label className="mt-6 mb-2">Temperature</Label>
          <NumberField
            value={vitalsData.temperature || 0}
            onChange={(value) => handleChange("temperature", value)}
            min={0}
            max={300}
            step={1}
            allowNegative={true}
            prefix=""
            suffix=" °C"
          />

        <Label className="mt-6 mb-2">O₂ Saturation</Label>
          <NumberField
            value={vitalsData.o2_sat || 0}
            onChange={(value) => handleChange("o2_sat", value)}
            min={0}
            max={100}
            step={1}
            allowNegative={false}
            prefix=""
            suffix="%"
          />

          <Label className="mt-6 mb-2">Respiratory Rate</Label>
          <NumberField
            value={vitalsData.resp_rate || 0}
            onChange={(value) => handleChange("resp_rate", value)}
            min={0}
            max={100}
            step={1}
            allowNegative={false}
            prefix=""
            suffix=" BPM"
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