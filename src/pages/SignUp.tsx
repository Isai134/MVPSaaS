import { SignUpForm } from '@/components/auth/SignUpForm';

/**
 * Page that renders the SignUpForm.  It can be mapped to a route like
 * `/signup` in the application's router.  Keeping the page simple
 * simplifies code splitting and lazy loading if needed.
 */
export default function SignUp() {
  return <SignUpForm />;
}