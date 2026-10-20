/**
 * Business event reporting for GA4.
 *
 * Events are only sent after the visitor grants analytics consent, matching the
 * Cookie Consent Mode setup in `analyticsConsent.ts`. Without consent the
 * functions here are no-ops, so callers never need to check first.
 */

import { readConsent, type GtagWindow } from './analyticsConsent';

/** Parameter values GA4 accepts on an event. */
export type EventParams = Record<string, string | number | boolean>;

/**
 * Record one event.
 *
 * @param name Event name, lower_snake_case, e.g. `svg_downloaded`.
 * @param params Extra fields; values must be strings, numbers, or booleans.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (readConsent() !== 'granted') return;
  (window as GtagWindow).gtag?.('event', name, params);
}
