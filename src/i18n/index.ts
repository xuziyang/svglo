import { en } from './en';
import { zhCN } from './zhCN';
import type { MessageKey } from './types';
import { articleContent } from './article';
import { zhCNArticleContent } from './article.zhCN';

export type { MessageKey, Messages } from './types';
export { en } from './en';
export { zhCN } from './zhCN';
export { articleContent } from './article';
export { zhCNArticleContent } from './article.zhCN';

export type Locale = 'en' | 'zh-CN';

export function localeFromPath(pathname: string): Locale {
  return pathname === '/zh-cn' || pathname.startsWith('/zh-cn/') ? 'zh-CN' : 'en';
}

export const locale: Locale =
  typeof window === 'undefined' ? 'en' : localeFromPath(window.location.pathname);

const messages = locale === 'zh-CN' ? zhCN : en;

/** Typed nested lookup for the active copy catalog. */
export function t(key: MessageKey): string {
  const parts = key.split('.');
  let cur: unknown = messages;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : key;
}

export function activeArticleContent() {
  return locale === 'zh-CN' ? zhCNArticleContent : articleContent;
}

export function homePath(): string {
  return locale === 'zh-CN' ? '/zh-cn/' : '/';
}
