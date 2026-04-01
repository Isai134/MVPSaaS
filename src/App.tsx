import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import type { AppRole } from '@/types/supabase';

// Pages
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ResetPassword from '@/pages/ResetPassword';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Payments from '@/pages/Payments';
import Profile from '@/pages/Profile';
import Schools from '@/pages/Schools';
import Subjects from '@/pages/Subjects';
import TeacherGrades from '@/pages/TeacherGrades';
import StudentGrades from '@/pages/StudentGrades';
import Announcements from '@/pages/Announcements';

function LoadingScreen() {
  return <p className="p-4">Cargando…</p>;
}

function Unauthorized() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
      <p className="mt-2 text-gray-600">
        No tienes permisos para entrar a esta sección.
      </p>
    </div>
  );
}

/**
 * Protege por login únicamente
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

/**
 * Protege por login + rol
 */
function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles: AppRole[];
}) {
  const { user, isLoading, roles } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = allowedRoles.some((role) => roles.includes(role));

  if (!hasAccess) return <Unauthorized />;

  return children;
}

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Layout protegido */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard: todos los roles */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute
              allowedRoles={[
                'super_admin',
                'directivo',
                'administrativo',
                'profesor',
                'alumno',
                'padre',
              ]}
            >
              <Dashboard />
            </RoleRoute>
          }
        />

        {/* Alumnos */}
        <Route
          path="/students"
          element={
            <RoleRoute
              allowedRoles={['super_admin', 'directivo', 'administrativo']}
            >
              <Students />
            </RoleRoute>
          }
        />

        {/* Pagos */}
        <Route
          path="/payments"
          element={
            <RoleRoute
              allowedRoles={['super_admin', 'directivo', 'administrativo']}
            >
              <Payments />
            </RoleRoute>
          }
        />

        {/* Escuelas */}
        <Route
          path="/schools"
          element={
            <RoleRoute allowedRoles={['super_admin', 'directivo']}>
              <Schools />
            </RoleRoute>
          }
        />

        {/* Perfil */}
        <Route
          path="/profile"
          element={
            <RoleRoute
              allowedRoles={[
                'super_admin',
                'directivo',
                'administrativo',
                'profesor',
                'alumno',
                'padre',
              ]}
            >
              <Profile />
            </RoleRoute>
          }
        />

        {/* Materias */}
        <Route
          path="/subjects"
          element={
            <RoleRoute
              allowedRoles={[
                'super_admin',
                'directivo',
                'administrativo',
                'profesor',
              ]}
            >
              <Subjects />
            </RoleRoute>
          }
        />

        {/* Captura de calificaciones */}
        <Route
          path="/teacher-grades"
          element={
            <RoleRoute allowedRoles={['super_admin', 'directivo', 'profesor']}>
              <TeacherGrades />
            </RoleRoute>
          }
        />

        {/* Ver calificaciones */}
        <Route
          path="/student-grades"
          element={
            <RoleRoute allowedRoles={['alumno', 'padre']}>
              <StudentGrades />
            </RoleRoute>
          }
        />

        {/* Anuncios */}
        <Route
          path="/announcements"
          element={
            <RoleRoute
              allowedRoles={[
                'super_admin',
                'directivo',
                'administrativo',
                'profesor',
                'alumno',
                'padre',
              ]}
            >
              <Announcements />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="*"
        element={<p className="p-4">404 — Página no encontrada</p>}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}