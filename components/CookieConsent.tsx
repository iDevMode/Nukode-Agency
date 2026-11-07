import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'nukode-cookie-consent';
const APOLLO_APP_ID = '6922366ed28b6e001dad069e';

type Consent = 'accepted' | 'declined';

const readConsent = (): Consent | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
};

const saveConsent = (value: Consent) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable (private mode, blocked): the choice applies to this visit only.
  }
};

let apolloLoaded = false;

// Apollo identifies visiting companies, so it only loads after the visitor accepts.
const loadApollo = () => {
  if (apolloLoaded) return;
  apolloLoaded = true;
  const script = document.createElement('script');
  script.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${Math.random()
    .toString(36)
    .substring(7)}`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    (window as any).trackingFunctions?.onLoad({ appId: APOLLO_APP_ID });
  };
  document.head.appendChild(script);
};

export const openCookieSettings = () => {
  window.dispatchEvent(new Event('nukode:cookie-settings'));
};

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent === 'accepted') loadApollo();
    if (consent === null) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener('nukode:cookie-settings', reopen);
    return () => window.removeEventListener('nukode:cookie-settings', reopen);
  }, []);

  const choose = (value: Consent) => {
    saveConsent(value);
    if (value === 'accepted') loadApollo();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] bg-nukode-card border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <h4 className="text-white font-medium mb-2">Cookies</h4>
      <p className="text-sm text-nukode-muted leading-relaxed mb-5">
        We use an optional analytics cookie to understand which businesses visit our site. It only
        runs if you accept. See our{' '}
        <a href="/privacy" className="underline hover:text-white">
          Privacy Policy
        </a>
        .
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => choose('declined')}
          className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => choose('accepted')}
          className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};
