interface HeaderProps {
  hasImage: boolean;
  onReset: () => void;
}

export function Header({ hasImage, onReset }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="30" height="30">
              <defs>
                <linearGradient id="svglo-mark-bg" x1="5" y1="3" x2="27" y2="29">
                  <stop stopColor="#111827" />
                  <stop offset="0.58" stopColor="#334155" />
                  <stop offset="1" stopColor="#0f766e" />
                </linearGradient>
                <linearGradient id="svglo-mark-stroke" x1="8" y1="7" x2="24" y2="25">
                  <stop stopColor="#67e8f9" />
                  <stop offset="0.48" stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#svglo-mark-bg)" />
              <rect x="7" y="6" width="3.5" height="3.5" rx="1" fill="#67e8f9" />
              <rect x="11.5" y="6" width="3.5" height="3.5" rx="1" fill="#a78bfa" />
              <rect x="7" y="10.5" width="3.5" height="3.5" rx="1" fill="#f8fafc" opacity="0.9" />
              <path
                d="M21.5 8.5 C17.2 7.4 13.7 9.3 13.7 12.2 C13.7 15.7 21.8 14.9 21.8 19.4 C21.8 23.1 17.5 24.7 11.6 22.7"
                fill="none"
                stroke="url(#svglo-mark-stroke)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.2 9.1 L20.7 8.4 L21.6 11.7"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
              <circle cx="13.7" cy="12.2" r="1.45" fill="#f8fafc" />
              <circle cx="21.8" cy="19.4" r="1.45" fill="#f8fafc" />
              <circle cx="11.6" cy="22.7" r="1.45" fill="#f59e0b" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>SVGlo</strong>
            <small>图片转 SVG</small>
          </span>
        </a>
        <nav className="header-nav">
          {hasImage && (
            <button className="link-btn" onClick={onReset}>
              换一张图
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
