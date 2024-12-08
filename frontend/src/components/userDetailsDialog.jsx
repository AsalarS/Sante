import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserDialog = ({ user, open, onClose, onSave, editable = true }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (field, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [subField]: value,
      },
    }));
  };

  const isPatient = formData.role === "patient";
  const isEmployee = ["doctor", "nurse", "receptionist", "admin"].includes(formData.role);

  const handleSave = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-foreground max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editable ? "Edit User Details" : `${formData.role || "User"} Details`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Details */}
          <div>
            <Label>Email</Label>
            <Input
              value={formData.email || ""}
              onChange={(e) => editable && handleChange("email", e.target.value)}
              readOnly={!editable}
            />
          </div>
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.first_name || ""}
              onChange={(e) =>
                editable && handleChange("first_name", e.target.value)
              }
              readOnly={!editable}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={formData.last_name || ""}
              onChange={(e) =>
                editable && handleChange("last_name", e.target.value)
              }
              readOnly={!editable}
            />
          </div>
          <div>
            <Label>Role</Label>
            {editable ? (
              <select
                value={formData.role || ""}
                onChange={(e) => handleChange("role", e.target.value)}
                className="p-2 border rounded-md bg-background w-full"
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            ) : (
              <Input value={formData.role || "-"} readOnly />
            )}
          </div>

          {/* Patient-Specific Details */}
          {isPatient && (
            <>
              <div>
                <Label>Medical Record ID</Label>
                <Input
                  value={formData.patient?.medical_record_id || ""}
                  onChange={(e) =>
                    editable &&
                    handleNestedChange("patient", "medical_record_id", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Emergency Contact</Label>
                <Input
                  value={`${formData.patient?.emergency_contact_name || "-"} (${formData.patient?.emergency_contact_phone || "-"})`}
                  readOnly
                />
              </div>
              <div>
                <Label>Blood Type</Label>
                {editable ? (
                  <select
                    value={formData.patient?.blood_type || ""}
                    onChange={(e) =>
                      handleNestedChange("patient", "blood_type", e.target.value)
                    }
                    className="p-2 border rounded-md bg-background w-full"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <Input value={formData.patient?.blood_type || "-"} readOnly />
                )}
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <Input
                  value={formData.patient?.chronic_conditions || ""}
                  onChange={(e) =>
                    editable &&
                    handleNestedChange("patient", "chronic_conditions", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
            </>
          )}

          {/* Employee-Specific Details */}
          {isEmployee && (
            <>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={formData.employee?.specialization || ""}
                  onChange={(e) =>
                    editable &&
                    handleNestedChange("employee", "specialization", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Shift</Label>
                <Input
                  value={`${formData.employee?.shift_start || "-"} - ${formData.employee?.shift_end || "-"}`}
                  readOnly
                />
              </div>
              <div>
                <Label>Office Number</Label>
                <Input
                  value={formData.employee?.office_number || ""}
                  onChange={(e) =>
                    editable &&
                    handleNestedChange("employee", "office_number", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Available Days</Label>
                <Input
                  value={formData.employee?.available_days?.join(", ") || ""}
                  onChange={(e) =>
                    editable &&
                    handleNestedChange("employee", "available_days", e.target.value.split(","))
                  }
                  readOnly={!editable}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {editable && (
            <Button onClick={handleSave}>
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
