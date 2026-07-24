import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  catalogs,
  ensureLocaleInUrl,
  getLocaleFromPath,
  localePath,
  LOCALE_HTML_LANG,
  LOCALES,
  stripLocaleFromPath,
  translate,
  type Locale,
  type MessageKey,
} from './index';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function applyDocumentMeta(locale: Locale) {
  const messages = catalogs[locale];
  document.documentElement.lang = LOCALE_HTML_LANG[locale];
  document.documentElement.setAttribute('data-locale', locale);
  document.title = messages.meta.title;

  upsertMeta('name', 'description', messages.meta.description);
  upsertMeta('property', 'og:title', messages.meta.title);
  upsertMeta('property', 'og:description', messages.meta.description);
  upsertMeta('property', 'og:locale', locale === 'zh' ? 'zh_CN' : 'en_US');

  const origin = window.location.origin;
  const rest = stripLocaleFromPath(window.location.pathname);
  const canonicalPath = localePath(locale, rest);
  const canonicalHref = `${origin}${canonicalPath}`;

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalHref);
  upsertMeta('property', 'og:url', canonicalHref);

  for (const el of document.querySelectorAll('link[data-i18n-hreflang]')) {
    el.remove();
  }
  const entries: Array<{ hreflang: string; href: string }> = [
    ...LOCALES.map((l) => ({
      hreflang: l === 'zh' ? 'zh-CN' : l,
      href: `${origin}${localePath(l, rest)}`,
    })),
    { hreflang: 'x-default', href: `${origin}${localePath('en', rest)}` },
  ];
  for (const { hreflang, href } of entries) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-i18n-hreflang', '1');
    document.head.appendChild(link);
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => ensureLocaleInUrl());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState((prev) => {
      if (prev === next) return prev;
      const { pathname, search, hash } = window.location;
      const rest = stripLocaleFromPath(pathname);
      // Full navigation so the browser loads the locale's static HTML
      // (correct title/description for share previews & crawlers).
      // App state is ephemeral (image is in-memory) so a real load is fine.
      window.location.assign(localePath(next, rest, search, hash));
      return prev;
    });
  }, []);

  useEffect(() => {
    applyDocumentMeta(locale);
  }, [locale]);

  useEffect(() => {
    const onPop = () => {
      setLocaleState(getLocaleFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const t = useCallback(
    (key: MessageKey) => translate(catalogs[locale], key),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT(): (key: MessageKey) => string {
  return useLocale().t;
}
