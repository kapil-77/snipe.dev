import { ModuleGrid } from '@/shell/ModuleGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Feature grid = the module catalogue. Cards are built from the shared
 * module registry so "coming soon → live" is purely additive data.
 */
export function LandingFeatures() {
  return (
    <section id="modules" aria-labelledby="modules-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-16 md:px-8 md:py-20 lg:px-12">
        <Reveal>
          <SectionHeading
            id="modules-heading"
            eyebrow="modules"
            title="One module, one schema, one gate."
            subtitle="Every tool is a sealed module: its own Postgres schema, its own edge
              functions, its own RLS policies. Shared auth is the only common surface."
          />
        </Reveal>
        <ModuleGrid />
      </div>
    </section>
  );
}