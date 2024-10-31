import { DashboardIcon, HelpIcon, MessagesIcon, NotificationIcon, PatientsIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardHome from "./Doctor/dashboardHome";
import PatientsPage from "./Doctor/patients";
import NotificationsPage from "./Doctor/notifications";
import MessagesPage from "./Doctor/messages";
import SettingsPage from "./Doctor/settings";
import ProfilePage from "./Doctor/profile";
import HelpPage from "./Doctor/help";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    console.log("Dashboard component rendered");

    const handleImageClick = () => {
        navigate("/temp/profile")
    };

    return (
        <div className="flex">
            <Sidebar onImageClick={handleImageClick}>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => {
                        console.log("Navigating to /temp/home");
                        navigate("/temp/home");
                    }}
                    path="/temp/home"
                    active={location.pathname === "/temp/home"}
                />
                <SidebarItem
                    icon={<PatientsIcon size={20} />}
                    text="Patients"
                    onClick={() => {
                        console.log("Navigating to /temp/patients");
                        navigate("/temp/patients");
                    }}
                    path="/temp/patients"
                    active={location.pathname === "/temp/patients"}
                />
                <SidebarItem
                    icon={<NotificationIcon size={20} />}
                    text="Notifications"
                    alert
                    onClick={() => {
                        console.log("Navigating to /temp/notifications");
                        navigate("/temp/notifications");
                    }}
                    path="/temp/notifications"
                    active={location.pathname === "/temp/notifications"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => {
                        console.log("Navigating to /temp/messages");
                        navigate("/temp/messages");
                    }}
                    path="/temp/messages"
                    active={location.pathname === "/temp/messages"}
                />
                <hr className="my-3" />
                <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => {
                        console.log("Navigating to /temp/settings");
                        navigate("/temp/settings");
                    }}
                    path="/temp/settings"
                    active={location.pathname === "/temp/settings"}
                />
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("/temp/help")}
                    path="/temp/help"
                    active={location.pathname === "/temp/help"}
                />
            </Sidebar>
            <main className="p-4 flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default Dashboard;
