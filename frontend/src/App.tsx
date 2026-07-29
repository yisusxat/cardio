import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import DoctorsPage from './pages/public/DoctorsPage';
import DoctorDetailPage from './pages/public/DoctorDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboardPage from './pages/patient/DashboardPage';
import PatientAppointmentsPage from './pages/patient/AppointmentsPage';
import PatientProfilePage from './pages/patient/ProfilePage';

// Doctor Pages
import DoctorDashboardPage from './pages/doctor/DashboardPage';
import DoctorSchedulesPage from './pages/doctor/SchedulesPage';
import DoctorServicesPage from './pages/doctor/ServicesPage';
import DoctorProfilePage from './pages/doctor/ProfilePage';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: ('PATIENT' | 'DOCTOR' | 'ADMIN')[];
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient Protected Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Protected Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedules"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorSchedulesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/services"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
