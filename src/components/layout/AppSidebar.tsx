import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/supabase';

type SidebarItem = {
  label: string;
  to: string;
  roles: AppRole[];
};

const sidebarItems: SidebarItem[] = [
  {
    label: 'Panel',
    to: '/dashboard',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre'],
  },
  {
    label: 'Escuelas',
    to: '/schools',
    roles: ['super_admin', 'directivo'],
  },
  {
    label: 'Alumnos',
    to: '/students',
    roles: ['super_admin', 'directivo', 'administrativo'],
  },
  {
    label: 'Pagos',
    to: '/payments',
    roles: ['super_admin', 'directivo', 'administrativo'],
  },
  {
    label: 'Materias',
    to: '/subjects',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor'],
  },
  {
    label: 'Captura de calificaciones',
    to: '/teacher-grades',
    roles: ['super_admin', 'directivo', 'profesor'],
  },
  {
    label: 'Mis calificaciones',
    to: '/student-grades',
    roles: ['alumno', 'padre'],
  },
  {
    label: 'Anuncios',
    to: '/announcements',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre'],
  },
  {
    label: 'Perfil',
    to: '/profile',
    roles: ['super_admin', 'directivo', 'administrativo', 'profesor', 'alumno', 'padre'],
  },
];

export default function AppSidebar() {
  const linkBaseClasses =
    'block px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100';

  const { roles } = useAuth();

  const visibleItems = sidebarItems.filter((item) =>
    item.roles.some((role) => roles.includes(role))
  );

  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-4 space-y-2">
      <nav className="space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? 'bg-gray-100 font-semibold' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}