import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { Home, FileText, Send, Search } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof Home;
}

const TABS: NavItem[] = [
  { id: 'home', label: 'Beranda', path: '/', icon: Home },
  { id: 'layanan', label: 'Layanan', path: '/layanan', icon: FileText },
  { id: 'lapor', label: 'Lapor SPK', path: '/kontak', icon: Send },
  { id: 'lacak', label: 'Lacak Tiket', path: '/kontak', icon: Search },
];

export default function MobileBottomNav() {
  const { path } = useRouter();
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (path === '/') {
      setActiveTab(0);
    } else if (path === '/layanan') {
      setActiveTab(1);
    } else if (path === '/kontak') {
      if (window.location.hash === '#track') {
        setActiveTab(3);
      } else {
        setActiveTab(2);
      }
    } else {
      setActiveTab(0);
    }
  }, [path]);

  const handleTabClick = (index: number, tab: NavItem) => {
    setActiveTab(index);

    if (path === '/' && tab.id === 'lacak') {
      const trackerEl = document.getElementById('spk-tracker-section');
      if (trackerEl) {
        trackerEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom)] select-none max-w-sm mx-auto"
    >
      {/* Modern Floating Capsule Dock */}
      <div className="flex items-center justify-between p-1.5 rounded-full bg-white/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-stone-200/90">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === idx;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => handleTabClick(idx, tab)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[46px] py-1.5 px-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-makassar-800 to-makassar-900 text-white shadow-md shadow-makassar-900/30 scale-[1.03]'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/80 active:scale-95'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 transition-transform duration-200 ${
                  isActive ? 'text-gold-300 scale-110' : 'text-stone-400'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight leading-none mt-1 ${
                  isActive ? 'font-bold text-white' : 'font-medium text-stone-600'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
