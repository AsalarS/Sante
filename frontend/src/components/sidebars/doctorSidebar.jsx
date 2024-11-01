import { DashboardIcon, HelpIcon, MessagesIcon, NotificationIcon, PatientsIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
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
                        navigate("/doctor");
                    }}
                    path="/doctor"
                    active={location.pathname === "/doctor"}
                />
                <SidebarItem
                    icon={<PatientsIcon size={20} />}
                    text="Patients"
                    onClick={() => {
                        navigate("/doctor/patients");
                    }}
                    path="/doctor/patients"
                    active={location.pathname === "/doctor/patients"}
                />
                <SidebarItem
                    icon={<NotificationIcon size={20} />}
                    text="Notifications"
                    alert
                    onClick={() => {
                        navigate("/doctor/notifications");
                    }}
                    path="/doctor/notifications"
                    active={location.pathname === "/doctor/notifications"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/doctor/messages");
                    }}
                    path="/doctor/messages"
                    active={location.pathname === "/doctor/messages"}
                />
                <hr className="my-3" />
                <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/doctor/settings");
                    }}
                    path="/doctor/settings"
                    active={location.pathname === "/doctor/settings"}
                />
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