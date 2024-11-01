import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardHome from "./pages/Doctor/dashboardHome"
import PatientsPage from "./pages/Doctor/patients"
import NotificationsPage from "./pages/Doctor/notifications"
import MessagesPage from "./pages/Doctor/messages"
import SettingsPage from "./pages/Doctor/settings"
import ProfilePage from "./pages/Doctor/profile"
import HelpPage from "./pages/Doctor/help"
import Landing from "./pages/Landing"
import LabsPage from "./pages/Patient/labs"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />}></Route>

          <Route path="/Doctor" element={<Dashboard />} >
            <Route path="home" element={<DashboardHome />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/Patient" element={<Dashboard />} >
            <Route path="labs" element={<LabsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/Nurse/" element={<Dashboard />} >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/Receptionist/" element={<Dashboard />} >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/Admin/" element={<Dashboard />} >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
