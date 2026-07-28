import { useEffect, useRef, useState } from 'react';
import { homePath, t } from '../i18n';

export function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const privacyButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!privacyOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPrivacyOpen(false);
        privacyButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [privacyOpen]);

  const closePrivacy = () => {
    setPrivacyOpen(false);
    privacyButtonRef.current?.focus();
  };

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="privacy-note">
            <PrivacyIcon />
            <div>
              <strong>{t('footer.privacyTitle')}</strong>
              <span>{t('footer.privacySummary')}</span>
            </div>
          </div>
          <nav className="footer-links">
            <a href={homePath()}>{t('footer.imageToSvg')}</a>
            <a href="/svg-to-jpg/">{t('footer.svgToJpg')}</a>
            <a href="/svg-to-png/">{t('footer.svgToPng')}</a>
            <button ref={privacyButtonRef} type="button" onClick={() => setPrivacyOpen(true)}>
              {t('footer.privacy')}
            </button>
            <span className="footer-copy">{t('footer.copyright')}</span>
          </nav>
        </div>
      </footer>

      {privacyOpen && (
        <div className="modal-backdrop" onMouseDown={closePrivacy}>
          <section
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="privacy-modal-icon">
              <PrivacyIcon />
            </div>
            <h2 id="privacy-title">{t('footer.privacyTitle')}</h2>
            <p>{t('footer.privacyBody')}</p>
            <button ref={closeButtonRef} type="button" className="btn btn-primary" onClick={closePrivacy}>
              {t('footer.close')}
            </button>
          </section>
        </div>
      )}
    </>
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
