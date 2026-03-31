import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  // Local state for controlling the Add Student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [level, setLevel] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [guardian, setGuardian] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<StudentStatus>('activo');
  const [submitting, setSubmitting] = useState(false);

  // Edit student modal state
  const [editStudent, setEditStudent] = useState<null | any>(null);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editGuardian, setEditGuardian] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<StudentStatus>('activo');

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

  const queryClient = useQueryClient();

  const filtered = (students ?? []).filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handler to create a new student via Supabase
  const handleAddStudent = async () => {
    if (!profile?.school_id) return;
    try {
      setSubmitting(true);
      const { error } = await supabase.from('students').insert({
        school_id: profile.school_id,
        first_name: firstName,
        last_name: lastName,
        level: level || null,
        grade: grade || null,
        section: section || null,
        guardian: guardian || null,
        phone: phone || null,
        status: status,
      });
      if (error) throw error;
      // Reset fields and close modal
      setFirstName('');
      setLastName('');
      setLevel('');
      setGrade('');
      setSection('');
      setGuardian('');
      setPhone('');
      setStatus('activo');
      setShowAddModal(false);
      // Invalidate the students query so it refetches
      queryClient.invalidateQueries(['students', profile?.school_id]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal with student data
  const openEditModal = (student: any) => {
    setEditStudent(student);
    setEditFirstName(student.first_name);
    setEditLastName(student.last_name);
    setEditLevel(student.level ?? '');
    setEditGrade(student.grade ?? '');
    setEditSection(student.section ?? '');
    setEditGuardian(student.guardian ?? '');
    setEditPhone(student.phone ?? '');
    setEditStatus(student.status);
  };

  // Update student record
  const handleUpdateStudent = async () => {
    if (!editStudent) return;
    try {
      setUpdateSubmitting(true);
      const { error } = await supabase
        .from('students')
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          level: editLevel || null,
          grade: editGrade || null,
          section: editSection || null,
          guardian: editGuardian || null,
          phone: editPhone || null,
          status: editStatus,
        })
        .eq('id', editStudent.id);
      if (error) throw error;
      setEditStudent(null);
      queryClient.invalidateQueries(['students', profile?.school_id]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUpdateSubmitting(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('¿Eliminar alumno? Esta acción no se puede deshacer.')) return;
    try {
      await supabase.from('students').delete().eq('id', studentId);
      queryClient.invalidateQueries(['students', profile?.school_id]);
    } catch (e) {
      alert((e as Error).message);
    }
  };

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
      {/* Add Student button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddModal(true)}>Agregar alumno</Button>
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
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
                  <td className="px-4 py-2 whitespace-nowrap space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(student)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Agregar nuevo alumno</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">
                Nombre(s)
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">
                Apellidos
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="level">
                  Nivel
                </label>
                <Input
                  id="level"
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="grade">
                  Grado
                </label>
                <Input
                  id="grade"
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="section">
                  Sección
                </label>
                <Input
                  id="section"
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="guardian">
                  Tutor
                </label>
                <Input
                  id="guardian"
                  type="text"
                  value={guardian}
                  onChange={(e) => setGuardian(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="phone">
                  Teléfono
                </label>
                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                disabled={submitting}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="por_reinscribir">Por reinscribir</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddStudent} disabled={submitting || !firstName || !lastName}>
                {submitting ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Editar alumno</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="editFirstName">
                Nombre(s)
              </label>
              <Input
                id="editFirstName"
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                disabled={updateSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="editLastName">
                Apellidos
              </label>
              <Input
                id="editLastName"
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                disabled={updateSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="editLevel">
                  Nivel
                </label>
                <Input
                  id="editLevel"
                  type="text"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  disabled={updateSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="editGrade">
                  Grado
                </label>
                <Input
                  id="editGrade"
                  type="text"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  disabled={updateSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="editSection">
                  Sección
                </label>
                <Input
                  id="editSection"
                  type="text"
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  disabled={updateSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="editGuardian">
                  Tutor
                </label>
                <Input
                  id="editGuardian"
                  type="text"
                  value={editGuardian}
                  onChange={(e) => setEditGuardian(e.target.value)}
                  disabled={updateSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="editPhone">
                  Teléfono
                </label>
                <Input
                  id="editPhone"
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={updateSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="editStatus">
                Estado
              </label>
              <select
                id="editStatus"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
                disabled={updateSubmitting}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="por_reinscribir">Por reinscribir</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setEditStudent(null)}
                disabled={updateSubmitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateStudent} disabled={updateSubmitting || !editFirstName || !editLastName}>
                {updateSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
