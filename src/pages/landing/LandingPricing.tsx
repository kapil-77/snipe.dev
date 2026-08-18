import { Check } from 'lucide-react';

import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const PLANS = [
  {
    name: 'Developer',
    price: '0',
    cadence: 'forever',
    description: 'Everything you need to pilot a module on a small team.',
    cta: 'Join the waitlist',
    highlight: false,
    features: [
      '1 active module per workspace',
      '3 team members included',
      'Per-module schema + RLS, ready from day one',
      'Shared auth — email or GitHub OAuth',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '12',
    cadence: '/ user / month',
    description: 'Unlock every module for your whole org, with priority shipping.',
    cta: 'Get early access',
    highlight: true,
    features: [
      'All modules — current + future',
      'Unlimited members, org-scoped roles',
      'GitHub org SSO + audit log',
      'Priority lane for new module releases',
      'Dedicated support with SLA',
    ],
  },
] as const;

/** Pricing — free / pro cards in the blueprint framing (no dollar signs, no €). */
export function LandingPricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-16 md:px-8 md:py-20 lg:px-12">
        <Reveal>
          <SectionHeading
            id="pricing-heading"
            eyebrow="pricing"
            title="Start free. Scale when you ship."
            subtitle="Every module ships free first; Pro unlocks the full workspace. No ads, no surprise line items."
          />
        </Reveal>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 90} className="h-full">
              <Card
                hover={false}
                className={plan.highlight ? 'shadow-accent-glow' : undefined}
              >
                <div className="flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold tracking-tight text-white">{plan.name}</h3>
                    {plan.highlight && (
                      <span className="border border-accent/40 bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-bright">
                        popular
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-white">${plan.price}</span>
                    <span className="text-sm text-faint">{plan.cadence}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{plan.description}</p>

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-dashed border-line/40 pt-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a href="/#modules" className={buttonClasses(plan.highlight ? 'primary' : 'outline', 'md', 'mt-7 w-full')}>
                    {plan.cta}
                  </a>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}