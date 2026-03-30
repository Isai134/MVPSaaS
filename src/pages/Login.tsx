import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Login page.  Renders the login form in the centre of the viewport.  The
 * containing route should be public; successful authentication will redirect
 * users to their dashboard via the LoginForm logic.
 */
export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginForm />
    </div>
  );
}