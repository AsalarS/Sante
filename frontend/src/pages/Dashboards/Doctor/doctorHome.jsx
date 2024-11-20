import { useEffect, useState } from "react";
import StatBox from "@/components/statBox";
import { Loader2 } from "lucide-react";
import api from "@/api";

function DoctorHome() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/api/users/patients/");
      if (response.status === 200) {
        setPatients(response.data);
        console.log(response.data)
      } else {
        console.error("Failed to fetch patient data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <>
      <div className="p-6 grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6 bg-even-darker-background h-full">
        {/* Row 1 - Stat Boxes */}
        <div className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-8 gap-6">
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Todays Patients" number="34" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Appt. Done" number="10" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="New Patients" number="15" />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2">
              <StatBox title="Returning Patients" number="20" />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground mt-6">
            Main Content
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-2">
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground min-h-36">
            Smaller Box
          </div>
          <div className="p-4 bg-background rounded-lg shadow-md mb-6 text-foreground min-h-36">
            Smaller Box
          </div>
          <div className="p-4 bg-background rounded-lg shadow-md flex-grow text-foreground">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ul>
                {patients.map((patient, index) => (
                  <li key={index}>{patient.email}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorHome;