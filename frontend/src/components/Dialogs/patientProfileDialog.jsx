import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhoneInput from "../ui/phoneInput";
import api from "@/api";
import { toast } from "sonner";

const PatientProfileDialog = ({ open, onClose, patientData, onSave }) => {
    const [formData, setFormData] = useState(patientData || {});

    useEffect(() => {
        setFormData(patientData || {});
    }, [patientData]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await api.patch(`/api/patient/${formData.id}/`, formData);
            if (response.status === 200) {
                toast.success("Patient data updated successfully");
                onSave(formData);
                onClose();
            } else {
                toast.error("Failed to update patient data");
            }
        } catch (error) {
            console.error("Failed to update patient data:", error);
            toast.error("An error occurred while updating the patient data");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="text-foreground">
                <DialogHeader>
                    <DialogTitle>Edit Patient Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <div>
                        <Label>First Name</Label>
                        <Input
                            value={formData.first_name || ""}
                            onChange={(e) => handleChange("first_name", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Last Name</Label>
                        <Input
                            value={formData.last_name || ""}
                            onChange={(e) => handleChange("last_name", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            value={formData.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                            readOnly
                        />
                    </div>
                    <div>
                        <Label>Phone Number</Label>
                        <PhoneInput
                            value={formData.phone_number || ""}
                            onChange={(value) => handleChange("phone_number", value)}
                        />
                    </div>
                    <div>
                        <Label>Date of Birth</Label>
                        <Input
                            type="date"
                            value={formData.date_of_birth || ""}
                            onChange={(e) => handleChange("date_of_birth", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Address</Label>
                        <Input
                            value={formData.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Blood Type</Label>
                        <Input
                            value={formData.blood_type || ""}
                            onChange={(e) => handleChange("blood_type", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>E.C. Name</Label>
                        <Input
                            value={formData.emergency_contact_name || ""}
                            onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>E.C. Phone</Label>
                        <PhoneInput
                            value={formData.emergency_contact_phone || ""}
                            onChange={(value) => handleChange("emergency_contact_phone", value)}
                        />
                    </div>
                    <div>
                        <Label>CPR Number</Label>
                        <Input
                            value={formData.CPR_number || ""}
                            readOnly
                        />
                    </div>
                    <div>
                        <Label>Place of Birth</Label>
                        <Input
                            value={formData.place_of_birth || ""}
                            onChange={(e) => handleChange("place_of_birth", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Religion</Label>
                        <Input
                            value={formData.religion || ""}
                            onChange={(e) => handleChange("religion", e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Label>Family History</Label>
                        <Textarea
                            className="resize-none"
                            value={formData.family_history || ""}
                            onChange={(e) => handleChange("family_history", e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PatientProfileDialog;