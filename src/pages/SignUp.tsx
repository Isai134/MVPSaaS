import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';

/**
 * Sign up page.  Presents the registration form.  After successful sign up
 * users will be redirected to the dashboard.
 */
export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <SignUpForm />
    </div>
  );
}