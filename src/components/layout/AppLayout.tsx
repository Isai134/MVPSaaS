import React from 'react';
import { Outlet } from 'react-router-dom';

import AppSidebar from './AppSidebar';

/**
 * AppLayout composes the sidebar with the main content area.  The
 * `<Outlet />` from react‑router will render the child route
 * components inside the main area.  This layout ensures a consistent
 * navigation experience across all protected pages of the SaaS.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
