import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/supabase';

/**
 * Registration form.  Collects basic user information and an optional role.
 * In a real SaaS platform you might hide the role selector and assign roles
 * through an invitation or admin console.  For demonstration purposes we
 * expose it here.  Form validation is rudimentary; consider using a schema
 * validation library for production.
 */
export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AppRole>('alumno');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, firstName, lastName, role);
    if (error) {
      alert(error.message || 'No se pudo crear la cuenta');
      setIsLoading(false);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white p-8 border rounded shadow">
      <h1 className="text-2xl font-semibold text-center">Crear cuenta</h1>
      <div className="space-y-2">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Nombre(s)
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Apellidos
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
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
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
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
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AppRole)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        >
          <option value="alumno">Alumno</option>
          <option value="administrativo">Administrativo</option>
          <option value="directivo">Directivo</option>
          <option value="super_admin">Super&nbsp;Admin</option>
        </select>
      </div>
      <div className="text-right">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}