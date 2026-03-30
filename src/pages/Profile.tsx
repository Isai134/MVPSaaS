import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AppRole =
  | "super_admin"
  | "directivo"
  | "administrativo"
  | "profesor"
  | "alumno"
  | "padre";

const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  directivo: "Directivo",
  administrativo: "Administrativo",
  profesor: "Profesor",
  alumno: "Alumno",
  padre: "Padre",
};

interface StudentInfo {
  studentId: string;
  studentCode: string | null;
  status: string;
  levelName?: string | null;
  gradeName?: string | null;
  groupName?: string | null;
  average?: number | null;
}

interface AssignmentInfo {
  id: string;
  subjectName?: string | null;
  levelName?: string | null;
  gradeName?: string | null;
  groupName?: string | null;
}

export default function Profile() {
  const { profile, roles, user } = useAuth();

  const isStudent = roles.includes("alumno" as AppRole);
  const isTeacherOrStaff = roles.some((r) =>
    (["profesor", "administrativo", "directivo", "super_admin"] as AppRole[]).includes(
      r as AppRole
    )
  );

  const studentQuery = useQuery({
    queryKey: ["profile-student-info", user?.id],
    enabled: !!user && isStudent,
    staleTime: 1000 * 60,
    queryFn: async (): Promise<StudentInfo | null> => {
      if (!user) return null;

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, student_code, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (studentError || !student) return null;

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(
          `id,
           group:groups!inner (
             id,
             name,
             grade:grades!inner (
               id,
               name,
               level:levels!inner (
                 id,
                 name
               )
             )
           )`
        )
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const enrollment = enrollments?.[0];
      const levelName = (enrollment as any)?.group?.grade?.level?.name ?? null;
      const gradeName = (enrollment as any)?.group?.grade?.name ?? null;
      const groupName = (enrollment as any)?.group?.name ?? null;

      const { data: grades } = await supabase
        .from("student_grades")
        .select("score")
        .eq("student_id", student.id);

      const scores = (grades ?? [])
        .map((g: any) => g.score)
        .filter((s: any): s is number => typeof s === "number");

      const average =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

      return {
        studentId: student.id,
        studentCode: student.student_code,
        status: student.status,
        levelName,
        gradeName,
        groupName,
        average,
      };
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["profile-assignments", user?.id],
    enabled: !!user && isTeacherOrStaff,
    staleTime: 1000 * 60,
    queryFn: async (): Promise<AssignmentInfo[]> => {
      if (!user) return [];

      const { data: assignments } = await supabase
        .from("teacher_assignments")
        .select(
          `id,
           subject:subjects(name),
           group:groups!inner (
             id,
             name,
             grade:grades!inner (
               id,
               name,
               level:levels!inner (
                 id,
                 name
               )
             )
           )`
        )
        .eq("teacher_user_id", user.id);

      return (assignments ?? []).map((a: any) => ({
        id: a.id,
        subjectName: a.subject?.name ?? null,
        levelName: a.group?.grade?.level?.name ?? null,
        gradeName: a.group?.grade?.name ?? null,
        groupName: a.group?.name ?? null,
      }));
    },
  });

  const roleBadges = useMemo(() => {
    return (roles as AppRole[]).map((role) => (
      <Badge key={role} variant="secondary" className="text-xs font-medium mr-1">
        {ROLE_LABEL[role] ?? role}
      </Badge>
    ));
  }, [roles]);

  return (
    <AppLayout title="Mi Perfil" description="Información y datos personales">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.first_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {profile?.first_name?.[0]}
              {profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-semibold">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {profile?.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
            <div className="mt-2 flex flex-wrap gap-1">{roleBadges}</div>
          </div>
        </div>

        {isStudent && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-2">Datos del Alumno</h3>

            {studentQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando datos del alumno…</p>
            ) : studentQuery.data ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Matrícula:</span>{" "}
                  {studentQuery.data.studentCode ?? "N/D"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Nivel:</span> {studentQuery.data.levelName ?? "N/D"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Grado:</span> {studentQuery.data.gradeName ?? "N/D"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Grupo:</span> {studentQuery.data.groupName ?? "N/D"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Promedio general:</span>{" "}
                  {studentQuery.data.average !== null
                    ? studentQuery.data.average.toFixed(2)
                    : "N/D"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No se encontró información académica.</p>
            )}
          </div>
        )}

        {isTeacherOrStaff && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-2">Asignaciones</h3>

            {assignmentsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando asignaciones…</p>
            ) : assignmentsQuery.data?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Grupo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentsQuery.data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.subjectName ?? "—"}</TableCell>
                      <TableCell>{a.levelName ?? "—"}</TableCell>
                      <TableCell>{a.gradeName ?? "—"}</TableCell>
                      <TableCell>{a.groupName ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No tienes asignaciones registradas.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
