import { CalendarIcon, DashboardIcon, HelpIcon, MessagesIcon, NotificationIcon, PatientsIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { CalendarRange } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function DoctorSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleImageClick = () => {
        navigate("/doctor/profile")
    };

    return (
        <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => {
                        navigate("/doctor/dashboard");
                    }}
                    path="/doctor/dashboard"
                    active={location.pathname === "/doctor/dashboard"}
                />
                <SidebarItem
                    icon={<CalendarIcon />}
                    text="Schedule"
                    onClick={() => {
                        navigate("/doctor/schedule");
                    }}
                    path="/doctor/schedule"
                    active={location.pathname.startsWith("/doctor/schedule")}
                />
                <SidebarItem
                    icon={<PatientsIcon size={20} />}
                    text="Patients"
                    onClick={() => {
                        navigate("/doctor/patients");
                    }}
                    path="/doctor/patients"
                    active={location.pathname.startsWith("/doctor/patients")}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/doctor/messages");
                    }}
                    path="/doctor/messages"
                    active={location.pathname.startsWith("/doctor/messages")}
                />
                <hr className="my-3 border-border" />
                {/* <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/doctor/settings");
                    }}
                    path="/doctor/settings"
                    active={location.pathname === "/doctor/settings"}
                /> */}
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/doctor/help")}
                    path="/doctor/help"
                    active={location.pathname === "/doctor/help"}
                />
            </Sidebar>
    )
}

export default DoctorSidebar