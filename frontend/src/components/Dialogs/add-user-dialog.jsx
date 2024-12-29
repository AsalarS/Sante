import React, { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PhoneInput from "../ui/phoneInput";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { SelectTagInput } from "../ui/select-input-tags";
import { Textarea } from "../ui/textarea";
import { InputTags } from "../ui/input-tags";
import { PasswordInput } from "../ui/password-input";

const availableDaysOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const AddUserDialog = ({ open, onClose, onSave }) => {
  const [userData, setUserData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "",
    phone_number: "",
    gender: "Other",
    date_of_birth: "",
    address: "",
  });

  const [employeeData, setEmployeeData] = useState({
    specialization: "",
    available_days: [],
    shift_start: "",
    shift_end: "",
    office_number: "",
  });

  const [patientData, setPatientData] = useState({
    medical_record_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_type: "",
    family_history: "",
    CPR_number: "",
    place_of_birth: "",
    religion: "",
    allergies: {},
    past_surgeries: {},
    chronic_conditions: {},
    patient_notes: "",
  });

  const handleChange = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const finalData = {
      ...userData,
      ...(userData.role != "patient" ? employeeData : {}),
      ...(userData.role === "patient" ? patientData : {}),
    };
    if (onSave) onSave(finalData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-foreground max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="employee" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="employee"
            // onClick={() =>
            //   setUserData((prev) => ({ ...prev, role: "employee" }))
            // }
            >
              Employee
            </TabsTrigger>
            <TabsTrigger
              value="patient"
              onClick={() =>
                setUserData((prev) => ({ ...prev, role: "patient" }))
              }
            >
              Patient
            </TabsTrigger>
          </TabsList>

          {/* Employee Form */}
          <TabsContent value="employee">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Common Fields */}
              <div>
                <Label>First Name</Label>
                <Input
                  value={userData.first_name}
                  onChange={(e) =>
                    handleChange(setUserData)("first_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userData.last_name}
                  onChange={(e) =>
                    handleChange(setUserData)("last_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={userData.email}
                  onChange={(e) =>
                    handleChange(setUserData)("email", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Password</Label>
                <PasswordInput
                  value={userData.password}
                  onChange={(e) =>
                    handleChange(setUserData)("password", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <PhoneInput
                  value={userData.phone_number}
                  onChange={(value) =>
                    handleChange(setUserData)("phone_number", value)
                  }
                />
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup
                  className="flex mt-2"
                  value={userData.gender}
                  onValueChange={(value) =>
                    handleChange(setUserData)("gender", value)
                  }
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
                  value={userData.date_of_birth}
                  onChange={(e) =>
                    handleChange(setUserData)("date_of_birth", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={userData.address}
                  onChange={(e) =>
                    handleChange(setUserData)("address", e.target.value)
                  }
                />
              </div>

              {/* Employee-Specific Fields */}
              <div>
                <Label>Specialization</Label>
                <Input
                  value={employeeData.specialization}
                  onChange={(e) =>
                    handleChange(setEmployeeData)(
                      "specialization",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label>Available Days</Label>
                <SelectTagInput
                  value={employeeData.available_days}
                  onChange={(value) =>
                    handleChange(setEmployeeData)("available_days", value)
                  }
                  options={availableDaysOptions}
                />
              </div>
              <div>
                <Label>Shift Start</Label>
                <Input
                  type="time"
                  value={employeeData.shift_start}
                  onChange={(e) =>
                    handleChange(setEmployeeData)("shift_start", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Shift End</Label>
                <Input
                  type="time"
                  value={employeeData.shift_end}
                  onChange={(e) =>
                    handleChange(setEmployeeData)("shift_end", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Office Number</Label>
                <Input
                  value={employeeData.office_number}
                  onChange={(e) =>
                    handleChange(setEmployeeData)(
                      "office_number",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  required
                  onChange={(e) => {
                    handleChange(setUserData)("role", e.target.value);
                  }}
                  className="p-2 border rounded-md bg-background w-full"
                >
                  <option value="">Select Role</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* Patient Form */}
          <TabsContent value="patient">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Common Fields */}
              <div>
                <Label>Email</Label>
                <Input
                  value={userData.email}
                  onChange={(e) =>
                    handleChange(setUserData)("email", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Password</Label>
                <PasswordInput
                  value={userData.password}
                  onChange={(e) =>
                    handleChange(setUserData)("password", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <PhoneInput
                  value={userData.phone_number}
                  onChange={(value) =>
                    handleChange(setUserData)("phone_number", value)
                  }
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input
                  value={userData.first_name}
                  onChange={(e) =>
                    handleChange(setUserData)("first_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userData.last_name}
                  onChange={(e) =>
                    handleChange(setUserData)("last_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup
                  className="flex mt-2"
                  value={userData.gender}
                  onValueChange={(value) =>
                    handleChange(setUserData)("gender", value)
                  }
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
                  value={userData.date_of_birth}
                  onChange={(e) =>
                    handleChange(setUserData)("date_of_birth", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={userData.address}
                  onChange={(e) =>
                    handleChange(setUserData)("address", e.target.value)
                  }
                />
              </div>
              {/* Patient Sepcific Fields */}
              <div>
                <Label>Medical Record ID</Label>
                <Input
                  value={patientData.medical_record_id}
                  onChange={(e) =>
                    handleChange(setPatientData)(
                      "medical_record_id",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <InputTags
                  value={patientData.allergies || []}
                  onChange={(value) =>
                    handleChange(setPatientData)("allergies", value)
                  }
                  useKeyAsValue={false}
                />
              </div>
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  value={patientData.emergency_contact_name}
                  onChange={(e) =>
                    handleChange(setPatientData)(
                      "emergency_contact_name",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <PhoneInput
                  value={patientData.emergency_contact_phone}
                  onChange={(value) =>
                    handleChange(setPatientData)(
                      "emergency_contact_phone",
                      value
                    )
                  }
                />
              </div>
              <div>
                <Label>Family History</Label>
                <Textarea
                  className="resize-none"
                  value={patientData.family_history}
                  onChange={(e) =>
                    handleChange(setPatientData)(
                      "family_history",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <InputTags
                  value={patientData.chronic_conditions || []}
                  onChange={(value) =>
                    handleChange(setPatientData)("chronic_conditions", value)
                  }
                  useKeyAsValue={false}
                />
              </div>
              <div>
                <Label>Patient Notes</Label>
                <Textarea
                  className="resize-none"
                  value={patientData.patient_notes}
                  onChange={(e) =>
                    handleChange(setPatientData)(
                      "patient_notes",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

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

export default AddUserDialog;
