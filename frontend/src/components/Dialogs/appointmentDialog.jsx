"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import api from "@/api";
import { date } from "zod";
import { toast } from "sonner";

export function AppointmentDialog({
  dialogOpen,
  setDialogOpen,
  appointment,
  editable = true,
}) {
  const [dialogData, setDialogData] = useState(appointment || {});
  const isExistingAppointment = dialogData.status != "Available";

  const [patientSearch, setPatientSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState();
  // const [selectedDoctor, setSelectedDoctor] = useState(null);
  // const [appointmentDate, setAppointmentDate] = useState(
  //   appointment?.date || ""
  // );
  // const [appointmentTime, setAppointmentTime] = useState(
  //   appointment?.time ? convertTo24Hour(appointment?.time) : ""
  // );
  const [isSearchListVisible, setIsSearchListVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (appointment) {
      setDialogData({
        ...appointment,
        time: appointment.time ? convertTo24Hour(appointment.time) : "",
      });
      
      if (appointment.status !== "Available") {
        setSelectedPatient({
          id: appointment.patient_id || "",
          first_name: appointment.patient_first_name || "",
          last_name: appointment.patient_last_name || "",
          email: appointment.patient_email || "",
          CPR_number: appointment.patient_cpr || "",
        });
        setPatientSearch(`${appointment.patient_first_name} ${appointment.patient_last_name}`);
      }
    } else {
      setDialogData({});
    }
  }, [appointment]);

  
  // Clear Data when opening the dialog
  useEffect(() => { 
    if (!dialogOpen) {
      setDialogData({});
      setPatientSearch("");
      setSelectedPatient();
    }
  }, [!dialogOpen]);


  const handleChange = (field, value) => {
    setDialogData((prev) => ({ ...prev, [field]: value }));
  };

  //Handle save appointment
  const handleSave = async () => {
    // Validate required fields
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (!dialogData.doctorId) {
      toast.error("Please select a doctor");
      return;
    }

    if (!dialogData.date) {
      toast.error("Please select an appointment date");
      return;
    }

    if (!dialogData.time) {
      toast.error("Please select an appointment time");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare appointment data
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: dialogData.doctorId,
        appointment_date: dialogData.date,
        appointment_time: dialogData.time,
        status: dialogData.status,
        appointment_id: dialogData.app_id,
      };

      console.log("payload", dialogData);
      
      // Send PATCH request to create appointment
      const response = await api.patch("/api/appointments/add/", payload);

      if (response.status === 200) {
        // Close the dialog on successful creation
        setDialogOpen(false);
        toast.success("Appointment updated  successfully ", response.data);
      } else {
        // Handle unsuccessful response
        toast.error(response.data.message || "Failed to create appointment");
      }
    } catch (err) {
      console.error("Appointment creation error:", err);
      toast.error(
        err.response?.data?.message ||
        "An error occurred while creating the appointment"
      );
    } finally {
      setIsLoading(false);
    }
    setDialogOpen(false);
  };

  // Debounced search handler with API call
  const handleSearch = debounce(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPatients([]);
      setIsSearchListVisible(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.get("/api/search/patients/", {
        params: { query: searchTerm },
      });

      if (response.data.success) {
        const patients = response.data.patients;
        setFilteredPatients(patients);
        setIsSearchListVisible(patients.length > 0);
      } else {
        setError("Failed to fetch patients");
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error("Patient search error:", err);
      setError("An error occurred while searching for patients");
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Trigger search when patientSearch changes
  useEffect(() => {
    if (patientSearch) {
      handleSearch(patientSearch);
    } else {
      setFilteredPatients([]);
      setIsSearchListVisible(false);
    }
    return () => handleSearch.cancel();
  }, [patientSearch]);

  // Hide the patient list when clicking outside the input
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the container
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsSearchListVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Select patient handler
  const handlePatientSelect = (patient) => {
    // Set the selected patient
    setSelectedPatient(patient);
    // Auto-fill the input with the patient's full name
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    // Hide the search list
    setIsSearchListVisible(false);
  };

  // Clear selected patient
  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientSearch("");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <div className="content-center mb-4 font-bold flex flex-row items-center">
            <DialogTitle>
              {isExistingAppointment ? "Edit Appointment" : "Add Appointment"}
            </DialogTitle>
            {/* TODO: Change logic vvvvvvv */}
            <Badge className="text-white ml-2">
              {dialogData?.status ? dialogData?.status : "New"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Patient Search */}
        <Label>Patient</Label>
        <div className="relative">
          <div className="flex items-center">
            <div className="relative w-full">
              <Input
                ref={inputRef}
                placeholder="Search patients"
                value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onFocus={() => patientSearch && setIsSearchListVisible(true)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {selectedPatient ? (
                  <X
                    className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={handleClearPatient}
                  />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {isLoading && (
            <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg p-4 text-center">
              Loading patients...
            </div>
          )}

          {error && (
            <div className="absolute z-10 mt-1 w-full bg-red-50 border border-red-200 rounded-md shadow-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Custom Search List */}
          {!isLoading &&
            !error &&
            !selectedPatient &&
            isSearchListVisible &&
            filteredPatients.length > 0 && (
              <ul
                className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto text-foreground"
                ref={containerRef}
              >
                {filteredPatients.map((patient) => (
                  <li
                    key={patient.id}
                    className="px-4 py-2 hover:bg-background-hover cursor-pointer flex justify-between items-center"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div>
                      <div className="font-bold">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-foreground/50">
                        {patient.email}{" "}
                        {patient.CPR_number ? "- " + patient.CPR_number : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          {/* No Results State */}
          {!isLoading &&
            !error &&
            isSearchListVisible &&
            filteredPatients.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-backgrounnd border border-borderrounded-md shadow-lg p-4 text-center text-foreground">
                No patients found
              </div>
            )}
        </div>

        {/* Rest of the form remains the same */}
        <Label>Doctor</Label>
        <Input
          placeholder="Doctor"
          className="mb-0"
          value={dialogData.doctorName || ""}
          onChange={(e) =>
            editable && handleChange("doctorName", e.target.value)
          }
          readOnly={!editable}
        />
        <p className="text-sm text-muted text-right static">
          {dialogData?.office || ""}
        </p>

        <div className="flex flex-row justify-around mt-0">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={dialogData.date || ""}
              onChange={(e) => editable && handleChange("date", e.target.value)}
              readOnly={!editable}
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={dialogData.time || ""}
              onChange={(e) => editable && handleChange("time", e.target.value)}
              readOnly={!editable}
            />
          </div>
        </div>

        {dialogData.status != "Available" &&
          <RadioGroup 
            value={dialogData.status || ""} 
            className="flex flex-row justify-between px-2 mt-6"
            onValueChange={(value) => {
              handleChange("status", value)
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Scheduled" id="Scheduled" />
              <Label htmlFor="Scheduled">Scheduled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Completed" id="Completed" />
              <Label htmlFor="Completed">Completed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cancelled" id="Cancelled" />
              <Label htmlFor="r3">Cancelled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No Show" id="noshow" />
              <Label htmlFor="noshow">No Show</Label>
            </div>
          </RadioGroup>
        }

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSave}>
            {isLoading ? <Loader2 className="text-white animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function convertTo24Hour(time) {
  // Check if time is already in 24-hour format
  if (time.includes(":") && !time.includes(" ")) {
    return time;
  }

  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12; // Convert PM hours (except 12 PM)
  } else if (modifier === "AM" && hours === 12) {
    hours = 0; // Convert 12 AM to 00
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}
