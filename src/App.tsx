import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Payments from '@/pages/Payments';
import Profile from '@/pages/Profile';

/**
 * ProtectedRoute ensures that its children are only rendered when a
 * user is authenticated.  Otherwise it redirects to the login page.  It
 * also shows a simple loading indicator while the authentication state
 * is being determined.
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="p-4">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Create a single query client instance for React Query
const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected area wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirect root to dashboard when authenticated */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<p className="p-4">404 — Página no encontrada</p>} />
    </Routes>
  );
}

/**
 * Root component.  Sets up context providers, React Query, and the
 * router.  Additional providers (theme, analytics, etc.) should be
 * registered here as needed.
 */
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
