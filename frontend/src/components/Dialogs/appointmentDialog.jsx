"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Search, X } from "lucide-react";
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
import { toast } from "sonner";

export function AppointmentDialog({
  dialogOpen,
  setDialogOpen,
  appointment,
  editable = true,
  onSaveSuccess,
}) {
  const [dialogData, setDialogData] = useState({});
  const [patientSearch, setPatientSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearchListVisible, setIsSearchListVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setDialogData({});
      setPatientSearch("");
      setSelectedPatient(null);
      setError(null);
    }
  }, [dialogOpen]);

  // Initialize form when appointment data changes
  useEffect(() => {
    if (appointment) {
      setDialogData({
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        office: appointment.office,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status || "Scheduled",
        app_id: appointment.app_id
      });

      // If this is an existing appointment, set up patient data
      if (appointment.patient_id) {
        setSelectedPatient({
          id: appointment.patient_id,
          first_name: appointment.patient_first_name,
          last_name: appointment.patient_last_name,
          email: appointment.patient_email,
          CPR_number: appointment.patient_cpr
        });
        setPatientSearch(`${appointment.patient_first_name} ${appointment.patient_last_name}`);
      } else {
        setSelectedPatient(null);
        setPatientSearch("");
      }
    }
  }, [appointment]);

  // Validation before save
  const validateForm = () => {
    const errors = [];

    if (!selectedPatient) {
      errors.push("Please select a patient");
    }
    if (!dialogData?.date) {
      errors.push("Please select a date");
    }
    if (!dialogData?.time) {
      errors.push("Please select a time");
    }

    return errors;
  };

  const handleChange = (field, value) => {
    setDialogData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        patient: selectedPatient.id,
        doctor: dialogData?.doctorId,
        appointment_date: dialogData?.date,
        appointment_time: dialogData?.time,
        status: dialogData?.status || "Scheduled"
      };
      
      const isNewAppointment = !dialogData?.app_id;
      let url = "/api/appointments/";
      let method = "post";

      if (!isNewAppointment) {
        // For updates, append the appointment ID to the URL
        url = `/api/appointments/${dialogData?.app_id}/`;
        method = "patch";
      }
      console.log(payload);
      
      const response = await api[method](url, payload);
      
      

      if (response.status === 200 || response.status === 201) {
        toast.success(`Appointment ${isNewAppointment ? 'created' : 'updated'} successfully`);
        setDialogOpen(false);
        // Optionally refresh the appointments list
        if (typeof onSaveSuccess === 'function') {
          onSaveSuccess();
        }
      }
    } catch (err) {
      console.error("Appointment save error:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to save appointment";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimized debounced search
  const handleSearch = useMemo(
    () =>
      debounce(async (searchTerm) => {
        if (!searchTerm.trim()) {
          setFilteredPatients([]);
          setIsSearchListVisible(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const response = await api.get("/api/search/patients/", {
            params: { query: searchTerm },
          });

          if (response.data.success) {
            setFilteredPatients(response.data.patients);
            setIsSearchListVisible(true);
          } else {
            throw new Error("Failed to fetch patients");
          }
        } catch (err) {
          setError(err.message || "Failed to search patients");
          setFilteredPatients([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

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
    setSelectedPatient(patient);
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setIsSearchListVisible(false);
    setDialogData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_first_name: patient.first_name,
      patient_last_name: patient.last_name,
      patient_email: patient.email,
      patient_cpr: patient.CPR_number
    }));
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientSearch("");
    setDialogData(prev => ({
      ...prev,
      patient_id: null,
      patient_first_name: null,
      patient_last_name: null,
      patient_email: null,
      patient_cpr: null
    }));
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="text-foreground max-w-2xl">
        <DialogHeader>
          <div className="content-center mb-4 font-bold flex flex-row items-center justify-between">
            <DialogTitle>
              {dialogData?.app_id ? "Edit Appointment" : "New Appointment"}
            </DialogTitle>
            {dialogData?.status && (
              <Badge variant={dialogData?.status === "Cancelled" ? "destructive" : "default"} className="text-white mr-4">
                {dialogData?.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Patient Search */}
        <div className="relative">
          <div className="flex items-center">
            <div className="relative w-full">
              <Input
                ref={inputRef}
                placeholder="Search patients"
                readOnly={dialogData?.app_id}
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setSelectedPatient(null);
                }}
                onFocus={() => setIsSearchListVisible(true)}
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
              <Loader2 className="text-primary animate-spin mx-auto" />
            </div>
          )}

          {error && (
            <div className="absolute z-10 mt-1 w-full bg-red-50 border border-red-200 rounded-md shadow-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Search Results */}
          {!isLoading &&
            !error &&
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
                        {patient.email}
                        {patient.CPR_number ? " - " + patient.CPR_number : ""}
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
            patientSearch &&
            filteredPatients.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg p-4 text-center text-foreground">
                No patients found
              </div>
            )}
        </div>

        {/* Rest of the form remains the same */}
        <Label>Doctor</Label>
        <Input
          placeholder="Doctor"
          className="mb-0"
          value={dialogData?.doctorName || ""}
          readOnly={true}
        />
        <p className="text-sm text-muted text-right static">
          {dialogData?.office || ""}
        </p>

        <div className="flex flex-row justify-around mt-0">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={dialogData?.date || ""}
              onChange={(e) => editable && handleChange("date", e.target.value)}
              readOnly={!editable}
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={dialogData?.time || ""}
              onChange={(e) => editable && handleChange("time", e.target.value)}
              readOnly={!editable}
            />
          </div>
        </div>
        {dialogData?.status &&
          <RadioGroup
            value={dialogData?.status || ""}
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
        <DialogFooter className="mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : dialogData?.app_id ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}