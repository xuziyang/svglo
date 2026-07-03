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
            <svg viewBox="0 0 32 32" width="26" height="26">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M21 12 C21 9 18.5 7 15 7 C11.5 7 9 9 9 12 C9 15 11.5 16 15 16 C18.5 16 21 17 21 20 C21 23 18.5 25 15 25 C11.5 25 9 23 9 20"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
