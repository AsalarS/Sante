import { DashboardIcon, HelpIcon, MessagesIcon, NotificationIcon, PatientsIcon, SettingsIcon } from "@/components/icons";
import Sidebar, { SidebarItem } from "@/components/sidebar";
import { Outlet, Route, useLocation, useNavigate } from "react-router-dom";
import DashboardHome from "./Doctor/dashboardHome";
import PatientsPage from "./Doctor/patients";
import NotificationsPage from "./Doctor/notifications";
import MessagesPage from "./Doctor/messages";
import SettingsPage from "./Doctor/settings";
import ProfilePage from "./Doctor/profile";


function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex">
            <Sidebar>
                <SidebarItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    onClick={() => navigate("home")}
                    path="/dashboard"
                    active={location.pathname === "/temp"}
                />
                <SidebarItem
                    icon={<PatientsIcon size={20} />}
                    text="Patients"
                    onClick={() => navigate("patients")}
                    path="/temp/patients"
                    active={location.pathname === "/temp/patients"}
                />
                <SidebarItem
                    icon={<NotificationIcon size={20} />}
                    text="Notifications"
                    alert
                    onClick={() => navigate("notifications")}
                    path="/temp/notifications"
                    active={location.pathname === "/temp/notifications"}
                />
                <SidebarItem
                    icon={<MessagesIcon size={20} />}
                    text="Messages"
                    alert
                    onClick={() => navigate("messages")}
                    path="/temp/messages"
                    active={location.pathname === "/temp/messages"}
                />
                <hr className="my-3" />
                <SidebarItem
                    icon={<SettingsIcon size={20} />}
                    text="Settings"
                    onClick={() => navigate("settings")}
                    path="/temp/settings"
                    active={location.pathname === "/temp/settings"}
                />
                <SidebarItem
                    icon={<HelpIcon size={20} />}
                    text="Help"
                    onClick={() => navigate("profile")}
                    path="/temp/profile"
                    active={location.pathname === "/temp/profile"}
                />
            </Sidebar>
            <main className="p-4 flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default Dashboard;
