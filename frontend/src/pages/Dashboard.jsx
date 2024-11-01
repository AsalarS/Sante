import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "@/components/sidebars/doctorSidebar";
import PatientSidebar from "@/components/sidebars/patientSidebar";
import AdminSidebar from "@/components/sidebars/adminSidebar";
import NurseSidebar from "@/components/sidebars/nurseSidebar";
import ReceptionistSidebar from "@/components/sidebars/receptionistSidebar";

function Dashboard() {
    const location = useLocation();

    const renderSidebar = () => { //Fucntion to decide which sidebar to choose
        if (location.pathname.startsWith("/doctor")) {
            return <DoctorSidebar />;
        } else if (location.pathname.startsWith("/patient")) {
            return <PatientSidebar />;
        } else if (location.pathname.startsWith("/admin")) {
            return <AdminSidebar />;
        } else if (location.pathname.startsWith("/nurse")) {
            return <NurseSidebar />;
        } else if (location.pathname.startsWith("/receptionist")) {
            return <ReceptionistSidebar />;
        } else {
            return <p>NO</p>;
        }
    };

    return (
        <div className="flex">
            {renderSidebar()}
            <main className="p-4 flex-1">
                {/* To show pages */}
                <Outlet /> 
            </main>
        </div>
    );
}

export default Dashboard;
