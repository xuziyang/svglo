import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SvgToJpgPage } from './components/SvgToJpgPage';
import { SvgToPngPage } from './components/SvgToPngPage';
import { locale } from './i18n';
import './index.css';

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
document.documentElement.lang = locale;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {pathname === '/svg-to-jpg'
      ? <SvgToJpgPage />
      : pathname === '/svg-to-png'
        ? <SvgToPngPage />
        : <App />}
  </React.StrictMode>,
);
