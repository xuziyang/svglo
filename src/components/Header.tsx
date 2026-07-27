import { t } from '../i18n';

interface HeaderProps {
  hasImage: boolean;
  onReset: () => void;
  currentTool?: 'image-to-svg' | 'svg-to-jpg';
}

export function Header({ hasImage, onReset, currentTool = 'image-to-svg' }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="/">
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
            <small>{currentTool === 'svg-to-jpg' ? 'SVG to JPG' : t('header.tagline')}</small>
          </span>
        </a>
        <nav className="header-nav">
          <a className={`link-btn tool-link ${currentTool === 'image-to-svg' ? 'is-active' : ''}`} href="/">
            Image to SVG
          </a>
          <a className={`link-btn tool-link ${currentTool === 'svg-to-jpg' ? 'is-active' : ''}`} href="/svg-to-jpg/">
            SVG to JPG
          </a>
          {hasImage && (
            <button className="link-btn" onClick={onReset}>
              {currentTool === 'svg-to-jpg' ? 'New SVG' : t('header.newImage')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
