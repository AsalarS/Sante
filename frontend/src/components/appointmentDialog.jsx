"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
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
import api from "@/api";

export function AppointmentDialog({ dialogOpen, setDialogOpen, appointment }) {
  const [patientSearch, setPatientSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearchListVisible, setIsSearchListVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search handler with API call
  const handleSearch = debounce(async (searchTerm) => {
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
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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
            <DialogTitle>{appointment ? "View" : "Add"} Appointment</DialogTitle>
            <Badge className="text-white ml-2">{appointment ? appointment.status : "New" }</Badge>
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
                value={patientSearch}
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
            <div className="absolute z-10 mt-1 w-full bg-red-50/50 border border-red-200/50 rounded-md shadow-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Custom Search List */}
          {!isLoading &&
            !error &&
            isSearchListVisible &&
            filteredPatients.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto text-foreground" ref={containerRef}>
                {filteredPatients.map((patient) => (
                  <li
                    key={patient.id}
                    className="px-4 py-2 hover:bg-background-hover cursor-pointer flex justify-between items-center"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div>
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm">{patient.email}</div>
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
        <Input placeholder="Doctor" className="mb-0" />
        <p className="text-sm text-muted text-right static">Room: 501</p>

        <div className="flex flex-row justify-around mt-0">
          <div>
            <Label>Date</Label>
            <Input type="date"/>
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time"/>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
