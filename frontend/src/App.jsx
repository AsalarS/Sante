import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboards/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardHome from "./pages/Dashboards/Doctor/dashboardHome"
import PatientsPage from "./pages/Dashboards/Doctor/patients"
import NotificationsPage from "./pages/Dashboards/Doctor/notifications"
import MessagesPage from "./pages/Dashboards/messages"
import SettingsPage from "./pages/Dashboards/settings"
import ProfilePage from "./pages/Dashboards/profile"
import HelpPage from "./pages/Dashboards/help"
import Landing from "./pages/Landing"
import LabsPage from "./pages/Dashboards/Patient/labs"

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

          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/Doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<DashboardHome />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/Patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="labs" element={<LabsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/Nurse"
            element={
              <ProtectedRoute allowedRoles={['nurse']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/Receptionist"
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/Admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
