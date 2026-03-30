import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AppRole =
  | "super_admin"
  | "directivo"
  | "administrativo"
  | "profesor"
  | "alumno"
  | "padre";

type DocStatus = "pendiente" | "entregado" | "observaciones";

const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  observaciones: "Observaciones",
};

function StatusBadge({ status }: { status: DocStatus }) {
  // puedes ajustar variantes/clases a tu gusto
  if (status === "entregado") return <Badge variant="secondary">Entregado</Badge>;
  if (status === "observaciones") return <Badge variant="destructive">Obs.</Badge>;
  return <Badge variant="outline">Pendiente</Badge>;
}

export default function Documents() {
  const { roles, user } = useAuth();
  const qc = useQueryClient();

  const isStudent = roles.includes("alumno" as AppRole);
  const isStaff = roles.some((r) =>
    (["administrativo", "directivo", "super_admin"] as AppRole[]).includes(r as AppRole)
  );

  /** Lookups */
  const levelsQuery = useQuery({
    queryKey: ["doc-levels"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("id, name")
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const gradesQuery = useQuery({
    queryKey: ["doc-grades"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("id, name, level_id")
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["doc-groups"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, grade_id");
      if (error) throw error;
      return data ?? [];
    },
  });

  /** Student: get student + enrollment to know level */
  const studentContextQuery = useQuery({
    queryKey: ["doc-student-context", user?.id],
    enabled: !!user && isStudent,
    queryFn: async () => {
      if (!user) return null;

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!student) return null;

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(
          `id,
           group:groups!inner(
             id,
             name,
             grade:grades!inner(
               id,
               name,
               level:levels!inner(id, name)
             )
           )`
        )
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const enrollment = enrollments?.[0] as any;
      const levelId = enrollment?.group?.grade?.level?.id ?? null;

      return {
        studentId: student.id,
        levelId,
      };
    },
  });

  /** Requirements by level */
  const requirementsQuery = useQuery({
    queryKey: ["doc-requirements", studentContextQuery.data?.levelId],
    enabled: !!studentContextQuery.data?.levelId,
    queryFn: async () => {
      const levelId = studentContextQuery.data?.levelId;
      if (!levelId) return [];

      const { data, error } = await supabase
        .from("document_requirements")
        .select("id, name, is_required, level_id, order_index")
        .eq("level_id", levelId)
        .order("order_index");

      if (error) throw error;
      return data ?? [];
    },
  });

  /** Student docs */
  const studentDocsQuery = useQuery({
    queryKey: ["doc-student-docs", studentContextQuery.data?.studentId],
    enabled: !!studentContextQuery.data?.studentId,
    queryFn: async () => {
      const studentId = studentContextQuery.data?.studentId;
      if (!studentId) return [];

      const { data, error } = await supabase
        .from("student_documents")
        .select("id, student_id, requirement_id, status, notes, verified_at, verified_by")
        .eq("student_id", studentId);

      if (error) throw error;
      return data ?? [];
    },
  });

  /** Admin filters */
  const [levelId, setLevelId] = useState<string>("");
  const [gradeId, setGradeId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  const filteredGrades = useMemo(() => {
    if (!levelId) return gradesQuery.data ?? [];
    return (gradesQuery.data ?? []).filter((g: any) => g.level_id === levelId);
  }, [gradesQuery.data, levelId]);

  const filteredGroups = useMemo(() => {
    if (!gradeId) return groupsQuery.data ?? [];
    return (groupsQuery.data ?? []).filter((g: any) => g.grade_id === gradeId);
  }, [groupsQuery.data, gradeId]);

  const adminRequirementsQuery = useQuery({
    queryKey: ["doc-admin-requirements", levelId],
    enabled: !!levelId && isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_requirements")
        .select("id, name, is_required, level_id, order_index")
        .eq("level_id", levelId)
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const groupStudentsQuery = useQuery({
    queryKey: ["doc-group-students", groupId],
    enabled: !!groupId && isStaff,
    queryFn: async () => {
      // students in selected group => via enrollments
      const { data, error } = await supabase
        .from("enrollments")
        .select(
          `id,
           student:students!inner(id, first_name, last_name, student_code),
           group_id`
        )
        .eq("group_id", groupId);

      if (error) throw error;

      const rows = (data ?? []).map((e: any) => e.student).filter(Boolean);
      // dedup by id
      const map = new Map<string, any>();
      rows.forEach((s: any) => map.set(s.id, s));
      return Array.from(map.values());
    },
  });

  const groupDocsQuery = useQuery({
    queryKey: ["doc-group-docs", groupStudentsQuery.data?.map((s: any) => s.id).join(",")],
    enabled: !!groupId && !!groupStudentsQuery.data?.length && isStaff,
    queryFn: async () => {
      const studentIds = (groupStudentsQuery.data ?? []).map((s: any) => s.id);
      if (!studentIds.length) return [];

      const { data, error } = await supabase
        .from("student_documents")
        .select("id, student_id, requirement_id, status")
        .in("student_id", studentIds);

      if (error) throw error;
      return data ?? [];
    },
  });

  /** Mutations */
  const markStudentDocMutation = useMutation({
    mutationFn: async (payload: { studentId: string; requirementId: string }) => {
      const { studentId, requirementId } = payload;

      // upsert: if exists update, else insert
      const existing = (groupDocsQuery.data ?? []).find(
        (d: any) => d.student_id === studentId && d.requirement_id === requirementId
      );

      if (existing) {
        const { error } = await supabase
          .from("student_documents")
          .update({ status: "entregado" as DocStatus, verified_at: new Date().toISOString(), verified_by: user?.id ?? null })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("student_documents").insert({
          student_id: studentId,
          requirement_id: requirementId,
          status: "entregado" as DocStatus,
          verified_at: new Date().toISOString(),
          verified_by: user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc-group-docs"] });
      qc.invalidateQueries({ queryKey: ["doc-student-docs"] });
    },
  });

  /** Student view computed */
  const studentDocByRequirement = useMemo(() => {
    const map = new Map<string, any>();
    (studentDocsQuery.data ?? []).forEach((d: any) => {
      if (d.requirement_id) map.set(d.requirement_id, d);
    });
    return map;
  }, [studentDocsQuery.data]);

  return (
    <AppLayout title="Documentos" description="Gestión y entrega de documentos">
      <div className="space-y-6 animate-fade-in">
        {isStudent && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-medium mb-3">Mis documentos</h3>

            {studentContextQuery.isLoading || requirementsQuery.isLoading || studentDocsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : (requirementsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay requisitos configurados para tu nivel.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Requerido</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(requirementsQuery.data ?? []).map((req: any) => {
                    const doc = studentDocByRequirement.get(req.id);
                    const status: DocStatus = (doc?.status ?? "pendiente") as DocStatus;

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell>{req.is_required ? "Sí" : "No"}</TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {isStaff && (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="text-lg font-medium">Control de documentos (Administración)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Nivel</label>
                <Select value={levelId} onValueChange={(v) => { setLevelId(v); setGradeId(""); setGroupId(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {(levelsQuery.data ?? []).map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Grado</label>
                <Select value={gradeId} onValueChange={(v) => { setGradeId(v); setGroupId(""); }} disabled={!levelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGrades.map((g: any) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Grupo</label>
                <Select value={groupId} onValueChange={setGroupId} disabled={!gradeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGroups.map((g: any) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!groupId ? (
              <p className="text-sm text-muted-foreground">Selecciona un grupo para ver alumnos.</p>
            ) : groupStudentsQuery.isLoading || adminRequirementsQuery.isLoading || groupDocsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : (groupStudentsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay alumnos en este grupo.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground">
                    Alumnos: <span className="font-medium text-foreground">{groupStudentsQuery.data.length}</span>
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alumno</TableHead>
                      {(adminRequirementsQuery.data ?? []).map((req: any) => (
                        <TableHead key={req.id} className="whitespace-nowrap">
                          {req.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {(groupStudentsQuery.data ?? []).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {s.first_name} {s.last_name}
                          <div className="text-xs text-muted-foreground">{s.student_code ?? ""}</div>
                        </TableCell>

                        {(adminRequirementsQuery.data ?? []).map((req: any) => {
                          const doc = (groupDocsQuery.data ?? []).find(
                            (d: any) => d.student_id === s.id && d.requirement_id === req.id
                          );
                          const status: DocStatus = (doc?.status ?? "pendiente") as DocStatus;

                          return (
                            <TableCell key={req.id} className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={status} />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={markStudentDocMutation.isPending}
                                  onClick={() =>
                                    markStudentDocMutation.mutate({ studentId: s.id, requirementId: req.id })
                                  }
                                >
                                  Marcar
                                </Button>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <p className="text-xs text-muted-foreground">
                  Nota: “Marcar” hace upsert en <code>student_documents</code> con estado “entregado”.
                </p>
              </div>
            )}
          </div>
        )}

        {!isStudent && !isStaff && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              No tienes permisos para ver esta sección.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
