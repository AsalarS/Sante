import { DashboardIcon, HelpIcon, MessagesIcon, PatientsIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

function PatientSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleImageClick = () => {
        navigate("/patient/profile")
    };

    return (
        <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => {
                        navigate("/patient/dashboard");
                    }}
                    path="/patient/dashboard"
                    active={location.pathname === "/patient/dashboard"}
                />
                <SidebarItem
                    icon={<PatientsIcon size={20} />}
                    text="Labs"
                    onClick={() => {
                        navigate("/patient/labs");
                    }}
                    path="/patient/labs"
                    active={location.pathname === "/patient/labs"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/patient/messages");
                    }}
                    path="/patient/messages"
                    active={location.pathname === "/patient/messages"}
                />
                <hr className="my-3" />
                {/* <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/patient/settings");
                    }}
                    path="/patient/settings"
                    active={location.pathname === "/patient/settings"}
                /> */}
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/patient/help")}
                    path="/patient/help"
                    active={location.pathname === "/patient/help"}
                />
            </Sidebar>
    )
}

export default PatientSidebar