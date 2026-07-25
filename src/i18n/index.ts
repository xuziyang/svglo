import { en } from './en';
import { zh } from './zh';
import type { Locale, MessageKey, Messages } from './types';

export type { Locale, MessageKey, Messages } from './types';
export { en } from './en';
export { zh } from './zh';
export { articleContent } from './article';

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

/**
 * URL path segment for each locale.
 * Default locale (en) is unprefixed (null). Chinese uses `zh-cn`.
 */
export const LOCALE_PATH_SEGMENT: Record<Locale, string | null> = {
  en: null,
  zh: 'zh-cn',
};

/** Reverse map: path segment → locale (only non-default locales). */
const PATH_SEGMENT_TO_LOCALE: Record<string, Locale> = {
  'zh-cn': 'zh',
};

const LOCALE_SEGMENT_RE = /^\/(zh-cn)(?=\/|$)/i;

/**
 * Resolve locale from the path.
 * - `/zh-cn/...` → zh
 * - everything else (including `/`) → default locale (en)
 */
export function getLocaleFromPath(pathname: string): Locale {
  const m = pathname.match(LOCALE_SEGMENT_RE);
  if (!m) return DEFAULT_LOCALE;
  const segment = m[1].toLowerCase();
  return PATH_SEGMENT_TO_LOCALE[segment] ?? DEFAULT_LOCALE;
}

/** Strip a leading locale segment when present (keeps trailing path). */
export function stripLocaleFromPath(pathname: string): string {
  const stripped = pathname.replace(LOCALE_SEGMENT_RE, '');
  return stripped.replace(/\/$/, '') || '';
}

/**
 * Build a locale URL path.
 * Default locale (en) has no prefix: `/`, `/about`.
 * Chinese uses `/zh-cn/`, `/zh-cn/about`.
 */
export function localePath(locale: Locale, rest = '', search = '', hash = ''): string {
  const cleaned = rest.replace(/^\/+|\/+$/g, '');
  const segment = LOCALE_PATH_SEGMENT[locale];
  let base: string;
  if (!segment) {
    base = cleaned ? `/${cleaned}` : '/';
  } else {
    base = cleaned ? `/${segment}/${cleaned}` : `/${segment}/`;
  }
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
 * Normalize the URL to the canonical locale form:
 * - `/` → English
 * - `/zh-cn/` → Chinese
 * Safe before React mounts.
 */
export function ensureLocaleInUrl(): Locale {
  const { pathname, search, hash } = window.location;
  const locale = getLocaleFromPath(pathname);
  const rest = stripLocaleFromPath(pathname);
  const canonical = localePath(locale, rest, search, hash);
  const current = `${pathname}${search}${hash}`;
  if (current !== canonical) {
    window.history.replaceState(null, '', canonical);
  }
  return locale;
}
