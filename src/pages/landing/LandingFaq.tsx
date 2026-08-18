import type { ReactNode } from 'react';

import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

function Code({ children }: { children: string }) {
  return (
    <code className="border border-line px-1 py-0.5 text-xs text-accent-bright">{children}</code>
  );
}

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: 'what',
    question: 'What is snipe.dev?',
    answer: (
      <p>
        A workspace of developer tools — onboarding checklists, pull-request gates and
        environment sync — assembled from one codebase. Each tool is a self-contained{' '}
        <Code>module_*</Code> schema with its own edge functions.
      </p>
    ),
  },
  {
    id: 'isolation',
    question: 'How strict is the per-module isolation?',
    answer: (
      <p>
        Strict at the database layer. Modules live in separate Postgres schemas, share no
        tables, and only reach back to <Code>public.users</Code> and <Code>public.orgs</Code>.
        RLS is enabled from the first migration.
      </p>
    ),
  },
  {
    id: 'auth',
    question: 'Do all modules share one login?',
    answer: (
      <p>
        Yes. Supabase Auth — email or GitHub OAuth — is shared across the suite. A single
        session unlocks the whole workspace; each module still enforces its own policies.
      </p>
    ),
  },
  {
    id: 'waitlist',
    question: 'Why are some modules “coming soon”?',
    answer: (
      <p>
        Building to the isolation spec takes deliberate scaffolding. Every module on this
        page already ships its schema, RLS stub and edge functions — flipping a module live
        is additive, not a rewrite. The waitlist sets priority.
      </p>
    ),
  },
  {
    id: 'self-host',
    question: 'Can we self-host?',
    answer: (
      <p>
        The shell is a plain Vite + React + Tailwind app and the backend runs on Supabase —
        point the client at your own project and the migrations in this repo set up every
        schema. Pro orgs can request a deployment guide.
      </p>
    ),
  },
  {
    id: 'data',
    question: 'What happens to our data?',
    answer: (
      <p>
        Each module touches only its own tables, scoped to your org and user id. Shared
        profile and membership rows live in the single <Code>public</Code> schema. Delete an
        org and cascades clean its modules.
      </p>
    ),
  },
];

export function LandingFaq() {
  const subtitle: ReactNode = (
    <>
      Need more help?{' '}
      <a
        href="mailto:help@snipe.dev"
        className="text-muted underline underline-offset-2 transition-colors duration-200 ease-out hover:text-white"
      >
        Contact us
      </a>
      .
    </>
  );

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-14 sm:py-16 md:px-8 md:py-20 lg:px-12">
        <Reveal>
          <SectionHeading id="faq-heading" eyebrow="faq" title="Frequently asked questions" subtitle={subtitle} />
        </Reveal>
        <Reveal delay={80}>
          <Accordion items={FAQ_ITEMS} />
        </Reveal>
      </div>
    </section>
  );
}