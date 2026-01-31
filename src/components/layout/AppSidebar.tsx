import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  CreditCard, 
  FileText, 
  BarChart3,
  Settings,
  Bell,
  BookOpen,
  Calendar,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'directivo', 'administrativo'] },
  { name: 'Alumnos', href: '/students', icon: Users, roles: ['super_admin', 'directivo', 'administrativo', 'profesor'] },
  { name: 'Pagos', href: '/payments', icon: CreditCard, roles: ['super_admin', 'directivo', 'administrativo'] },
  { name: 'Calificaciones', href: '/grades', icon: GraduationCap, roles: ['super_admin', 'directivo', 'profesor', 'alumno', 'padre'] },
  { name: 'Documentos', href: '/documents', icon: FileText, roles: ['super_admin', 'directivo', 'administrativo'] },
  { name: 'Materias', href: '/subjects', icon: BookOpen, roles: ['super_admin', 'directivo'] },
  { name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['super_admin', 'directivo', 'administrativo'] },
  { name: 'Avisos', href: '/announcements', icon: Bell, roles: ['super_admin', 'directivo', 'administrativo'] },
  { name: 'Ciclos', href: '/academic-years', icon: Calendar, roles: ['super_admin', 'directivo'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['super_admin', 'directivo'] },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.some(role => roles.includes(role as any))
  );

  const initials = profile 
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">EscuelaPro</span>
            <span className="text-xs text-sidebar-foreground/60">Gestión Escolar</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'nav-item',
                  isActive ? 'nav-item-active' : 'nav-item-inactive'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 px-3 py-2 h-auto hover:bg-sidebar-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60 truncate w-full">
                    {profile?.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
