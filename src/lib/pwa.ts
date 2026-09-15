import { useState, useEffect } from 'react';

// Custom interface for BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global holder for install prompt event
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<(canInstall: boolean) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser mini-infobar on mobile Chrome
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((fn) => fn(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((fn) => fn(false));
    console.info('[PWA] Aplikasi Kelurahan Mamajang Luar berhasil dipasang!');
  });
}

/**
 * Register Service Worker
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.info('[PWA] Service Worker aktif di scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Gagal meregistrasi Service Worker:', err);
      });
  });
}

/**
 * Check if app is already running in standalone PWA mode
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if current browser is iOS Safari
 */
export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
  return isIos && isSafari;
}

/**
 * Trigger PWA installation prompt
 */
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;
  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredInstallPrompt = null;
      installListeners.forEach((fn) => fn(false));
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[PWA] Install prompt error:', err);
    return false;
  }
}

/**
 * Hook to monitor online / offline network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to manage PWA install prompt availability
 */
export function usePwaInstallPrompt() {
  const [canInstall, setCanInstall] = useState<boolean>(() => deferredInstallPrompt !== null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isRunningStandalone());
  const [isIos, setIsIos] = useState<boolean>(() => isIosSafari());

  useEffect(() => {
    setIsStandalone(isRunningStandalone());
    setIsIos(isIosSafari());

    const listener = (available: boolean) => {
      setCanInstall(available);
    };

    installListeners.add(listener);
    return () => {
      installListeners.delete(listener);
    };
  }, []);

  return {
    canInstall,
    isStandalone,
    isIos,
    promptInstall: promptPwaInstall,
  };
}
