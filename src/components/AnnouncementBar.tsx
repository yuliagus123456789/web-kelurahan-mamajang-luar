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
    <div className="bg-gradient-to-r from-makassar-900 via-makassar-800 to-makassar-900 text-gold-200 text-xs sm:text-sm py-2 px-4 border-b border-gold-500/20 shadow-inner relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
            <Megaphone className="h-3.5 w-3.5 animate-pulse" />
          </span>
          <p className="font-medium text-white/95 truncate sm:whitespace-normal">
            {text}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
