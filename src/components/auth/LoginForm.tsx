import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * A simple login form.  Handles user input, calls the `signIn` method from
 * AuthContext and redirects on success.  Validation is minimal; in a
 * production system you should integrate a form library (e.g. react-hook-form)
 * and a validation schema (e.g. Zod) for better UX.
 */
export function LoginForm() {
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
    // Redirect after successful login
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white p-8 border rounded shadow">
      <h1 className="text-2xl font-semibold text-center">Bienvenido</h1>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="text-right">
        <Link to="/signup" className="text-sm text-blue-600 hover:underline">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Entrando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}