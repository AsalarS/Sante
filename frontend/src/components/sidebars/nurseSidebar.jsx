import { HelpIcon, MessagesIcon, PatientsIcon } from "@/components/icons";
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
                    icon={<PatientsIcon size={20} />}
                    text="Patients"
                    onClick={() => {
                        navigate("/nurse/patients");
                    }}
                    path="/nurse/patients"
                    active={location.pathname.startsWith("/nurse/patients")}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        navigate("/nurse/messages");
                    }}
                    path="/nurse/messages"
                    active={location.pathname.startsWith("/nurse/messages")}
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