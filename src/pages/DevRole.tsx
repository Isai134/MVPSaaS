import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppRole } from "@/types/database";

const LS_KEY = "eduflow:devRoleOverride";

const ALL_ROLES: AppRole[] = [
  "super_admin",
  "directivo",
  "administrativo",
  "profesor",
  "alumno",
  "padre",
];

export default function DevRole() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AppRole>("alumno");

  const isDev = useMemo(() => import.meta.env.DEV, []);

  useEffect(() => {
    // Si ya había uno guardado, lo cargamos
    const saved = localStorage.getItem(LS_KEY) as AppRole | null;
    if (saved && ALL_ROLES.includes(saved)) setSelected(saved);
  }, []);

  const apply = () => {
    localStorage.setItem(LS_KEY, selected);
    // refresca para que el AuthContext lea el override y aplique roles
    window.location.href = "/dashboard";
  };

  const clear = () => {
    localStorage.removeItem(LS_KEY);
    window.location.href = "/dashboard";
  };

  if (!isDev) {
    // En producción lo ocultamos
    return (
      <AppLayout title="No disponible">
        <div className="py-10 text-muted-foreground">
          Esta herramienta sólo está disponible en modo desarrollo (import.meta.env.DEV).
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Switch de rol (modo demo)"
      description="Cambia tu rol visualmente sin Supabase. Útil para demos."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Volver
          </Button>
          <Button variant="destructive" onClick={clear}>
            Quitar override
          </Button>
        </div>
      }
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Selecciona un rol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={selected} onValueChange={(v) => setSelected(v as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={apply} className="w-full">
            Aplicar rol y entrar al dashboard
          </Button>

          <div className="text-sm text-muted-foreground">
            Se guarda en <code>localStorage</code> con la llave: <code>{LS_KEY}</code>.
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
