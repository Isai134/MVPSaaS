import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * AppSidebar renders the primary navigation for authenticated users.  It
 * uses `NavLink` from react‑router to automatically set the active
 * state on the current route.  Additional items can be added here
 * (e.g. Documents, Grades) as those pages are implemented.
 */
export default function AppSidebar() {
  const linkBaseClasses =
    'block px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100';
  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-4 space-y-2">
      <nav className="space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBaseClasses} ${isActive ? 'bg-gray-100 font-semibold' : ''}`
          }
        >
          Panel
        </NavLink>
        <NavLink
          to="/students"
          className={({ isActive }) =>
            `${linkBaseClasses} ${isActive ? 'bg-gray-100 font-semibold' : ''}`
          }
        >
          Alumnos
        </NavLink>
        <NavLink
          to="/payments"
          className={({ isActive }) =>
            `${linkBaseClasses} ${isActive ? 'bg-gray-100 font-semibold' : ''}`
          }
        >
          Pagos
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkBaseClasses} ${isActive ? 'bg-gray-100 font-semibold' : ''}`
          }
        >
          Perfil
        </NavLink>
      </nav>
    </aside>
  );
}
