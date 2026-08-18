import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';
import { MODULES, type ModuleDef } from '@/lib/module-registry';

import { ModuleCard } from './ModuleCard';

interface ModuleGridProps {
  modules?: ModuleDef[];
  className?: string;
}

/** Responsive landing/workspace grid with staggered reveal. */
export function ModuleGrid({ modules = MODULES, className }: ModuleGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {modules.map((module, index) => (
        <Reveal key={module.slug} delay={(index % 3) * 80} className="h-full">
          <ModuleCard module={module} />
        </Reveal>
      ))}
    </div>
  );
}