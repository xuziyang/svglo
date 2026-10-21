/**
 * Consent state for the Google tag (Analytics + AdSense).
 *
 * The gtag bootstrap in `index.html` runs before React: it reads the stored
 * choice and sends `gtag('consent', 'default', ...)` before the config command,
 * so analytics and ad storage stay denied until the visitor opts in. This
 * module persists later choices and applies them as consent updates.
 */

export const CONSENT_STORAGE_KEY = 'svglo-analytics-consent';
/** Fired when the footer asks the banner to re-open the choice in place. */
export const CONSENT_EVENT = 'svglo:analytics-consent';

export type AnalyticsConsent = 'granted' | 'denied';

/** The `gtag` entry point index.html installs before React renders. */
export interface GtagWindow extends Window {
  gtag?: (...args: unknown[]) => void;
}

function gtag(...args: unknown[]): void {
  (window as GtagWindow).gtag?.(...args);
}

export function readConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Apply Consent Mode signals. Accepting the banner opts into both analytics
 * and personalized advertising; rejecting denies all non-essential signals,
 * in which case AdSense serves cookie-free limited ads.
 */
export function applyConsent(consent: AnalyticsConsent): void {
  gtag('consent', 'update', {
    ad_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
    analytics_storage: consent,
  });
}

/** Persist the choice and apply it. */
export function saveConsent(consent: AnalyticsConsent): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Private browsing can reject writes; the in-memory update still applies.
  }
  applyConsent(consent);
}

/**
 * Withdraw consent immediately and ask the banner to re-open the choice
 * without reloading, so workspace state (loaded image and settings) survives.
 */
export function reopenConsent(): void {
  saveConsent('denied');
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
