import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AppRole } from '@/types/supabase';

/**
 * Sign up page collects basic user information and creates a new
 * account.  It uses Input and Button components for styling.  The
 * role selector remains visible for demonstration purposes; in a
 * production system roles would likely be assigned by an administrator.
 */
export default function SignUp() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            EduConnect
          </h1>
          <p className="text-gray-600">Únete a nuestra comunidad educativa</p>
        </div>

        {/* Sign Up Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/80 backdrop-blur-sm p-8 border border-gray-200/50 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-center text-gray-800">Crear cuenta</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nombre(s)
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

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
              className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
              className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="alumno">🎓 Alumno</option>
              <option value="administrativo">👔 Administrativo</option>
              <option value="directivo">🏫 Directivo</option>
              <option value="super_admin">⚡ Super Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Creando…' : 'Crear cuenta'}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors">
              ¿Ya tienes cuenta? <span className="font-semibold">Inicia sesión</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
