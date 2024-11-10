import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboards/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import PatientsPage from "./pages/Dashboards/Doctor/patients"
import NotificationsPage from "./pages/Dashboards/Doctor/notifications"
import MessagesPage from "./pages/Dashboards/messages"
// import SettingsPage from "./pages/Dashboards/settings"
import ProfilePage from "./pages/Dashboards/profile"
import HelpPage from "./pages/Dashboards/help"
import Landing from "./pages/Landing"
import LabsPage from "./pages/Dashboards/Patient/labs"
import DoctorHome from "./pages/Dashboards/Doctor/doctorHome"
import PatientHome from "./pages/Dashboards/Patient/patientHome"
import NurseHome from "./pages/Dashboards/Nurse/nurseHome"
import ReceptionistHome from "./pages/Dashboards/Receptionist/receptionistHome"
import AdminHome from "./pages/Dashboards/Admin/adminHome"
import { DarkModeProvider } from "./components/darkMode"
import "./styles/Index.css";

function Logout() {
  localStorage.clear()
  return <Navigate to="/" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/Doctor/"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
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
            <Route index path="dashboard" element={<PatientHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="labs" element={<LabsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
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
            <Route path="dashboard" element={<NurseHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="messages" element={<MessagesPage />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
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
            <Route path="dashboard" element={<ReceptionistHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="messages" element={<MessagesPage />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
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
            <Route path="dashboard" element={<AdminHome  />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="messages" element={<MessagesPage />} />
            {/* <Route path="settings" element={<SettingsPage />} /> */}
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App
