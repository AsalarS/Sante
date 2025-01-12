import { CalendarIcon, DashboardIcon, HelpIcon, MessagesIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { Calendar, CalendarRange, User2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function ReceptionistSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleImageClick = () => {
        navigate("/receptionist/profile")
    };

    return (
        <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => {
                        navigate("/receptionist/dashboard");
                    }}
                    path="/receptionist/dashboard"
                    active={location.pathname === "/receptionist/dashboard"}
                />
                <SidebarItem
                    icon={<CalendarIcon/>}
                    text="Schedules"
                    
                    onClick={() => {
                        navigate("/receptionist/schedule");
                    }}
                    path="/receptionist/appointments"
                    active={location.pathname.startsWith("/receptionist/schedule")}
                />
                <SidebarItem
                    icon={<User2 size={24}/>}
                    text="Patients"
                    
                    onClick={() => {
                        navigate("/receptionist/patients");
                    }}
                    path="/receptionist/patients"
                    active={location.pathname.startsWith("/receptionist/patients")}
                />
                <SidebarItem
                    icon={<MessagesIcon />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/receptionist/messages");
                    }}
                    path="/receptionist/messages"
                    active={location.pathname.startsWith("/receptionist/messages")}
                />
                <hr className="my-3 border-border" />
                {/* <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/receptionist/settings");
                    }}
                    path="/receptionist/settings"
                    active={location.pathname === "/receptionist/settings"}
                /> */}
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/receptionist/help")}
                    path="/receptionist/help"
                    active={location.pathname === "/receptionist/help"}
                />
            </Sidebar>
    )
}

export default ReceptionistSidebar