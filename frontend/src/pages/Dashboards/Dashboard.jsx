import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "@/components/sidebars/doctorSidebar";
import PatientSidebar from "@/components/sidebars/patientSidebar";
import AdminSidebar from "@/components/sidebars/adminSidebar";
import NurseSidebar from "@/components/sidebars/nurseSidebar";
import ReceptionistSidebar from "@/components/sidebars/receptionistSidebar";
import DashBreadcrumb from "@/components/dashboardBreadcrumb";

function Dashboard() {
    const location = useLocation();

    const renderSidebar = () => { //Fucntion to decide which sidebar to render
        if (location.pathname.toLowerCase().startsWith("/doctor")) {
            return <DoctorSidebar />;
        } else if (location.pathname.toLowerCase().startsWith("/patient")) {
            return <PatientSidebar />;
        } else if (location.pathname.toLowerCase().startsWith("/admin")) {
            return <AdminSidebar />;
        } else if (location.pathname.toLowerCase().startsWith("/nurse")) {
            return <NurseSidebar />;
        } else if (location.pathname.toLowerCase().startsWith("/receptionist")) {
            return <ReceptionistSidebar />;
        } else {
            return <p>NO ROLE</p>;
        }
    };

    return (
        <div className="flex">
            <div className="relative z-40">
                {renderSidebar()}
            </div>
            <div className="flex flex-col flex-1">
                <main className="flex-1 bg-darker-background overflow-y-auto">
                    {/* To show pages */}
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
