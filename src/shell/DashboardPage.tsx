import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/auth';
import { buttonClasses } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { MODULES } from '@/lib/module-registry';

import { ModuleGrid } from './ModuleGrid';

/**
 * Workspace home — module overview grid. Mirrors the landing "Features"
 * section but framed by the workspace layout.
 */
export function DashboardPage() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="workspace"
            title={<>All modules, one session.</>}
            subtitle={
              <>
                Signed in as{' '}
                <span className="text-ink">{session?.user.email ?? 'demo user'}</span>. Each
                module below owns its own schema, edge functions and RLS policies —
                shared auth is the only cross-module surface.
              </>
            }
          />
          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className={buttonClasses('ghost', 'sm')}
            >
              Sign out
            </button>
            <Link to="/" className={buttonClasses('ghost', 'sm')}>
              ← Landing
            </Link>
          </div>
        </div>
      </Reveal>

      <ModuleGrid />

      <Reveal className="mt-10">
        <p className="text-xs text-faint">
          {MODULES.filter((m) => m.status === 'live').length} of {MODULES.length} modules
          currently live — the rest are scaffolded and gated behind the waitlist.
        </p>
      </Reveal>
    </div>
  );
}