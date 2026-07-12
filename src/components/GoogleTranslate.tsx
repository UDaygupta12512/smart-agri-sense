'use client';

import { useEffect } from 'react';
import { readSiteLanguage, APP_LANGUAGE_EVENT } from '@/lib/siteLanguage';

export default function GoogleTranslate() {
  useEffect(() => {
    // Add Google Translate script
    if (typeof window !== 'undefined' && !window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const syncTranslation = () => {
      const lang = readSiteLanguage();
      const setCookie = (name: string, value: string, domain?: string) => {
        let cookieString = `${name}=${value};path=/`;
        if (domain) cookieString += `;domain=${domain}`;
        document.cookie = cookieString;
      };
      
      if (lang === 'en') {
        // Clear cookies for en
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      } else {
        const gtLang = lang;
        setCookie('googtrans', `/en/${gtLang}`);
        setCookie('googtrans', `/en/${gtLang}`, window.location.hostname);
      }
    }; // <-- Added missing closing brace

    // Run on mount to sync initial state
    syncTranslation();

    const handleLanguageChange = () => {
      syncTranslation();
      // Reload to apply Google Translate with the new cookie
      window.location.reload();
    };

    window.addEventListener(APP_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(APP_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  return <div id="google_translate_element" className="hidden" />;
}

// Add TypeScript support for window object
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: { translate: { TranslateElement: new (config: { pageLanguage: string; autoDisplay: boolean }, elementId: string) => void } };
  }
}
