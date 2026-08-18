import { Boxes, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { MODULES } from '@/lib/module-registry';

interface SidebarProps {
  /** Workspace-wide: collapsed to an icon rail on md+. */
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  /** Mobile overlay state. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Collapsible module list — every module the auth session owns.
 * Collapsed state turns it into an icon rail; on <md it becomes an overlay.
 */
export function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const rail = (
    <>
      <div
        className={cn(
          'flex h-12 items-center border-b border-dashed border-line/40',
          collapsed ? 'justify-center px-0' : 'justify-between px-4',
        )}
      >
        {!collapsed && (
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            <Boxes className="size-3.5 text-accent" aria-hidden="true" />
            Modules
          </span>
        )}
        <button
          type="button"
          onClick={() => onCollapse(!collapsed)}
          className="hidden p-1 text-muted transition-colors duration-200 ease-out hover:text-ink md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          className="p-1 text-muted transition-colors duration-200 ease-out hover:text-ink md:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav aria-label="Modules" className="flex flex-1 flex-col gap-1 px-2 py-3">
        {MODULES.map((module) => (
          <NavLink
            key={module.slug}
            to={`/app/modules/${module.slug}`}
            onClick={onMobileClose}
            title={collapsed ? module.name : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 border-l-2 py-2.5 text-sm transition-colors duration-200 ease-out',
                collapsed ? 'justify-center border-l-transparent px-0' : 'px-3',
                isActive
                  ? 'border-accent bg-white/[0.04] font-medium text-ink'
                  : 'border-l-transparent text-muted hover:bg-white/[0.03] hover:text-ink',
              )
            }
          >
            <module.icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate">{module.name}</span>
                <span
                  aria-hidden="true"
                  className={cn('size-1.5 shrink-0 rounded-full', module.status === 'live' ? 'bg-accent' : 'bg-faint/60')}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop rail/drawer */}
      <aside
        className={cn(
          'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col overflow-y-auto border-r border-dashed border-line/30 transition-[width] duration-200 ease-out md:flex',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {rail}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-abyss/70 backdrop-blur-[2px]"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-dashed border-line bg-base">
            {rail}
          </aside>
        </div>
      )}
    </>
  );
}