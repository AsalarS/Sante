import { CalendarIcon, DashboardIcon, HelpIcon, MessagesIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { Calendar, Calendar1, MessagesSquare, NotebookTabs, User2 } from "lucide-react";
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
                        navigate("/admin/dashboard");
                    }}
                    path="/admin/dashboard"
                    active={location.pathname === "/admin/dashboard"}
                />
                <SidebarItem
                    icon={<User2 size={24}/>}
                    text="Users"
                    
                    onClick={() => {
                        navigate("/admin/users");
                    }}
                    path="/admin/users"
                    active={location.pathname === "/admin/users"}
                />
                <SidebarItem
                    icon={<CalendarIcon />}
                    text="Appointments"
                    
                    onClick={() => {
                        navigate("/admin/appointments");
                    }}
                    path="/admin/appointments"
                    active={location.pathname === "/admin/appointments"}
                />
                <SidebarItem
                    icon={<MessagesSquare size={24} />}
                    text="Chats"
                    
                    onClick={() => {
                        navigate("/admin/chat");
                    }}
                    path="/admin/chat"
                    active={location.pathname === "/admin/chat"}
                />
                <SidebarItem
                    icon={<NotebookTabs size={24} />}
                    text="Logs"
                    
                    onClick={() => {
                        navigate("/admin/logs");
                    }}
                    path="/admin/logs"
                    active={location.pathname === "/admin/logs"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/admin/messages");
                    }}
                    path="/admin/messages"
                    active={location.pathname.startsWith("/admin/messages")}
                />
                <hr className="my-3 border-border" />
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