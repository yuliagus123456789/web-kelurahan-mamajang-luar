import { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';

const DEFAULT_ANNOUNCEMENT =
  '📢 Maklumat Pelayanan: Seluruh Pengurusan Surat & Administrasi Warga di Kelurahan Mamajang Luar 100% GRATIS (Bebas Pungli). Ajukan secara online via Google Form!';

export default function AnnouncementBar() {
  const [text, setText] = useState<string>(DEFAULT_ANNOUNCEMENT);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('kelurahan_announcement');
    if (saved) setText(saved);

    const handleUpdate = () => {
      const updated = localStorage.getItem('kelurahan_announcement');
      if (updated) setText(updated);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kelurahan_announcement_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kelurahan_announcement_updated', handleUpdate);
    };
  }, []);

  if (!visible || !text.trim()) return null;

  return (
    <div className="bg-gradient-to-r from-makassar-900 via-makassar-800 to-makassar-900 text-gold-200 text-xs sm:text-sm py-2 px-3 sm:px-4 border-b border-gold-500/20 shadow-inner relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Pinned Left Badge */}
        <div className="flex items-center gap-2 shrink-0 z-10 pr-2 bg-gradient-to-r from-makassar-900 via-makassar-900 to-transparent">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
            <Megaphone className="h-3.5 w-3.5 animate-pulse" />
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-bold text-[10px] uppercase tracking-wider">
            Maklumat
          </span>
        </div>

        {/* Marquee Running Text (Right to Left) */}
        <div
          className="flex-1 overflow-hidden relative select-none"
          title="Maklumat Pelayanan Kelurahan Mamajang Luar"
        >
          <div className="marquee-track flex items-center">
            <div className="flex shrink-0 items-center whitespace-nowrap">
              <span className="text-xs sm:text-sm font-medium text-white/95 px-4">{text}</span>
              <span className="text-gold-400/90 font-bold px-3">★</span>
            </div>
            <div className="flex shrink-0 items-center whitespace-nowrap" aria-hidden="true">
              <span className="text-xs sm:text-sm font-medium text-white/95 px-4">{text}</span>
              <span className="text-gold-400/90 font-bold px-3">★</span>
            </div>
          </div>
        </div>

        {/* Pinned Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0 z-10 pl-2 bg-gradient-to-l from-makassar-900 via-makassar-900 to-transparent">
          <Link
            to="/layanan"
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-gold-300 hover:text-white transition-colors uppercase tracking-wider underline underline-offset-4"
          >
            Lihat Layanan
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup Pengumuman"
            title="Tutup pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
