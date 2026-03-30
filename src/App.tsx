import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';

/**
 * ProtectedRoute wraps its children and only renders them when the user is
 * authenticated.  Otherwise it redirects to the login page.  While the
 * authentication state is loading it renders a placeholder.
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  console.log('ProtectedRoute debug', { user, isLoading });

  if (isLoading) return <p className="p-4">Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
// Query client for React Query
const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<p className="p-4">404 — Página no encontrada</p>} />
    </Routes>
  );
}

/**
 * Root component.  Sets up context providers and routing.  In production
 * environments you might add additional providers (e.g. ThemeProvider) and
 * analytics here.
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