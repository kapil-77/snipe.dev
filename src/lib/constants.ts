/**
 * Global app constants.
 */
export const SITE_NAME = 'snipe.dev';

export const SITE_TAGLINE = 'dev tools, one isolated module at a time';

export const GITHUB_OAUTH_REPO = 'https://github.com/snipe-dev';

/** Design-system constant (extracted from ossium.in). */
export const DASHED = {
  /** Dashed stroke colour used for frames + dividers. */
  color: '#444444',
  /** Dash length in px. */
  on: 5,
  /** Gap between dashes in px. */
  off: 10,
  /** Stroke thickness in px. */
  thickness: 1,
} as const;

export const SECTION_IDS = {
  modules: 'modules',
  pricing: 'pricing',
  testimonials: 'testimonials',
  faq: 'faq',
} as const;