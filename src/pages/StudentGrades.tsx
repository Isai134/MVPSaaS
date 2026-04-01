import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * This component consolidates all of the information that a student
 * should see in their panel: a list of enrolled subjects, their own
 * payment records and the detailed grade breakdown for each rubro.
 *
 * It replaces the previous StudentGrades page with a richer panel
 * that queries additional tables via Supabase. Each section is
 * conditionally rendered based on the results of the queries.
 */
export default function StudentGrades() {
  const { profile } = useAuth();

  // Fetch the student row associated with the logged‑in profile.  We
  // rely on the `profile_id` foreign key on the `students` table.
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

  // Fetch all subject enrollments for this student.  We join the
  // subjects and groups tables to display friendly names.  The
  // `student_subject_enrollments` table links students to subjects.
  const {
    data: subjectEnrollments,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useQuery({
    queryKey: ['student-subjects', studentRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_subject_enrollments')
        .select(
          `subjects ( id, name ),
           groups ( id, name )`
        )
        .eq('student_id', studentRecord?.id ?? '');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentRecord?.id,
  });

  // Fetch all payment records for this student.  These records come
  // from the `payments` table and include concept, amount, status and
  // due date.  Only payments belonging to this student are returned.
  const {
    data: payments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ['student-payments', studentRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentRecord?.id ?? '');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentRecord?.id,
  });

  // Fetch the detailed grade view.  This mirrors the original
  // StudentGrades implementation but is moved into its own section.
  const {
    data: grades,
    isLoading: gradesLoading,
    error: gradesError,
  } = useQuery({
    queryKey: ['student-grade-view', studentRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select(
          `score,
           comments,
           grade_items (
             title,
             item_type,
             period,
             percentage,
             subjects ( name )
           )`
        )
        .eq('student_id', studentRecord?.id ?? '');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentRecord?.id,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel del alumno</h1>

      {/* Subjects section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Mis materias</h2>
        {subjectsLoading ? (
          <p>Cargando materias…</p>
        ) : subjectsError ? (
          <p className="text-red-600">Error al cargar materias</p>
        ) : (subjectEnrollments?.length ?? 0) > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {subjectEnrollments?.map((row: any, idx: number) => (
              <li key={idx}>
                {row.subjects?.name ?? '—'}
                {row.groups?.name ? ` – ${row.groups?.name}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p>No estás inscrito en ninguna materia.</p>
        )}
      </section>

      {/* Payments section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Mis pagos</h2>
        {paymentsLoading ? (
          <p>Cargando pagos…</p>
        ) : paymentsError ? (
          <p className="text-red-600">Error al cargar pagos</p>
        ) : (payments?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Concepto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha límite
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha de pago
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments?.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-2">{payment.concept}</td>
                    <td className="px-4 py-2">${payment.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 capitalize">{payment.status}</td>
                    <td className="px-4 py-2">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No tienes pagos registrados.</p>
        )}
      </section>

      {/* Grades section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Mis calificaciones</h2>
        {gradesLoading ? (
          <p>Cargando calificaciones…</p>
        ) : gradesError ? (
          <p className="text-red-600">Error al cargar calificaciones</p>
        ) : (grades?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Materia
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Rubro
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Periodo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Peso
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Calificación
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades?.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      {row.grade_items?.subjects?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2">{row.grade_items?.title ?? '—'}</td>
                    <td className="px-4 py-2">{row.grade_items?.item_type ?? '—'}</td>
                    <td className="px-4 py-2">{row.grade_items?.period ?? '—'}</td>
                    <td className="px-4 py-2">
                      {row.grade_items?.percentage ?? 0}%
                    </td>
                    <td className="px-4 py-2 font-semibold">{row.score}</td>
                    <td className="px-4 py-2">{row.comments ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No se encontraron calificaciones.</p>
        )}
      </section>
    </div>
  );
}