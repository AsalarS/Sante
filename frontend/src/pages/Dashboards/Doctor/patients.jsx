import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import api from "@/api";
import PatientList from "@/components/patientList";
import PatientProfile from "./patientProfile";

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { patientId } = useParams();
  const userRole = localStorage.getItem('role');
  const navigate = useNavigate();
  const refreshRef = useRef(null);

  const handlePatientSelect = (patientId) => {
    navigate(`/${userRole}/patients/${patientId}`);
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/users/patients/');
      if (response.status === 200) {
        const users = response.data;
        setPatients(users);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patientId && (patientId === "undefined" || isNaN(patientId))) {
      if (window.history.length > 1) {
        // Go back to the previous page
        navigate(-1);
      } else {
        // If there's no history, navigate to the /patients page
        navigate(`/${userRole}/patients`);
      }
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex overflow-y-auto">
      <PatientList
        patients={patients}
        selectedPatientId={patientId ? parseInt(patientId) : null}
        handlePatientSelect={handlePatientSelect}
        fetchPatients={fetchPatients}
      />
      <div className="grow">
        {patientId ? (
          <PatientProfile patientId={parseInt(patientId)} />
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground text-xl">
            Select a patient to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientsPage;