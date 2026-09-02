import { CornerDownLeft, LayoutGrid, Search, type LucideIcon } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { MODULES } from '@/lib/module-registry';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------
 * Command palette - global Ctrl/Cmd+K quick navigation.
 *
 * Reuses MODULES (single source of truth) + react-router navigate, so no
 * route logic is duplicated. Keyboard driven: up/down/enter/esc plus
 * home/end. Follows the ARIA combobox + listbox dialog pattern.
 * -------------------------------------------------------------------- */
const NAV_ENTRIES = [
  { id: 'workspace', label: 'Workspace', desc: 'All modules, one session', to: '/app/modules', icon: LayoutGrid, group: 'Navigate', shortcut: 'g  m' },
  { id: 'landing', label: 'Landing', desc: 'Marketing site', to: '/', icon: Search, group: 'Navigate', shortcut: 'g  h' },
] as const;

interface PaletteItem {
  id: string;
  label: string;
  desc: string;
  to: string;
  icon: LucideIcon;
  group: string;
  shortcut?: string;
}

function buildItems(): PaletteItem[] {
  return [
    ...NAV_ENTRIES.map((n) => ({ ...n })),
    ...MODULES.map((m) => ({
      id: m.slug,
      label: m.name,
      desc: m.tagline,
      to: `/app/modules/${m.slug}`,
      icon: m.icon as LucideIcon,
      group: 'Modules',
      shortcut: m.status === 'live' ? 'g  ' + m.slug.charAt(0) : undefined,
    })),
  ];
}

const ALL_ITEMS: PaletteItem[] = buildItems();

function searchScore(item: PaletteItem, q: string): number {
  const hay = `${item.label} ${item.desc} ${item.group}`.toLowerCase();
  const query = q.toLowerCase().trim();
  if (!query) return 1;
  const idx = hay.indexOf(query);
  if (idx === -1) return -1;
  // Prefer label matches (weight by position) over description matches.
  const labelIdx = item.label.toLowerCase().indexOf(query);
  if (labelIdx === -1) return 10 + idx;
  return 100 - labelIdx;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    return ALL_ITEMS.map((item, index) => ({ item, score: searchScore(item, query), index }))
      .filter((r) => r.score > -1)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    restoreFocusRef.current?.focus?.();
  }, []);

  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  }, []);

  // Global shortcut: Cmd/Ctrl + K (and close with Esc).
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else openPalette();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, openPalette]);

  // Focus the search input on open; scroll active item into view.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  // Body scroll lock while open (avoids background scrolling on small screens).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function run(item: PaletteItem) {
    navigate(item.to);
    close();
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(results.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex]?.item;
      if (item) run(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // Keep Tab usable; do not trap the user.
      return;
    }
  }

  const visible = results;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] animate-palette-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-abyss/70 backdrop-blur-[2px]" />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="absolute inset-x-0 top-[12vh] mx-auto w-full max-w-xl animate-palette-pop rounded-md border border-line/50 bg-surface/95 p-0 shadow-accent-glow backdrop-blur-md"
          >
            {/* Input row */}
            <div className="flex items-center gap-2.5 border-b border-line/40 px-4 py-3">
              <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
              <input
                ref={inputRef}
                aria-label="Search commands"
                aria-controls="snipe-palette-listbox"
                aria-expanded="true"
                autoComplete="off"
                spellCheck="false"
                placeholder="Search modules, actions…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                className="h-8 w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-line/60 px-1.5 py-0.5 text-[10px] font-semibold text-faint sm:inline-block">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[46vh] overflow-y-auto overscroll-contain p-1.5">
              {visible.length > 0 ? (
                <ul
                  id="snipe-palette-listbox"
                  ref={listRef}
                  role="listbox"
                  aria-label="Results"
                >
                  {visible.map(({ item }, idx) => {
                    const Icon = item.icon;
                    const active = idx === activeIndex;
                    return (
                      <li
                        key={item.id}
                        role="option"
                        aria-selected={active}
                        id={`snipe-palette-opt-${item.id}`}
                        onClick={() => run(item)}
                        onMouseMove={() => setActiveIndex(idx)}
                        className={cn(
                          'group flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-100',
                          active
                            ? 'bg-accent-soft text-ink'
                            : 'text-muted hover:text-ink',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-8 shrink-0 place-items-center border text-[11px] transition-colors duration-100',
                            active
                              ? 'border-accent/60 text-accent'
                              : 'border-line/60 text-faint',
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">{item.label}</span>
                          <span className="truncate text-xs text-faint">{item.desc}</span>
                        </span>
                        {item.shortcut && (
                          <kbd className="hidden shrink-0 rounded border border-line/60 px-1.5 py-0.5 font-mono text-[10px] text-faint group-hover:border-accent/40 md:inline-block">
                            {item.shortcut}
                          </kbd>
                        )}
                        <CornerDownLeft
                          className={cn(
                            'size-3.5 shrink-0 text-faint transition-opacity',
                            active ? 'opacity-100' : 'opacity-0',
                          )}
                          aria-hidden="true"
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm text-faint">No results for “{query}”.</p>
                  <p className="mt-1 text-xs text-faint/70">Try “workspace”, “onboard”, “pr”.</p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 border-t border-line/40 px-4 py-2 text-[11px] text-faint">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line/60 px-1 font-mono">↑</kbd>
                <kbd className="rounded border border-line/60 px-1 font-mono">↓</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line/60 px-1 font-mono">↵</kbd>
                <span>select</span>
              </span>
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5">
                <span className="text-faint/70">Search:</span>
                <kbd className="rounded border border-line/60 px-1 font-mono">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} K</kbd>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}