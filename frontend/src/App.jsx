import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DarkModeProvider } from "./components/darkMode"
import { TooltipProvider } from "./components/ui/tooltip"
import { Toaster } from "sonner"
import "./styles/Index.css"
import { ErrorBoundary } from 'react-error-boundary'

// Eagerly loaded components
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ErrorPage from "./pages/errorPage"
import ProtectedRoute from "./components/ProtectedRoute"

// Lazily loaded components
const Dashboard = React.lazy(() => import("./pages/Dashboards/Dashboard"))

// Doctor components
const DoctorHome = React.lazy(() => import("./pages/Dashboards/Doctor/doctorHome"))
const DoctorSchedule = React.lazy(() => import("./pages/Dashboards/Doctor/doctorSchedule"))
const PatientsPage = React.lazy(() => import("./pages/Dashboards/Doctor/patients"))

// Patient components
const PatientHome = React.lazy(() => import("./pages/Dashboards/Patient/patientHome"))
const PatientAppointments = React.lazy(() => import("./pages/Dashboards/Patient/patientAppointments.jsx"))

// Receptionist components
const ReceptionistHome = React.lazy(() => import("./pages/Dashboards/Receptionist/receptionistHome"))
const ReceptionistAppointment = React.lazy(() => import("./pages/Dashboards/Receptionist/receptionistAppointment"))
const ReceptionistDoctors = React.lazy(() => import("./pages/Dashboards/Receptionist/receptionistDoctors"))

// Admin components
const AdminHome = React.lazy(() => import("./pages/Dashboards/Admin/adminHome"))
const UserAdminPage = React.lazy(() => import("./pages/Dashboards/Admin/users"))
const LogAdminPage = React.lazy(() => import("./pages/Dashboards/Admin/logs"))
const ChatsAdminPage = React.lazy(() => import("./pages/Dashboards/Admin/chats"))
const ChatMessagesPage = React.lazy(() => import("./pages/Dashboards/Admin/chatMessages"))
const AppointmentsAdminPage = React.lazy(() => import("./pages/Dashboards/Admin/appointments"))

// Shared components
const MessagesPage = React.lazy(() => import("./pages/Dashboards/messages"))
const ProfilePage = React.lazy(() => import("./pages/Dashboards/profile"))
const HelpPage = React.lazy(() => import("./pages/Dashboards/help"))
const AppointmentPage = React.lazy(() => import("./components/appointmentPage"))

function Logout() {
  localStorage.clear()
  return <Navigate to="/" />
}

function App() {
  // Loading fallback for Suspense
  const LoadingFallback = () => (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-lg font-medium">Loading...</div>
    </div>
  )

  function ErrorFallback({error}) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-semibold text-red-800">Something went wrong:</h2>
        <pre className="mt-2 text-sm bg-white p-3 rounded border">{error.message}</pre>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <DarkModeProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
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
                <Route path="dashboard" element={<PatientHome />} />
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
                <Route path="schedule" element={<ReceptionistDoctors />} />
                <Route path="schedule/:doctorId" element={<DoctorSchedule />} />
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
                <Route path="users" element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <UserAdminPage />
                  </ErrorBoundary>
                } />
                <Route path="appointments" element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AppointmentsAdminPage />
                  </ErrorBoundary>
                } />
                <Route path="chat" element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ChatsAdminPage />
                  </ErrorBoundary>
                } />
                <Route path="chat/messages/:chatID" element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ChatMessagesPage />
                  </ErrorBoundary>
                } />
                <Route path="logs" element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <LogAdminPage />
                  </ErrorBoundary>
                } />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="patients/:patientId" element={<PatientsPage />} />
                <Route path="patients/appointment/:id" element={<AppointmentPage />} />
                <Route path="patients/appointment" element={<AppointmentPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="messages/:chatID" element={<MessagesPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster richColors toastOptions={{}} />
        </BrowserRouter>
      </DarkModeProvider>
    </TooltipProvider>
  );
}

export default App
