import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Profile page displays the logged in user's basic information.  In a
 * fully featured SaaS this page would also allow editing profile
 * details, changing passwords, and managing settings.  At present it
 * simply shows the user's name and email.
 */
export default function Profile() {
  const { profile, isLoading } = useAuth();
  if (isLoading) return <p className="p-4">Cargando…</p>;
  if (!profile) return <p className="p-4">No se pudo cargar el perfil.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Mi perfil</h1>
      <div className="space-y-1">
        <p>
          <strong>Nombre:</strong> {profile.first_name} {profile.last_name}
        </p>
        <p>
          <strong>Correo:</strong> {profile.email}
        </p>
      </div>
    </div>
  );
}
