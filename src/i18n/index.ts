import { en } from './en';
import { zh } from './zh';
import type { Locale, MessageKey, Messages } from './types';

export type { Locale, MessageKey, Messages } from './types';
export { en } from './en';
export { zh } from './zh';

export const LOCALES: readonly Locale[] = ['en', 'zh'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export const catalogs: Record<Locale, Messages> = { en, zh };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  zh: '中文',
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
};

const LOCALE_RE = /^\/(en|zh)(?=\/|$)/;

/** Extract locale from the first path segment, or null if absent/invalid. */
export function getLocaleFromPath(pathname: string): Locale | null {
  const m = pathname.match(LOCALE_RE);
  return m ? (m[1] as Locale) : null;
}

/** Strip the leading /en or /zh segment (keeps trailing path). */
export function stripLocaleFromPath(pathname: string): string {
  const stripped = pathname.replace(LOCALE_RE, '');
  return stripped.replace(/\/$/, '') || '';
}

/**
 * Build a locale-prefixed path. Bare locale paths always end with `/`
 * so static hosts serve `/{locale}/index.html` (e.g. `/en/`, `/zh/`).
 */
export function localePath(locale: Locale, rest = '', search = '', hash = ''): string {
  const cleaned = rest.replace(/^\/+|\/+$/g, '');
  const base = cleaned ? `/${locale}/${cleaned}` : `/${locale}/`;
  return `${base}${search}${hash}`;
}

/** Prefer zh when the browser language starts with "zh", otherwise en. */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of langs) {
    if (lang && lang.toLowerCase().startsWith('zh')) return 'zh';
  }
  return DEFAULT_LOCALE;
}

/** Nested lookup: t(messages, 'header.tagline') */
export function translate(messages: Messages, key: MessageKey): string {
  const parts = key.split('.');
  let cur: unknown = messages;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : key;
}

/**
 * Ensure the URL has a valid locale prefix (with trailing slash).
 * Bare `/` redirects to the browser language. Safe before React mounts.
 */
export function ensureLocaleInUrl(): Locale {
  const { pathname, search, hash } = window.location;
  const existing = getLocaleFromPath(pathname);

  if (existing) {
    const rest = stripLocaleFromPath(pathname);
    const canonical = localePath(existing, rest, search, hash);
    const current = `${pathname}${search}${hash}`;
    if (current !== canonical) {
      window.history.replaceState(null, '', canonical);
    }
    return existing;
  }

  const locale = detectBrowserLocale();
  const rest = stripLocaleFromPath(pathname);
  window.history.replaceState(null, '', localePath(locale, rest, search, hash));
  return locale;
}
