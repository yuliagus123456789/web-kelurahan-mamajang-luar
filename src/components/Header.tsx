import { useEffect, useState } from 'react';
import { Menu, X, Landmark } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import AnnouncementBar from '@/components/AnnouncementBar';

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil', path: '/profil' },
  { label: 'Layanan Publik', path: '/layanan' },
  { label: 'Berita & Kegiatan', path: '/berita' },
  { label: 'Potensi & UMKM', path: '/umkm' },
  { label: 'Kontak & Pengaduan', path: '/kontak' },
];

export default function Header() {
  const { path, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const isActive = (p: string) =>
    p === '/' ? path === '/' : path === p || path.startsWith(p + '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Announcement Bar at the absolute top */}
      <AnnouncementBar />

      {/* Main Navigation Bar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md py-2 border-b border-stone-200/50'
            : 'bg-white/80 backdrop-blur-md py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo-pemkot-makassar.png"
                alt="Logo Pemerintah Kota Makassar"
                className="w-10 h-12 object-contain group-hover:scale-105 transition-transform drop-shadow-sm shrink-0"
              />
              <div className="leading-tight">
                <p className="font-bold text-stone-900 text-sm sm:text-base tracking-tight group-hover:text-makassar-800 transition-colors">
                  Kelurahan Mamajang Luar
                </p>
                <p className="text-[11px] text-stone-500 font-medium">Pemerintah Kota Makassar</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-makassar-50 text-makassar-800 font-bold'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={() => navigate('/kontak')}
                className="ml-2 px-5 py-2 rounded-lg text-xs font-bold bg-makassar-800 text-white hover:bg-makassar-700 transition-colors shadow-sm shimmer-btn"
              >
                Ajukan Pengaduan
              </button>
            </nav>

            <button
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {open && (
            <nav className="lg:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-stone-100 pt-3 animate-slide-down">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-makassar-50 text-makassar-800 font-bold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => navigate('/kontak')}
                className="mt-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-makassar-800 text-white text-center shimmer-btn hover:bg-makassar-700 transition-colors"
              >
                Ajukan Pengaduan
              </button>
            </nav>
          )}
        </div>
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-makassar-800 to-gold-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
}
