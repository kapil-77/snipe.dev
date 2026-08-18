import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';

export function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] justify-center px-6 py-24 md:px-8 md:py-36">
      <Frame className="w-full max-w-lg">
        <div className="bg-schematic flex flex-col items-center px-8 py-14 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            err_route_not_found
          </p>
          <h1 className="mt-4 text-6xl font-bold tracking-tight text-white">404</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            That module or page doesn&apos;t exist in this workspace. The schematic is intact
            — try a known route.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className={buttonClasses('primary', 'md')}>
              Back to the shell
            </Link>
            <Link to="/app/modules" className={buttonClasses('outline', 'md')}>
              Workspace
            </Link>
          </div>
        </div>
      </Frame>
    </section>
  );
}