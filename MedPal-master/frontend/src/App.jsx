import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import 'bootstrap/dist/css/bootstrap.min.css';

import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminLogin from "./pages/AdminLogin"; // 🔐 Login me kod sekret
import AdminDashboard from "./pages/AdminDashboard";

import PatientDashboard from "./pages/Patient/PatientDashboard";
import BookAppointment from "./pages/Patient/BookAppointment";
import PatientProfile from "./pages/Patient/PatientProfile";
import AppointmentHistory from "./pages/Patient/AppointmentHistory";
import PatientNotifications from "./pages/Patient/PatientNotifications";
import SearchDoctors from "./pages/Patient/SearchDoctors";
import PatientReports from "./pages/Patient/PatientReports";
import UploadDocuments from "./pages/Patient/UploadDocuments";

import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorCalendarView from "./pages/Doctor/DoctorCalendarView";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorWorkingHours from "./pages/Doctor/DoctorWorkingHours";
import AddVisitReport from "./pages/Doctor/AddVisitReport";
import DoctorReports from "./pages/Doctor/DoctorReports";

import ClinicDashboard from "./pages/Clinic/ClinicDashboard";
import ClinicAddDoctor from "./pages/Clinic/ClinicAddDoctor";
import ClinicAddDepartment from "./pages/Clinic/ClinicAddDepartment";
import ClinicServicesAndDepartments from "./pages/Clinic/ClinicServicesAndDepartments";
import ClinicSetDoctorWorkingHours from "./pages/Clinic/ClinicSetDoctorHours";
import ClinicCalendarView from "./pages/Clinic/ClinicCalendarView";
import ClinicPatientReports from "./pages/Clinic/ClinicPatientReports";
import DoctorList from "./pages/Clinic/DoctorList";
import ClinicAppointments from "./pages/Clinic/ClinicAppointments";
import ClinicProfileUpdate from "./pages/Clinic/ClinicProfileUpdate";
import InvitePatient from "./pages/Clinic/InvitePatient";

import CalendarView from "./pages/Common/CalendarView";

// Ky komponent shërben vetëm për AdminLogin, ku i kalojmë onLogin dhe përdorim navigate
function AdminLoginWrapper() {
  const navigate = useNavigate();

  function handleLogin(token) {
    // Ruaj token-in në localStorage ose ku e do ti
    localStorage.setItem("adminToken", token);
    // Redirect në dashboard-in e adminit
    navigate("/admin");
  }

  return <AdminLogin onLogin={handleLogin} />;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* 🌐 Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search-doctors" element={<SearchDoctors />} />

        {/* 🔐 Admin Routes */}
        <Route path="/superadmin-access-1794" element={<AdminLoginWrapper />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Patient Routes */}
        <Route
          path="/patient"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <BookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/history"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <AppointmentHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/notifications"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientNotifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/reports"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <PatientReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/documents"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
              <UploadDocuments />
            </PrivateRoute>
          }
        />

        {/* ✅ Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/calendar"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorCalendarView />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/working-hours"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorWorkingHours />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/add-report"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <AddVisitReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/reports"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorReports />
            </PrivateRoute>
          }
        />

        {/* ✅ Clinic Routes */}
        <Route
          path="/clinic"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/add-doctor"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicAddDoctor />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/doctors"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <DoctorList />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/calendar"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicCalendarView />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/add-department"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicAddDepartment />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/services"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicServicesAndDepartments />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/set-working-hours"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicSetDoctorWorkingHours />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/appointments"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/reports"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicPatientReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/profile"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <ClinicProfileUpdate />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic/invite-patient"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <InvitePatient />
            </PrivateRoute>
          }
        />

        {/* Optional: Common Calendar */}
        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={["clinic"]}>
              <CalendarView />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
