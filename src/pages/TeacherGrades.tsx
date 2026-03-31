import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TeacherGrades() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedGradeItemId, setSelectedGradeItemId] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);

  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState('tarea');
  const [itemPeriod, setItemPeriod] = useState('Parcial 1');
  const [itemPercentage, setItemPercentage] = useState('20');

  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [commentsDrafts, setCommentsDrafts] = useState<Record<string, string>>({});

  const { data: teacherRecord } = useQuery({
    queryKey: ['teacher-record', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('profile_id', profile?.id ?? '')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const { data: assignments } = useQuery({
    queryKey: ['teacher-assignments', teacherRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subject_assignments')
        .select(`
          *,
          subjects ( id, name ),
          groups ( id, name )
        `)
        .eq('teacher_id', teacherRecord?.id ?? '');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherRecord?.id,
  });

  const selectedAssignment = useMemo(
    () => (assignments ?? []).find((a: any) => a.id === selectedAssignmentId),
    [assignments, selectedAssignmentId]
  );

  const { data: gradeItems } = useQuery({
    queryKey: ['grade-items', selectedAssignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grade_items')
        .select('*')
        .eq('subject_id', selectedAssignment.subject_id)
        .eq('group_id', selectedAssignment.group_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedAssignment,
  });

  const { data: enrolledStudents } = useQuery({
    queryKey: ['enrolled-students', selectedAssignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_subject_enrollments')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name
          )
        `)
        .eq('subject_id', selectedAssignment.subject_id)
        .eq('group_id', selectedAssignment.group_id)
        .eq('academic_year_id', selectedAssignment.academic_year_id);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedAssignment,
  });

  const { data: existingGrades } = useQuery({
    queryKey: ['existing-grades', selectedGradeItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('grade_item_id', selectedGradeItemId);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedGradeItemId,
  });

  const gradeMap = useMemo(() => {
    const map: Record<string, { score: number; comments: string | null }> = {};
    (existingGrades ?? []).forEach((g: any) => {
      map[g.student_id] = { score: g.score, comments: g.comments };
    });
    return map;
  }, [existingGrades]);

  const createGradeItem = async () => {
    if (!profile?.school_id || !teacherRecord?.id || !selectedAssignment) return;

    const { error } = await supabase.from('grade_items').insert({
      school_id: profile.school_id,
      subject_id: selectedAssignment.subject_id,
      group_id: selectedAssignment.group_id,
      teacher_id: teacherRecord.id,
      title: itemTitle,
      item_type: itemType,
      period: itemPeriod,
      percentage: Number(itemPercentage),
    });

    if (error) {
      alert(error.message);
      return;
    }

    setItemTitle('');
    setItemType('tarea');
    setItemPeriod('Parcial 1');
    setItemPercentage('20');
    setShowItemModal(false);

    queryClient.invalidateQueries({ queryKey: ['grade-items', selectedAssignmentId] });
  };

  const saveGrades = async () => {
    if (!profile?.school_id || !selectedGradeItemId) return;

    const rows = (enrolledStudents ?? []).map((row: any) => {
      const studentId = row.students.id;
      const currentScore =
        gradeDrafts[studentId] !== undefined
          ? Number(gradeDrafts[studentId])
          : gradeMap[studentId]?.score ?? 0;

      const currentComments =
        commentsDrafts[studentId] !== undefined
          ? commentsDrafts[studentId]
          : gradeMap[studentId]?.comments ?? null;

      return {
        school_id: profile.school_id,
        student_id: studentId,
        grade_item_id: selectedGradeItemId,
        score: currentScore,
        comments: currentComments,
      };
    });

    const { error } = await supabase
      .from('student_grades')
      .upsert(rows, { onConflict: 'student_id,grade_item_id' });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Calificaciones guardadas');
    queryClient.invalidateQueries({ queryKey: ['existing-grades', selectedGradeItemId] });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Captura de calificaciones</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Grupo y materia</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={selectedAssignmentId}
            onChange={(e) => {
              setSelectedAssignmentId(e.target.value);
              setSelectedGradeItemId('');
            }}
          >
            <option value="">Selecciona una asignación</option>
            {(assignments ?? []).map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.subjects?.name} - {a.groups?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rubro</label>
          <div className="flex gap-2">
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedGradeItemId}
              onChange={(e) => setSelectedGradeItemId(e.target.value)}
            >
              <option value="">Selecciona un rubro</option>
              {(gradeItems ?? []).map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.title} - {item.period} ({item.percentage}%)
                </option>
              ))}
            </select>

            <Button onClick={() => setShowItemModal(true)} disabled={!selectedAssignment}>
              Nuevo rubro
            </Button>
          </div>
        </div>
      </div>

      {selectedGradeItemId && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Alumno
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
              {(enrolledStudents ?? []).map((row: any) => {
                const student = row.students;
                const currentGrade = gradeMap[student.id]?.score ?? '';
                const currentComment = gradeMap[student.id]?.comments ?? '';

                return (
                  <tr key={student.id}>
                    <td className="px-4 py-2">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={
                          gradeDrafts[student.id] !== undefined
                            ? gradeDrafts[student.id]
                            : String(currentGrade)
                        }
                        onChange={(e) =>
                          setGradeDrafts((prev) => ({
                            ...prev,
                            [student.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={
                          commentsDrafts[student.id] !== undefined
                            ? commentsDrafts[student.id]
                            : currentComment
                        }
                        onChange={(e) =>
                          setCommentsDrafts((prev) => ({
                            ...prev,
                            [student.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="p-4 flex justify-end">
            <Button onClick={saveGrades}>Guardar calificaciones</Button>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Nuevo rubro de evaluación</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="tarea">Tarea</option>
                <option value="examen">Examen</option>
                <option value="proyecto">Proyecto</option>
                <option value="participacion">Participación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Periodo</label>
              <Input value={itemPeriod} onChange={(e) => setItemPeriod(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Porcentaje</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={itemPercentage}
                onChange={(e) => setItemPercentage(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowItemModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createGradeItem} disabled={!itemTitle}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}