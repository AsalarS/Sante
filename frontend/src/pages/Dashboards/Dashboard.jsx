import { Outlet, useLocation } from "react-router-dom";
import DoctorSidebar from "@/components/sidebars/doctorSidebar";
import PatientSidebar from "@/components/sidebars/patientSidebar";
import AdminSidebar from "@/components/sidebars/adminSidebar";
import NurseSidebar from "@/components/sidebars/nurseSidebar";
import ReceptionistSidebar from "@/components/sidebars/receptionistSidebar";
import DashBreadcrumb from "@/components/dashboardBreadcrumb";

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
            <div className="flex flex-col flex-1">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b w-full">
                    <div className="flex items-center gap-2 px-3">
                        <DashBreadcrumb />
                    </div>
                </header>
                <main className="flex-1">
                    {/* To show pages */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
