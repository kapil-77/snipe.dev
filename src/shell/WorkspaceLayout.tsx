import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

/**
 * Authenticated workspace frame: fixed navbar + collapsible module sidebar
 * + routed module content. Used for every `/app/*` route.
 */
export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1 px-6 pb-20 pt-[4.5rem] md:px-8 lg:px-12">
          <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 items-center gap-2 border border-line px-3 text-sm text-muted transition-colors duration-200 ease-out hover:text-ink"
            >
              <Menu className="size-4" aria-hidden="true" /> Modules
            </button>
            <span className="text-xs text-faint">{pathname}</span>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}