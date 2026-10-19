import { useEffect, useState } from 'react';
import {
  CONSENT_EVENT,
  readConsent,
  saveConsent,
  type AnalyticsConsent,
} from '../lib/analyticsConsent';
import { localizedPath, t } from '../i18n';

/**
 * First-visit analytics choice. Analytics stays off until the visitor accepts;
 * rejecting is as easy as accepting and can be changed from the footer.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => readConsent() === null);

  useEffect(() => {
    const onReopen = () => setVisible(true);
    window.addEventListener(CONSENT_EVENT, onReopen);
    return () => window.removeEventListener(CONSENT_EVENT, onReopen);
  }, []);

  if (!visible) return null;

  const choose = (consent: AnalyticsConsent) => {
    saveConsent(consent);
    setVisible(false);
  };

  return (
    <section className="consent-banner" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-body">
      <div className="consent-copy">
        <strong id="consent-title">{t('consent.title')}</strong>
        <p id="consent-body">{t('consent.body')}</p>
        <a href={localizedPath('/privacy/')}>{t('consent.privacyLink')}</a>
      </div>
      <div className="consent-actions">
        <button type="button" className="btn btn-ghost" onClick={() => choose('denied')}>
          {t('consent.reject')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => choose('granted')}>
          {t('consent.accept')}
        </button>
      </div>
    </section>
  );
}
