import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Public page frame: fixed navbar + routed content (landing, auth pages).
 * Scrolls to top on navigation, keeping hash anchors intact.
 */
export function PublicLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Only well-formed "section" hashes are scroll targets (e.g. #modules,
    // #pricing, #faq). OAuth callbacks arrive as `#access_token=…&refresh_token=…`,
    // which is NOT a valid CSS selector — and `document.querySelector()` throws on
    // it, blanking the whole app before supabase-js can finish its handshake.
    const isSectionHash = /^#[A-Za-z_][A-Za-z0-9_-]*$/.test(hash);
    if (isSectionHash) {
      try {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch {
        // Malformed selector — fall through to scroll-to-top.
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}