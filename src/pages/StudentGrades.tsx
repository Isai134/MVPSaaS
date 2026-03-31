import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentGrades() {
  const { profile } = useAuth();

  const { data: studentRecord } = useQuery({
    queryKey: ['student-record', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', profile?.id ?? '')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-grade-view', studentRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select(`
          score,
          comments,
          grade_items (
            title,
            item_type,
            period,
            percentage,
            subjects (
              name
            )
          )
        `)
        .eq('student_id', studentRecord?.id ?? '');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentRecord?.id,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mis calificaciones</h1>

      {isLoading ? (
        <p>Cargando calificaciones...</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar calificaciones</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rubro</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comentarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(data ?? []).map((row: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.grade_items?.subjects?.name ?? '—'}</td>
                  <td className="px-4 py-2">{row.grade_items?.title ?? '—'}</td>
                  <td className="px-4 py-2">{row.grade_items?.item_type ?? '—'}</td>
                  <td className="px-4 py-2">{row.grade_items?.period ?? '—'}</td>
                  <td className="px-4 py-2">{row.grade_items?.percentage ?? 0}%</td>
                  <td className="px-4 py-2 font-semibold">{row.score}</td>
                  <td className="px-4 py-2">{row.comments ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}