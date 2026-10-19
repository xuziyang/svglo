import { reopenConsent } from '../lib/analyticsConsent';
import { homePath, localizedPath, t } from '../i18n';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="privacy-note">
          <PrivacyIcon />
          <div>
            <strong>{t('footer.privacyTitle')}</strong>
            <span>{t('footer.privacySummary')}</span>
          </div>
        </div>
        <nav className="footer-links" aria-label={t('header.siteNav')}>
          <a href={homePath()}>{t('footer.imageToSvg')}</a>
          <a href={localizedPath('/svg-to-jpg/')}>{t('footer.svgToJpg')}</a>
          <a href={localizedPath('/svg-to-png/')}>{t('footer.svgToPng')}</a>
          <a href={localizedPath('/about/')}>{t('footer.about')}</a>
          <a href={localizedPath('/contact/')}>{t('footer.contact')}</a>
          <a href={localizedPath('/privacy/')}>{t('footer.privacy')}</a>
          <a href={localizedPath('/terms/')}>{t('footer.terms')}</a>
          <button type="button" onClick={reopenConsent}>
            {t('footer.cookieSettings')}
          </button>
          <span className="footer-copy">{t('footer.copyright')}</span>
        </nav>
      </div>
    </footer>
  );
}

function PrivacyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 3 5.5 5.7v5.1c0 4.3 2.6 8.2 6.5 9.7 3.9-1.5 6.5-5.4 6.5-9.7V5.7L12 3Z" strokeWidth="1.7" />
      <path d="m9 12 2 2 4-4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
