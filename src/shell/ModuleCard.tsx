import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WaitlistForm } from '@/components/ui/WaitlistForm';
import type { ModuleDef } from '@/lib/module-registry';

/*
 * Landing + workspace card for one module.
 * Coming-soon modules render greyed (muted card), a disabled-looking CTA
 * and an inline email waitlist; live modules deep-link into the workspace.
 */
export function ModuleCard({ module }: { module: ModuleDef }) {
  const comingSoon = module.status === 'coming-soon';
  const Icon = module.icon;

  return (
    <Card muted={comingSoon} className="flex flex-col">
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-10 shrink-0 place-items-center border border-line bg-raised text-ink">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <Badge tone={comingSoon ? 'muted' : 'accent'} dot>
            {comingSoon ? 'coming soon' : 'live'}
          </Badge>
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-white">{module.name}</h3>
        <p className="mt-0.5 text-xs text-faint">{module.handle}</p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{module.description}</p>

        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-dashed border-line/40 pt-3 text-[11px] text-faint">
          <div>
            <dt className="inline">schema</dt>
            <dd className="inline text-muted"> · {module.schema}</dd>
          </div>
          <div>
            <dt className="inline">edge</dt>
            <dd className="inline text-muted"> · {module.edgePrefix}*</dd>
          </div>
        </dl>

        <div className="mt-5">
          {comingSoon ? (
            <Button variant="outline" className="w-full" disabled>
              Closed for early access
            </Button>
          ) : (
            <Link
              to={`/app/modules/${module.slug}`}
              className={buttonClasses('primary', 'md', 'w-full')}
            >
              Open {module.name}
            </Link>
          )}
        </div>
        {comingSoon && (
          <div className="mt-3" aria-label={`Waitlist for ${module.name}`}>
            <WaitlistForm moduleId={module.slug} source="landing-card" />
          </div>
        )}
      </div>
    </Card>
  );
}