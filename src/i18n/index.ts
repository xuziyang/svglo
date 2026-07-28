import { en } from './en';
import { zhCN } from './zhCN';
import type { MessageKey } from './types';
import { articleContent } from './article';
import { zhCNArticleContent } from './article.zhCN';
import { enToolPages, zhCNToolPages } from './toolPages';
import { svgToJpgArticle } from './svgToJpgArticle';
import { svgToPngArticle } from './svgToPngArticle';
import { zhCNSvgToJpgArticle } from './svgToJpgArticle.zhCN';
import { zhCNSvgToPngArticle } from './svgToPngArticle.zhCN';

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

export function localizedPath(path: '/' | '/svg-to-jpg/' | '/svg-to-png/', targetLocale = locale): string {
  if (targetLocale === 'en') return path;
  return path === '/' ? '/zh-cn/' : `/zh-cn${path}`;
}

export function activeToolPageCopy() {
  return locale === 'zh-CN' ? zhCNToolPages : enToolPages;
}

export function activeSvgToJpgArticle() {
  return locale === 'zh-CN' ? zhCNSvgToJpgArticle : svgToJpgArticle;
}

export function activeSvgToPngArticle() {
  return locale === 'zh-CN' ? zhCNSvgToPngArticle : svgToPngArticle;
}
