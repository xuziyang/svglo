import { en } from './en';
import type { MessageKey } from './types';

export type { MessageKey, Messages } from './types';
export { en } from './en';
export { articleContent } from './article';

/** Typed nested lookup for the English copy catalog. */
export function t(key: MessageKey): string {
  const parts = key.split('.');
  let cur: unknown = en;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : key;
}
