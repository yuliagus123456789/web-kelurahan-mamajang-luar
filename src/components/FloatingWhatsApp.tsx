import { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import { KELURAHAN_CONFIG } from '@/lib/config';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const { nomor, nomorTampilan, jamLayanan, pesanDefault } = KELURAHAN_CONFIG.whatsappPelayanan;

  const waUrl = `https://wa.me/${nomor}?text=${encodeURIComponent(pesanDefault)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-white p-4 shadow-2xl border border-stone-200 animate-slide-up text-stone-800">
          <div className="flex items-start justify-between border-b border-stone-100 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-stone-800">Pelayanan Kantor Kelurahan</p>
                <p className="text-[10px] text-emerald-600 font-medium">Online ({jamLayanan})</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded-lg hover:bg-stone-100"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            Halo Warga Mamajang Luar! Butuh informasi berkas atau kendala pelayanan surat? Sampaikan langsung kepada petugas kami:
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all group"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat via WhatsApp ({nomorTampilan})</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Hubungi WhatsApp Pelayanan"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
        </span>
        <span className="text-xs font-semibold hidden sm:inline-block pr-1">
          WhatsApp Pelayanan
        </span>
      </button>
    </div>
  );
}
