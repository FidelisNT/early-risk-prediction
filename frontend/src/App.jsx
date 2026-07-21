import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminPatients from "./pages/admin/AdminPatients.jsx";
import AdminInstitutions from "./pages/admin/AdminInstitutions.jsx";

import PatientLogin from "./pages/patient/PatientLogin.jsx";
import PatientLayout from "./pages/patient/PatientLayout.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import PatientProfile from "./pages/patient/PatientProfile.jsx";

import InstitutionLogin from "./pages/institution/InstitutionLogin.jsx";
import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard.jsx";
import InstitutionInsertData from "./pages/institution/InstitutionInsertData.jsx";
import InstitutionProfile from "./pages/institution/InstitutionProfile.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="institutions" element={<AdminInstitutions />} />
        </Route>

        {/* Patient */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route
          path="/patient"
          element={
            <ProtectedRoute role="patient">
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* Institution */}
        <Route path="/institution/login" element={<InstitutionLogin />} />
        <Route
          path="/institution"
          element={
            <ProtectedRoute role="institution">
              <InstitutionLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstitutionDashboard />} />
          <Route path="insert-data" element={<InstitutionInsertData />} />
          <Route path="profile" element={<InstitutionProfile />} />
        </Route>

        {/* Legacy per-role signup URLs now redirect to the unified page */}
        <Route path="/patient/signup" element={<Navigate to="/signup?role=patient" replace />} />
        <Route
          path="/institution/signup"
          element={<Navigate to="/signup?role=institution" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
