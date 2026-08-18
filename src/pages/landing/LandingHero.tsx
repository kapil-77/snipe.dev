import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { MODULES } from '@/lib/module-registry';

/**
 * Landing hero — headline, dual CTA, then a dashed-framed "workspace"
 * mock whose four "+" corners tie it to the blueprint aesthetic.
 */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(720px_420px_at_72%_-12%,rgba(9,174,91,0.09),transparent)]"
      />

      <div className="mx-auto w-full max-w-[1280px] px-6 pb-16 md:px-8 lg:px-12">
        <div className="relative flex flex-col items-center pb-16 pt-20 sm:pt-24 md:pt-32">
          <Reveal>
            <span className="inline-flex items-center gap-2 border border-edge bg-base px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              <span aria-hidden="true" className="size-1.5 animate-blink rounded-full bg-accent" />
              snipe.dev · dev-tools suite
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-7 max-w-3xl text-balance text-center text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Dev tools that ship as{' '}
              <span className="text-accent">sealed modules</span>.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-center text-base leading-relaxed text-muted sm:text-lg">
              Onboard engineers, gate pull requests, sync environments. Each tool owns its
              schema, edge functions and RLS boundary — one login, zero cross-contamination,
              additive by design.
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/#modules" className={buttonClasses('primary', 'lg')}>
                Browse modules
              </Link>
              <Link to="/login" className={buttonClasses('outline', 'lg')}>
                Log in with GitHub
              </Link>
            </div>
            <p className="mt-6 text-center text-xs text-faint">
              free tier · email or GitHub OAuth · no credit card
            </p>
          </Reveal>
        </div>

        <Reveal delay={380} className="relative mx-auto w-full max-w-[1120px]">
          <Frame className="w-full">
            <div className="relative overflow-hidden bg-surface/40">
              <div className="flex items-center justify-between border-b border-dashed border-line/40 px-5 py-3">
                <span className="text-sm font-semibold text-ink">~/workspace</span>
                <span className="hidden text-xs text-faint sm:block">
                  auth.session <span className="text-accent">ready</span>
                </span>
              </div>

              <div className="bg-schematic grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
                {MODULES.map((module) => (
                  <div
                    key={module.slug}
                    className="flex min-w-0 flex-col justify-between gap-4 border border-line/50 bg-abyss/70 p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <module.icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full ${module.status === 'live' ? 'bg-accent' : 'animate-blink bg-faint'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink sm:text-sm">
                        {module.name}
                      </p>
                      <p className="mt-0.5 hidden truncate text-[11px] text-faint sm:block">
                        {module.schema}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}