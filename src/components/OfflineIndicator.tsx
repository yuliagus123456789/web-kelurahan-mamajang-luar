import { useState, useEffect } from 'react';
import { WifiOff, Wifi, PhoneCall } from 'lucide-react';
import { useNetworkStatus } from '@/lib/pwa';
import { KELURAHAN_CONFIG } from '@/lib/config';

export default function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowReconnectedToast(false);
    } else if (hasBeenOffline) {
      // Just reconnected
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
        setHasBeenOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-0 left-0 right-0 z-50 bg-stone-900 text-stone-100 px-4 py-2.5 shadow-lg border-b border-amber-500/40 animate-slide-down"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <WifiOff className="w-4 h-4" />
            </span>
            <p className="font-medium text-stone-200">
              <strong className="text-amber-300">Mode Offline:</strong> Anda tidak terhubung ke internet. Halaman statis & kontak darurat tetap dapat digunakan.
            </p>
          </div>

          <a
            href={`tel:${KELURAHAN_CONFIG.whatsappPelayanan.nomor}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-makassar-800 hover:bg-makassar-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow"
          >
            <PhoneCall className="w-3 h-3 text-gold-300" />
            <span>Telepon Kelurahan</span>
          </a>
        </div>
      </div>
    );
  }

  if (showReconnectedToast) {
    return (
      <div
        role="status"
        className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-down"
      >
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>Koneksi internet tersambung kembali</span>
      </div>
    );
  }

  return null;
}
