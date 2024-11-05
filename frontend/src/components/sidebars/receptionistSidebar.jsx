import { DashboardIcon, HelpIcon, MessagesIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
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
                        navigate("/receptionist");
                    }}
                    path="/receptionist"
                    active={location.pathname === "/receptionist"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/receptionist/messages");
                    }}
                    path="/receptionist/messages"
                    active={location.pathname === "/receptionist/messages"}
                />
                <hr className="my-3" />
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