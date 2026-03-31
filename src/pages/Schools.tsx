import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Schools page lists all schools accessible to the current user.
 * Super admins and directivos can add new schools.  Other users
 * simply see their assigned school(s).  This is a basic
 * implementation that demonstrates multi‑escuela functionality.
 */
export default function Schools() {
  const { profile, roles, isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch schools that the user has roles in
  const {
    data: schools,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['schools', profile?.id],
    queryFn: async () => {
      // Get the list of school_ids from user_roles for the current user
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('school_id')
        .eq('user_id', profile?.user_id ?? '');
      if (roleError) throw roleError;
      const schoolIds = (roleData ?? []).map((r) => r.school_id);
      if (schoolIds.length === 0) return [];
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .in('id', schoolIds);
      if (schoolsError) throw schoolsError;
      return schoolsData ?? [];
    },
    enabled: !!profile?.user_id,
  });

  // Handler to add a new school
  const handleAddSchool = async () => {
    try {
      setCreating(true);
      const { error } = await supabase
        .from('schools')
        .insert({ name: schoolName, city: schoolCity || null });
      if (error) throw error;
      setSchoolName('');
      setSchoolCity('');
      setShowAddModal(false);
      queryClient.invalidateQueries(['schools', profile?.id]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (!profile) {
    return <p className="p-4">Cargando…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Escuelas</h1>
      {/* Admins can add new schools */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowAddModal(true)}>Agregar escuela</Button>
        </div>
      )}
      {isLoading ? (
        <p>Cargando escuelas…</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar escuelas</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Ciudad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(schools ?? []).map((school: any) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{school.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{school.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{school.city ?? '—'}</td>
                </tr>
              ))}
              {schools && schools.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                    No tienes escuelas asignadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Agregar nueva escuela</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="schoolName">
                Nombre de la escuela
              </label>
              <Input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="schoolCity">
                Ciudad (opcional)
              </label>
              <Input
                id="schoolCity"
                type="text"
                value={schoolCity}
                onChange={(e) => setSchoolCity(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddSchool}
                disabled={creating || !schoolName}
              >
                {creating ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}