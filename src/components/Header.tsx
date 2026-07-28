import { homePath, locale, localizedPath, t } from '../i18n';

interface HeaderProps {
  hasImage: boolean;
  onReset: () => void;
  currentTool?: 'image-to-svg' | 'svg-to-jpg' | 'svg-to-png';
}

export function Header({ hasImage, onReset, currentTool = 'image-to-svg' }: HeaderProps) {
  const localizedHome = homePath();
  const currentPath =
    currentTool === 'svg-to-jpg'
      ? '/svg-to-jpg/'
      : currentTool === 'svg-to-png'
        ? '/svg-to-png/'
        : '/';

  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href={localizedHome}>
          <span className="brand-mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="30" height="30">
              <defs>
                <linearGradient id="svglo-mark-bg" x1="4" y1="2" x2="28" y2="30">
                  <stop stopColor="#4f46e5" />
                  <stop offset="0.55" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="svglo-mark-path" x1="10" y1="8" x2="24" y2="24">
                  <stop stopColor="#e0e7ff" />
                  <stop offset="0.5" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#fde68a" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#svglo-mark-bg)" />
              <rect x="1.2" y="1.2" width="29.6" height="14" rx="8" fill="#ffffff" opacity="0.08" />
              <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="#c7d2fe" />
              <rect x="11.5" y="6.5" width="4" height="4" rx="1" fill="#a5b4fc" opacity="0.95" />
              <rect x="6.5" y="11.5" width="4" height="4" rx="1" fill="#e0e7ff" opacity="0.85" />
              <path
                d="M22.8 9.2 C18.6 7.8 14.8 9.6 14.8 12.4 C14.8 15.8 22.4 15.2 22.4 19.4 C22.4 22.8 18.2 24.6 12.4 22.6"
                fill="none"
                stroke="url(#svglo-mark-path)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14.8" cy="12.4" r="1.35" fill="#ffffff" />
              <circle cx="22.4" cy="19.4" r="1.35" fill="#ffffff" />
              <circle cx="12.4" cy="22.6" r="1.45" fill="#fbbf24" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>SVGlo</strong>
            <small>
              {currentTool === 'svg-to-jpg'
                ? t('header.svgToJpg')
                : currentTool === 'svg-to-png'
                  ? t('header.svgToPng')
                  : t('header.tagline')}
            </small>
          </span>
        </a>
        <nav className="header-nav">
          <a className={`link-btn tool-link ${currentTool === 'image-to-svg' ? 'is-active' : ''}`} href={localizedHome}>
            {t('header.imageToSvg')}
          </a>
          <a className={`link-btn tool-link ${currentTool === 'svg-to-jpg' ? 'is-active' : ''}`} href={localizedPath('/svg-to-jpg/')}>
            {t('header.svgToJpg')}
          </a>
          <a className={`link-btn tool-link ${currentTool === 'svg-to-png' ? 'is-active' : ''}`} href={localizedPath('/svg-to-png/')}>
            {t('header.svgToPng')}
          </a>
          {hasImage && (
            <button className="link-btn" onClick={onReset}>
              {currentTool === 'image-to-svg' ? t('header.newImage') : t('header.newSvg')}
            </button>
          )}
          <details className="language-menu">
            <summary className="link-btn lang-switch" aria-label={t('header.languageMenu')}>
              <GlobeIcon />
              <span>{t('header.language')}</span>
              <span className="language-chevron" aria-hidden>⌄</span>
            </summary>
            <div className="language-menu-popover">
              <a className={locale === 'en' ? 'is-current' : ''} href={localizedPath(currentPath, 'en')} lang="en">
                <span>English</span>
                {locale === 'en' && <span aria-hidden>✓</span>}
              </a>
              <a className={locale === 'zh-CN' ? 'is-current' : ''} href={localizedPath(currentPath, 'zh-CN')} lang="zh-CN">
                <span>简体中文</span>
                {locale === 'zh-CN' && <span aria-hidden>✓</span>}
              </a>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
      <path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" strokeWidth="1.7" />
    </svg>
  );
}
