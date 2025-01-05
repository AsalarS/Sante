import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import errorPage from "./pages/errorPage"
import Dashboard from "./pages/Dashboards/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import PatientsPage from "./pages/Dashboards/Doctor/patients"
import MessagesPage from "./pages/Dashboards/messages"
import ProfilePage from "./pages/Dashboards/profile"
import HelpPage from "./pages/Dashboards/help"
import Landing from "./pages/Landing"
import PatientAppointments from "./pages/Dashboards/Patient/patientAppointments.jsx"
import DoctorHome from "./pages/Dashboards/Doctor/doctorHome"
import PatientHome from "./pages/Dashboards/Patient/patientHome"
import ReceptionistHome from "./pages/Dashboards/Receptionist/receptionistHome"
import AdminHome from "./pages/Dashboards/Admin/adminHome"
import { DarkModeProvider } from "./components/darkMode"
import "./styles/Index.css";
import ErrorPage from "./pages/errorPage"
import { UserAdminPage } from "./pages/Dashboards/Admin/users"
import { LogAdminPage } from "./pages/Dashboards/Admin/logs"
import AppointmentPage from "./components/appointmentPage"
import { Toaster } from "sonner"
import { ChatsAdminPage } from "./pages/Dashboards/Admin/chats"
import { ChatMessagesPage } from "./pages/Dashboards/Admin/chatMessages"
import { AppointmentsAdminPage } from "./pages/Dashboards/Admin/appointments"
import { TooltipProvider } from "./components/ui/tooltip"
import DoctorSchedule from "./pages/Dashboards/Doctor/doctorSchedule"
import ReceptionistAppointment from "./pages/Dashboards/Receptionist/receptionistAppointment"

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
    <TooltipProvider>
      <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<ErrorPage />} />

          <Route
            path="/Doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:patientId" element={<PatientsPage />} />
            <Route path="patients/appointment/:id" element={<AppointmentPage />} />
            <Route path="patients/appointment" element={<AppointmentPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatID" element={<MessagesPage />} />
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
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatID" element={<MessagesPage />} />
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
            <Route index element={<Navigate to="patients" />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:patientId" element={<PatientsPage />} />
            <Route path="patients/appointment/:id" element={<AppointmentPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatID" element={<MessagesPage />} />
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
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:patientId" element={<PatientsPage />} />
            <Route path="appointments" element={<ReceptionistAppointment />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatID" element={<MessagesPage />} />
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
            <Route path="dashboard" element={<AdminHome />} />
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="users" element={<UserAdminPage />} />
            <Route path="appointments" element={<AppointmentsAdminPage />} />
            <Route path="chat" element={<ChatsAdminPage />} />
            <Route path="chat/messages/:chatID" element={<ChatMessagesPage />} />
            <Route path="logs" element={<LogAdminPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatID" element={<MessagesPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors toastOptions={{}} />
    </DarkModeProvider>
    </TooltipProvider>
  );
}

export default App
