import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * ForgotPassword page allows users to request a password reset.
 * Users enter their email and receive a reset link.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const { error } = await resetPassword(email);
    if (error) {
      setMessage(error.message || 'Error al enviar el correo de recuperación');
    } else {
      setMessage('Se ha enviado un correo de recuperación a tu dirección de email.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-white p-8 border rounded-lg shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-center">Recuperar contraseña</h1>
        <p className="text-sm text-gray-600 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
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
        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </Button>
        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </div>
  );
}