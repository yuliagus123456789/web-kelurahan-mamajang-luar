import { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, Check } from 'lucide-react';
import { usePwaInstallPrompt } from '@/lib/pwa';

const STORAGE_KEY = 'mamajang_pwa_dismissed_until';
const DISMISS_DURATION_DAYS = 7;

export default function PwaInstallPrompt() {
  const { canInstall, isStandalone, isIos, promptInstall } = usePwaInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // If already running as installed app, never show prompt
    if (isStandalone) {
      setDismissed(true);
      return;
    }

    // Check if dismissed previously
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setDismissed(true);
      return;
    }

    // Show prompt if browser can install OR is iOS Safari
    if (canInstall || isIos) {
      // Small delay so user isn't greeted abruptly on the very first second
      const timer = setTimeout(() => {
        setDismissed(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone, isIos]);

  const handleDismiss = () => {
    setDismissed(true);
    const expireTime = Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, expireTime.toString());
  };

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(!showIosGuide);
      return;
    }

    setIsInstalling(true);
    const success = await promptInstall();
    setIsInstalling(false);

    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 2500);
    }
  };

  if (dismissed || isStandalone) return null;

  return (
    <aside
      aria-label="Pasang Aplikasi Kelurahan"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-down"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/95 text-white shadow-2xl border border-stone-700/80 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          {/* Official App Icon */}
          <div className="w-12 h-12 rounded-xl bg-makassar-800 p-1.5 flex items-center justify-center shrink-0 shadow-md border border-makassar-700">
            <img
              src="/logo-pemkot.png"
              alt="Logo Kelurahan"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight truncate">
                Kelurahan Mamajang Luar
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 text-[10px] font-bold uppercase tracking-wider">
                Aplikasi PWA
              </span>
            </div>

            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Pasang ke layar utama HP Anda untuk akses cepat layanan & kontak darurat saat offline.
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup ajakan instalasi"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Step-by-Step Guide Accordion */}
        {showIosGuide && isIos && (
          <div className="mt-3.5 p-3 rounded-xl bg-stone-800/90 border border-stone-700 text-xs text-stone-200 space-y-2 animate-fade-in">
            <p className="font-semibold text-gold-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Cara pasang di iPhone / iPad:
            </p>
            <ol className="space-y-1.5 pl-4 list-decimal text-[11px] text-stone-300">
              <li>
                Ketuk tombol <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3 h-3 text-blue-400" /> Bagikan (Share)</strong> di bilah bawah browser Safari.
              </li>
              <li>
                Gulir ke bawah lalu pilih <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-white" /> Tambah ke Layar Utama</strong>.
              </li>
              <li>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Nanti Saja
          </button>

          {installedSuccess ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>Terpasang!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-gold-300" />
              <span>{isIos ? 'Petunjuk Pasang' : 'Pasang Aplikasi'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
