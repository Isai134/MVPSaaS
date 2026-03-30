import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Login page renders a simple sign‑in form.  It uses our Input and
 * Button components for consistent styling.  On successful login
 * users are redirected to the dashboard.  Form validation is minimal;
 * consider integrating react‑hook‑form and Zod for a more robust
 * experience.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      alert(error.message || 'Error al iniciar sesión');
      setIsLoading(false);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-white p-8 border rounded-lg shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-center">Bienvenido</h1>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="text-right">
          <Link to="/signup" className="text-sm text-blue-600 hover:underline">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  );
}
