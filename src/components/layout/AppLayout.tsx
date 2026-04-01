import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

import AppSidebar from './AppSidebar';

/**
 * AppLayout composes the sidebar with the main content area.  The
 * `<Outlet />` from react‑router will render the child route
 * components inside the main area.  This layout ensures a consistent
 * navigation experience across all protected pages of the SaaS.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduConnect
                </h1>
                <p className="text-sm text-gray-500">Plataforma Educativa</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Bienvenido a tu espacio de aprendizaje
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
