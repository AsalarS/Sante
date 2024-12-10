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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectTagInput } from "./ui/select-input-tags";
import { Textarea } from "./ui/textarea";
import PhoneInput from "./ui/phoneInput";
import { InputTags } from "./ui/input-tags";

const availableDaysOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const UserDialog = ({ user, open, onClose, onSave, editable = true }) => {
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    setFormData(user || {});
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  const isEmployee = ["doctor", "nurse", "receptionist", "admin"].includes(
    formData.role
  );
  const isPatient = formData.role === "patient";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-foreground max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editable
              ? "Edit User Details"
              : `${formData.role || "User"} Details`}
          </DialogTitle>
        </DialogHeader>
        <div
          className={`grid gap-4 ${
            isPatient
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {/* Basic Details */}
          <div>
            <Label>Email</Label>
            <Input
              value={formData.email || ""}
              onChange={(e) =>
                editable && handleChange("email", e.target.value)
              }
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
          {isEmployee && (
            <div>
              <Label>Role</Label>
              {editable ? (
                <select
                  value={formData.role || ""}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="p-2 border rounded-md bg-background w-full"
                >
                  <option value="">Select Role</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              ) : (
                <Input value={formData.role || "-"} readOnly />
              )}
            </div>
          )}
          <div>
            <Label>Phone Number</Label>
            <PhoneInput
              value={formData.phone_number}
              onChange={(e) =>
                editable && handleChange("phone_number", e.target.value)
              }
              readOnly={!editable}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <RadioGroup
              value={formData.gender || "Other"}
              onValueChange={(value) => handleChange("gender", value)}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.date_of_birth || ""}
              onChange={(e) =>
                editable && handleChange("date_of_birth", e.target.value)
              }
              readOnly={!editable}
            />
          </div>
          <div className="">
            <Label>Address</Label>
            <Input
              value={formData.address || ""}
              onChange={(e) =>
                editable && handleChange("address", e.target.value)
              }
              readOnly={!editable}
            />
          </div>

          {/* Employee-Specific Details */}
          {isEmployee && (
            <>
              <div>
                <Label>Available Days</Label>
                <SelectTagInput
                  value={formData.available_days || []}
                  onChange={(value) =>
                    handleChange("available_days", value)
                  }
                  options={availableDaysOptions}
                  disabled={!editable}
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("specialization", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <Label>Shift Start</Label>
                  <Input
                    type="time"
                    value={formData.shift_start || ""}
                    onChange={(e) =>
                      editable &&
                      handleChange("shift_start", e.target.value)
                    }
                    readOnly={!editable}
                  />
                </div>
                <div className="w-1/2">
                  <Label>Shift End</Label>
                  <Input
                    type="time"
                    value={formData.shift_end || ""}
                    onChange={(e) =>
                      editable &&
                      handleChange("shift_end", e.target.value)
                    }
                    readOnly={!editable}
                  />
                </div>
              </div>
              <div>
                <Label>Office Number</Label>
                <Input
                  value={formData.office_number || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("office_number", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
            </>
          )}

          {/* Patient-Specific Details */}
          {isPatient && (
            <>
              <div>
                <Label>Place of Birth</Label>
                <Input
                  value={formData.place_of_birth || ""}
                  onChange={(e) =>
                    editable && handleChange("place_of_birth", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Medical Record ID</Label>
                <Input
                  value={formData.medical_record_id || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("medical_record_id", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <InputTags
                  value={formData.allergies || {}}
                  onChange={(newAllergies) =>
                    editable && handleChange("allergies", newAllergies)
                  }
                  useKeyasValue={false}
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("emergency_contact_name", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <PhoneInput
                  value={formData.emergency_contact_phone || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("emergency_contact_phone", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>CPR Number</Label>
                <Input
                  value={formData.CPR_number || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 9) {
                      editable && handleChange("CPR_number", value);
                    }
                  }}
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Religion</Label>
                <Input
                  value={formData.religion || ""}
                  onChange={(e) =>
                    editable && handleChange("religion", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Past Surgeries</Label>
                <InputTags
                  value={formData.past_surgeries || {}}
                  onChange={(value) =>
                    editable && handleChange("past_surgeries", value)
                  }
                  useKeyAsValue={false}
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <Input
                  value={formData.chronic_conditions || ""}
                  onChange={(e) =>
                    editable &&
                    handleChange("chronic_conditions", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Family History</Label>
                <Input
                  value={formData.family_history || ""}
                  onChange={(e) =>
                    editable && handleChange("family_history", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
              <div>
                <Label>Blood Type</Label>
                {editable ? (
                  <select
                    value={formData.blood_type || ""}
                    onChange={(e) => handleChange("blood_type", e.target.value)}
                    className="p-2 border rounded-md bg-background w-full"
                  >
                    <option value="">None</option>
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
                  <Input value={formData.blood_type || "-"} readOnly />
                )}
              </div>
              <div className="md:col-span-3">
                <Label>Patient Notes</Label>
                <Textarea
                  className="resize-none"
                  value={formData.patient_notes || ""}
                  onChange={(e) =>
                    editable && handleChange("patient_notes", e.target.value)
                  }
                  readOnly={!editable}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {editable && <Button onClick={handleSave}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
