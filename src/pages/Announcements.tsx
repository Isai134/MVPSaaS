import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type AppRole =
  | "super_admin"
  | "directivo"
  | "administrativo"
  | "profesor"
  | "alumno"
  | "padre";

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
  author_id: string | null;
  target_groups: string[] | null;
  target_levels: string[] | null;
}

export default function Announcements() {
  const { roles, user } = useAuth();
  const qc = useQueryClient();

  const isStudent = roles.includes("alumno" as AppRole);
  const isStaff = roles.some((r) =>
    (["profesor", "administrativo", "directivo", "super_admin"] as AppRole[]).includes(
      r as AppRole
    )
  );

  const levelsQuery = useQuery({
    queryKey: ["levels"],
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

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(
          `id,
           name,
           grade:grades!inner(
             id,
             name,
             level:levels!inner(id, name)
           )`
        )
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const studentEnrollmentQuery = useQuery({
    queryKey: ["announcements-student-info", user?.id],
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
      return {
        levelId: enrollment?.group?.grade?.level?.id ?? null,
        groupId: enrollment?.group?.id ?? null,
      };
    },
  });

  const readsQuery = useQuery({
    queryKey: ["announcement-reads", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.announcement_id);
    },
  });

  const announcementsQuery = useQuery({
    queryKey: ["announcements-list"],
    staleTime: 1000 * 60,
    queryFn: async (): Promise<AnnouncementRow[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AnnouncementRow[];
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleLevel = (id: string) =>
    setSelectedLevels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleGroup = (id: string) =>
    setSelectedGroups((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");

      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        author_id: user.id,
        target_levels: selectedLevels.length ? selectedLevels : null,
        target_groups: selectedGroups.length ? selectedGroups : null,
        is_published: true,
        published_at: new Date().toISOString(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setExpiresAt("");
      setSelectedLevels([]);
      setSelectedGroups([]);
      qc.invalidateQueries({ queryKey: ["announcements-list"] });
    },
  });

  const markAsRead = async (announcementId: string) => {
    if (!user) return;
    const already = (readsQuery.data ?? []).includes(announcementId);
    if (already) return;

    const { error } = await supabase.from("announcement_reads").insert({
      announcement_id: announcementId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    });

    if (!error) {
      qc.invalidateQueries({ queryKey: ["announcement-reads", user.id] });
    }
  };

  const studentAnnouncements = useMemo(() => {
    if (!isStudent || !announcementsQuery.data) return [];
    const { levelId, groupId } = studentEnrollmentQuery.data ?? ({} as any);

    return announcementsQuery.data.filter((a) => {
      if (a.expires_at && new Date(a.expires_at) < new Date()) return false;

      const levelOk =
        !a.target_levels?.length || (levelId && a.target_levels.includes(levelId));
      const groupOk =
        !a.target_groups?.length || (groupId && a.target_groups.includes(groupId));

      // “general” => target_levels null/[] y target_groups null/[]
      return levelOk && groupOk;
    });
  }, [announcementsQuery.data, isStudent, studentEnrollmentQuery.data]);

  return (
    <AppLayout title="Avisos" description="Comunicados y anuncios institucionales">
      <div className="space-y-8 animate-fade-in">
        {isStaff && (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="text-lg font-medium">Publicar aviso</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contenido</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de expiración</label>
                <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Niveles</label>
                  {levelsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando…</p>
                  ) : (
                    (levelsQuery.data ?? []).map((lvl: any) => (
                      <label key={lvl.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={selectedLevels.includes(lvl.id)}
                          onCheckedChange={() => toggleLevel(lvl.id)}
                        />
                        <span className="text-sm">{lvl.name}</span>
                      </label>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Grupos</label>
                  {groupsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando…</p>
                  ) : (
                    (groupsQuery.data ?? []).map((grp: any) => (
                      <label key={grp.id} className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={selectedGroups.includes(grp.id)}
                          onCheckedChange={() => toggleGroup(grp.id)}
                        />
                        <span className="text-sm">
                          {grp.name} - {grp.grade?.name ?? ""} ({grp.grade?.level?.name ?? ""})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <Button
                onClick={() => createAnnouncementMutation.mutate()}
                disabled={createAnnouncementMutation.isPending || !title.trim() || !content.trim()}
              >
                {createAnnouncementMutation.isPending ? "Publicando…" : "Publicar aviso"}
              </Button>
            </div>
          </div>
        )}

        {isStudent && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Avisos para ti</h3>

            {announcementsQuery.isLoading ||
            studentEnrollmentQuery.isLoading ||
            readsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando avisos…</p>
            ) : studentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay avisos disponibles.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Publicado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead className="w-20">Estado</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAnnouncements.map((ann) => {
                    const isUnread = !(readsQuery.data ?? []).includes(ann.id);
                    const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date();

                    return (
                      <TableRow key={ann.id} className="align-top">
                        <TableCell className="font-medium">
                          {ann.title}
                          {isUnread && (
                            <Badge variant="destructive" className="ml-2">
                              Nuevo
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {ann.published_at
                            ? format(new Date(ann.published_at), "dd/MM/yyyy")
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {ann.expires_at ? format(new Date(ann.expires_at), "dd/MM/yyyy") : "—"}
                        </TableCell>

                        <TableCell>
                          {isExpired ? (
                            <Badge variant="secondary" className="text-xs">
                              Expirado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Activo
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Simple: muestra contenido y marca como leído
                              alert(ann.content);
                              markAsRead(ann.id);
                            }}
                          >
                            Ver
                          </Button>
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Avisos publicados</h3>

            {announcementsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : announcementsQuery.data?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Publicado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Niveles (IDs)</TableHead>
                    <TableHead>Grupos (IDs)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcementsQuery.data.map((ann) => (
                    <TableRow key={ann.id} className="align-top">
                      <TableCell className="font-medium">{ann.title}</TableCell>
                      <TableCell>
                        {ann.published_at ? format(new Date(ann.published_at), "dd/MM/yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {ann.expires_at ? format(new Date(ann.expires_at), "dd/MM/yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {ann.target_levels?.length ? ann.target_levels.join(", ") : "Todos"}
                      </TableCell>
                      <TableCell>
                        {ann.target_groups?.length ? ann.target_groups.join(", ") : "Todos"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No hay avisos publicados.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
