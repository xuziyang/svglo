import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SvgToJpgPage } from './components/SvgToJpgPage';
import { SvgToPngPage } from './components/SvgToPngPage';
import { LegalPage } from './components/LegalPage';
import { ConsentBanner } from './components/ConsentBanner';
import { legalPageFromPath, locale } from './i18n';
import type { LegalPageId } from './i18n';
import './index.css';

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
document.documentElement.lang = locale;

const legalPage: LegalPageId | null = legalPageFromPath(pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {legalPage ? (
      <LegalPage page={legalPage} />
    ) : pathname === '/svg-to-jpg' || pathname === '/zh-cn/svg-to-jpg' ? (
      <SvgToJpgPage />
    ) : pathname === '/svg-to-png' || pathname === '/zh-cn/svg-to-png' ? (
      <SvgToPngPage />
    ) : (
      <App />
    )}
    <ConsentBanner />
  </React.StrictMode>,
);
