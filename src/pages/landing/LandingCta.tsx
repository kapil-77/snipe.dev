import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { WaitlistForm } from '@/components/ui/WaitlistForm';
import { MODULES } from '@/lib/module-registry';

/**
 * Closing CTA band — blueprint-framed, before the footer.
 */
export function LandingCta() {
  return (
    <section aria-labelledby="cta-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-16 md:px-8 md:py-24 lg:px-12">
        <Reveal>
          <Frame className="w-full">
            <div className="bg-schematic flex flex-col items-center px-6 py-16 text-center sm:px-12 md:py-24">
              <span className="border border-edge bg-base px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                early access
              </span>
              <h2
                id="cta-heading"
                className="mt-6 max-w-2xl text-balance text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl"
              >
                Stand out from teams still running on <span className="text-accent">spreadsheet ops</span>.
              </h2>
              <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted sm:text-base">
                {MODULES.length} modules scaffolded, {MODULES.filter((m) => m.status === 'live').length}{' '}
                live today. Claim your spot on the waitlist — activation is a toggle, not a
                migration.
              </p>

              <div className="mt-9 flex w-full max-w-md flex-col items-center gap-3">
                <WaitlistForm moduleId={MODULES[0].slug} source="footer-cta" buttonLabel="Join waitlist" size="md" />
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link to="/login" className={buttonClasses('primary', 'md')}>
                  Log in with GitHub
                </Link>
                <Link to="/#modules" className={buttonClasses('ghost', 'md')}>
                  Browse the modules →
                </Link>
              </div>
            </div>
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}