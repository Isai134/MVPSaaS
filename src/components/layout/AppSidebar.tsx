import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  Trophy,
  Megaphone,
  User,
  LogOut,
  Calendar,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/supabase';

type SidebarItem = {
  label: string;
  to: string;
  roles: AppRole[];
  icon: React.ComponentType<{ className?: string }>;
};

const sidebarItems: SidebarItem[] = [
  {
    label: 'Panel',
    to: '/dashboard',
    // El panel debe ser visible solo para administradores y superiores
    roles: ['super_admin', 'directivo', 'administrativo'],
    icon: LayoutDashboard,
  },
  {
    label: 'Escuelas',
    to: '/schools',
    roles: ['super_admin', 'directivo'],
    icon: School,
  },
  {
    label: 'Alumnos',
    to: '/students',
    roles: ['super_admin', 'directivo', 'administrativo'],
    icon: Users,
  },
  {
    label: 'Pagos',
    to: '/payments',
    roles: ['super_admin', 'directivo', 'administrativo'],
    icon: CreditCard,
  },
  {
    label: 'Materias',
    to: '/subjects',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor'],
    icon: BookOpen,
  },
  {
    label: 'Captura de calificaciones',
    to: '/teacher-grades',
    roles: ['super_admin', 'directivo', 'profesor'],
    icon: FileText,
  },
  {
    label: 'Mis calificaciones',
    to: '/student-grades',
    roles: ['alumno', 'padre'],
    icon: Trophy,
  },
  {
    label: 'Anuncios',
    to: '/announcements',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre'],
    icon: Megaphone,
  },
  {
    label: 'Perfil',
    to: '/profile',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre'],
    icon: User,
  },
  // Nuevo item de horario accesible solo por administradores
  {
    label: 'Horario',
    to: '/schedule',
    roles: ['super_admin', 'directivo', 'administrativo'],
    icon: CalendarClock,
  },
  // Calendario escolar accesible solo por administradores
  {
    label: 'Calendario escolar',
    to: '/calendar',
    roles: ['super_admin', 'directivo', 'administrativo'],
    icon: Calendar,
  },
];

export default function AppSidebar() {
  const linkBaseClasses =
    'flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-slate-50 hover:shadow-sm';

  const { roles, signOut } = useAuth();

  const visibleItems = sidebarItems.filter((item) =>
    item.roles.some((role) => roles.includes(role))
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 p-4 space-y-2 shadow-lg">
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkBaseClasses} ${
                  isActive
                    ? 'bg-slate-100 text-slate-700 font-semibold shadow-md border border-slate-200/50'
                    : 'text-gray-700'
                }`
              }
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200/50">
        <button
          onClick={handleSignOut}
          className={`${linkBaseClasses} w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}