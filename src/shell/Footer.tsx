import { Link } from 'react-router-dom';

import { Divider } from '@/components/ui/Divider';
import { GithubMark } from '@/components/ui/GithubMark';
import { Logo } from '@/components/ui/Logo';
import { MODULES } from '@/lib/module-registry';
import { SITE_NAME } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Modules',
    links: MODULES.map((m) => ({ label: m.name, href: `/app/modules/${m.slug}` })),
  },
  {
    title: 'Product',
    links: [
      { label: 'Modules', href: '/#modules' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Testimonials', href: '/#testimonials' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'GitHub', href: 'https://github.com/snipe-dev' },
      { label: 'Edge functions', href: '/app/modules' },
      { label: 'Status', href: '/#modules' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-base">
      <Divider gap="sm" label={undefined} />
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-faint">
              Dev tools that ship as sealed modules — each with its own schema,
              edge functions and RLS boundary on shared auth.
            </p>
            <div className="mt-4 inline-flex h-6 items-center gap-1.5 border border-edge px-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <span aria-hidden="true" className="size-1.5 animate-blink rounded-full bg-accent" />
              all services online
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">
                {column.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted transition-colors duration-200 ease-out hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted transition-colors duration-200 ease-out hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line/40 pt-5 sm:flex-row sm:items-center">
          <p className="text-xs text-faint">© {year} {SITE_NAME}. All rights reserved.</p>
          <a
            href="https://github.com/kapil-77/snipe.dev"
            target="_blank"
            rel="noreferrer"
            aria-label="snipe.dev on GitHub"
            className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors duration-200 ease-out hover:text-ink"
          >
            <GithubMark className="size-3.5" /> follow the build
          </a>
        </div>
      </div>
    </footer>
  );
}