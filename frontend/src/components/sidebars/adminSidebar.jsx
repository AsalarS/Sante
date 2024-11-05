import { DashboardIcon, HelpIcon, MessagesIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleImageClick = () => {
        navigate("/admin/profile")
    };

    return (
        <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => {
                        navigate("/admin");
                    }}
                    path="/admin"
                    active={location.pathname === "/admin"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/admin/messages");
                    }}
                    path="/admin/messages"
                    active={location.pathname === "/admin/messages"}
                />
                <hr className="my-3" />
                {/* <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        navigate("/admin/settings");
                    }}
                    path="/admin/settings"
                    active={location.pathname === "/admin/settings"}
                /> */}
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/admin/help")}
                    path="/admin/help"
                    active={location.pathname === "/admin/help"}
                />
            </Sidebar>
    )
}

export default AdminSidebar