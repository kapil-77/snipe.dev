import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/app/auth';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { label: 'Modules', href: '/#modules' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

/**
 * Fixed top bar: logo, section links, auth CTA. Mirrors ossium's
 * `bg-[#0E0F10]/80 + backdrop-blur` treatment.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/40 bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-6 md:px-8 lg:px-12">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors duration-200 ease-out hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link to="/app/modules" className={buttonClasses('outline', 'sm')}>
              Open workspace
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(buttonClasses('ghost', 'sm'), 'hidden sm:inline-flex')}
              >
                Log in
              </Link>
              <Link to="/login" className={buttonClasses('primary', 'sm')}>
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex p-2 text-muted transition-colors duration-200 ease-out hover:text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Primary (mobile)"
          className="border-t border-line/40 bg-base px-6 pb-5 pt-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded py-2.5 text-sm font-medium text-muted transition-colors duration-200 ease-out hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          {session?.user ? (
            <Link
              to="/app/modules"
              onClick={() => setOpen(false)}
              className="mt-3 w-full"
            >
              <Button variant="primary" className="w-full">Open workspace</Button>
            </Link>
          ) : (
            <div className="mt-3 flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="primary" className="w-full">Get started</Button>
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}