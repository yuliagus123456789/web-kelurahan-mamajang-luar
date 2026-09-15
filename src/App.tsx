import { RouterProvider, useRouter } from '@/lib/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import MobileBottomNav from '@/components/MobileBottomNav';
import HomePage from '@/pages/HomePage';
import ProfilPage from '@/pages/ProfilPage';
import LayananPage from '@/pages/LayananPage';
import BeritaPage from '@/pages/BeritaPage';
import UmkmPage from '@/pages/UmkmPage';
import KontakPage from '@/pages/KontakPage';
import AdminPage from '@/pages/AdminPage';

function PageRouter() {
  const { path } = useRouter();

  const renderPage = () => {
    if (path === '/') return <HomePage />;
    if (path === '/profil') return <ProfilPage />;
    if (path === '/layanan') return <LayananPage />;
    if (path === '/berita' || path.startsWith('/berita/')) return <BeritaPage />;
    if (path === '/umkm') return <UmkmPage />;
    if (path === '/kontak' || path.startsWith('/kontak')) return <KontakPage />;
    if (path === '/admin') return <AdminPage />;
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative selection:bg-makassar-800 selection:text-white pb-16 md:pb-0">
      <OfflineIndicator />
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <FloatingWhatsApp />
      <PwaInstallPrompt />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <PageRouter />
    </RouterProvider>
  );
}
