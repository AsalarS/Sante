import { DashboardIcon, HelpIcon, MessagesIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

function NurseSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleImageClick = () => {
        navigate("/nurse/profile")
    };

    return (
        <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard/dashboard"
                    onClick={() => {
                        navigate("/nurse/dashboard");
                    }}
                    path="/nurse/dashboard"
                    active={location.pathname === "/nurse/dashboard"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/nurse/messages");
                    }}
                    path="/nurse/messages"
                    active={location.pathname === "/nurse/messages"}
                />
                <hr className="my-3 border-border" />
                {/* <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/nurse/settings");
                    }}
                    path="/nurse/settings"
                    active={location.pathname === "/nurse/settings"}
                /> */}
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/nurse/help")}
                    path="/nurse/help"
                    active={location.pathname === "/nurse/help"}
                />
            </Sidebar>
    )
}

export default NurseSidebar