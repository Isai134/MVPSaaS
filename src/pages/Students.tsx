import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import type { StudentStatus } from '@/types/supabase';

/**
 * Students page lists all students belonging to the current school.  It
 * includes a search box and status filter to quickly narrow down the
 * results.  Data is fetched from Supabase using React Query.  For
 * additional functionality such as sorting or pagination consider
 * extracting the table into its own component.
 */
export default function Students() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['students', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  const filtered = (students ?? []).filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Alumnos</h1>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="search">
            Buscar
          </label>
          <Input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o apellido"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="status">
            Estado
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudentStatus | 'all')}
            className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="activo">Activo</option>
            <option value="por_reinscribir">Por reinscribir</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <p>Cargando estudiantes…</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar estudiantes</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nivel
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {student.level ?? '—'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap capitalize">
                    {student.status.replace('_', ' ')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
