import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

/*
 * Testimonial carousel — ossium-style: a ripple of overlapping avatar
 * "tabs" + one visible quote. Auto-advances and respects manual taps.
 * PLACEHOLDER quotes — replace with real builder feedback.
 */
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    handle: '@priya_builds',
    role: 'Staff Engineer · Clockwork',
    avatar: 'https://i.pravatar.cc/100?img=47',
    quote:
      'Having each tool behind its own schema and RLS made the security review a one-tab conversation. Onboarding is a checklist I actually trust.',
  },
  {
    name: 'Daniel Okoye',
    handle: '@dan_o',
    role: 'Founding Eng · Nimbus',
    avatar: 'https://i.pravatar.cc/100?img=12',
    quote:
      'The merge gates caught a broken migration before it hit staging. It pays for itself in the first week.',
  },
  {
    name: 'Marta Kozłowska',
    handle: '@mk_dev',
    role: 'Platform Lead · Tracepath',
    avatar: 'https://i.pravatar.cc/100?img=32',
    quote:
      'Envsync ended our .env archaeology. One declared map, encrypted values everywhere else.',
  },
  {
    name: 'Tomás Ferreira',
    handle: '@tferreira',
    role: 'Tech Lead · Basalt',
    avatar: 'https://i.pravatar.cc/100?img=68',
    quote:
      'Every new hire reaches a first merged PR inside their first week — because the runbook lives next to the repo.',
  },
  {
    name: 'Aisha Bello',
    handle: '@aisha_codes',
    role: 'DevEx Engineer · Greyrock',
    avatar: 'https://i.pravatar.cc/100?img=25',
    quote:
      'It feels like three vendors worth of devtools on one shared login, each behind its own drawbridge.',
  },
];

const AUTOPLAY_MS = 6000;

export function LandingTestimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % TESTIMONIALS.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = TESTIMONIALS[active];

  function go(delta: number) {
    setActive((value) => (value + delta + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="scroll-mt-20"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-16 md:px-8 md:py-20 lg:px-12">
        <Reveal>
          <SectionHeading
            id="testimonials-heading"
            eyebrow="testimonials"
            title="What builders are saying"
            subtitle="Real feedback from teams shipping on the workspace."
          />
        </Reveal>

        <div className="mb-8 flex justify-center px-2">
          <ul
            role="tablist"
            aria-label="Team testimonials"
            className="relative z-10 flex flex-wrap items-center justify-center pl-1.5"
          >
            {TESTIMONIALS.map((item, index) => (
              <li key={item.handle} className="-ml-2 first:ml-0" style={{ zIndex: TESTIMONIALS.length - index }}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === index}
                  aria-controls="testimonial-panel"
                  id={`testimonial-tab-${index}`}
                  title={`${item.name} (${item.handle})`}
                  aria-label={`Show quote from ${item.name}`}
                  onClick={() => setActive(index)}
                  className={cn(
                    'block size-9 overflow-hidden rounded-full border-2 transition-[box-shadow,transform,opacity] duration-200 ease-out sm:size-10',
                    'hover:z-50 hover:scale-110 hover:shadow-md hover:shadow-black/40',
                    active ? 'border-accent' : 'border-base opacity-70 hover:opacity-100',
                  )}
                >
                  <img
                    src={item.avatar}
                    alt={`Portrait of ${item.name}`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
<Reveal className="mx-auto w-full max-w-2xl">
          <Frame className="w-full">
            <figure
              id="testimonial-panel"
              key={active}
              role="tabpanel"
              className="animate-fadein p-6 sm:p-8"
              aria-labelledby={`testimonial-tab-${active}`}
            >
              <blockquote className="text-balance text-base leading-relaxed text-ink sm:text-lg">
                “{current.quote}”
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center gap-3 border-t border-dashed border-line/40 pt-5">
                <img
                  src={current.avatar}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-edge object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">
                    {current.name} <span className="font-normal text-faint">{current.handle}</span>
                  </div>
                  <div className="truncate text-xs text-faint">{current.role}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous testimonial"
                    className="grid size-8 place-items-center border border-edge text-muted transition-colors duration-200 ease-out hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next testimonial"
                    className="grid size-8 place-items-center border border-edge text-muted transition-colors duration-200 ease-out hover:border-accent hover:text-accent"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </figcaption>
            </figure>
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}