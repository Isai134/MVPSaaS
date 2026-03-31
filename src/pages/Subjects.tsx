import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Subjects() {
  const { profile, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState('');
  const [grade, setGrade] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjects', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  const handleCreate = async () => {
    if (!profile?.school_id) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('subjects').insert({
        school_id: profile.school_id,
        name,
        code: code || null,
        level: level || null,
        grade: grade || null,
      });

      if (error) throw error;

      setName('');
      setCode('');
      setLevel('');
      setGrade('');
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['subjects', profile.school_id] });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Materias</h1>

      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>Agregar materia</Button>
        </div>
      )}

      {isLoading ? (
        <p>Cargando materias...</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar materias</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(data ?? []).map((subject: any) => (
                <tr key={subject.id}>
                  <td className="px-4 py-2">{subject.name}</td>
                  <td className="px-4 py-2">{subject.code ?? '—'}</td>
                  <td className="px-4 py-2">{subject.level ?? '—'}</td>
                  <td className="px-4 py-2">{subject.grade ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Nueva materia</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Código</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nivel</label>
              <Input value={level} onChange={(e) => setLevel(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Grado</label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving || !name}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}