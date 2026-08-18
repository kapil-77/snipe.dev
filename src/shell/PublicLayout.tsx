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
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
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