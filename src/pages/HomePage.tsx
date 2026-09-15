import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { NewsItem, GalleryItem, ServiceItem } from '@/lib/types';
import {
  ArrowRight,
  Newspaper,
  Images,
  Store,
  FileText,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  HeartHandshake,
  Landmark,
  ChevronRight,
  Send,
  Search,
} from 'lucide-react';

import { KELURAHAN_CONFIG } from '@/lib/config';
import HomeSpkTracker from '@/components/HomeSpkTracker';

const heroImg =
  'https://images.pexels.com/photos/2355062/pexels-photo-2355062.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const stats = [
  { label: 'Jumlah Penduduk', value: '3.025', suffix: '1.460 L / 1.565 P' },
  { label: 'Rukun Warga (RW / RT)', value: '3 / 16', suffix: 'Wilayah Resmi' },
  { label: 'Kepala Keluarga (KK)', value: '878', suffix: 'KK Terdaftar' },
  { label: 'UMKM & Potensi Warga', value: '36+', suffix: 'Usaha Terdata Resmi' },
];

const highlightPrimary = {
  icon: ShieldCheck,
  title: 'Pelayanan Prima',
  desc: 'Melayani administrasi kependudukan dengan cepat, transparan, dan akuntabel sesuai standar pelayanan minimal kelurahan.',
};

const highlightSecondary = [
  {
    icon: HeartHandshake,
    title: 'Gotong Royong',
    desc: 'Menjaga semangat kebersamaan dan kepedulian sosial antarwarga.',
  },
  {
    icon: Landmark,
    title: 'Layanan Digital',
    desc: 'Pengurusan surat dan pengaduan kini bisa diakses melalui portal ini.',
  },
];

import { OFFICIAL_NEWS_DATA, OFFICIAL_GALLERY_DATA } from '@/data/newsAndGalleryData';

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>(OFFICIAL_NEWS_DATA.slice(0, 3));
  const [gallery, setGallery] = useState<GalleryItem[]>(OFFICIAL_GALLERY_DATA.slice(0, 6));
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [n, g, s] = await Promise.all([
          supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
          supabase.from('gallery').select('*').order('event_date', { ascending: false }).limit(6),
          supabase.from('services').select('*').order('title').limit(6),
        ]);
        if (n.data && n.data.length > 0) {
          setNews(n.data);
        } else {
          setNews(OFFICIAL_NEWS_DATA.slice(0, 3));
        }
        if (g.data && g.data.length > 0) {
          setGallery(g.data);
        } else {
          setGallery(OFFICIAL_GALLERY_DATA.slice(0, 6));
        }
        if (s.data && s.data.length > 0) setServices(s.data);
      } catch (err) {
        console.warn('Using official homepage content:', err);
        setNews(OFFICIAL_NEWS_DATA.slice(0, 3));
        setGallery(OFFICIAL_GALLERY_DATA.slice(0, 6));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero — anti-slop: no floating particles, no capsule badge, reduced height */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Mamajang Luar" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/70 to-makassar-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-gold-300 text-sm font-medium mb-6 animate-fade-in-up">
              <MapPin className="w-4 h-4" />
              Kota Makassar, Sulawesi Selatan
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Selamat Datang di <span className="text-gold-400">Kelurahan Mamajang Luar</span>
            </h1>
            <p className="mt-6 text-lg text-stone-200 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Sistem informasi resmi Kelurahan Mamajang Luar. Temukan informasi layanan publik,
              berita terkini, potensi UMKM warga, serta saluran pengaduan dalam satu portal.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/kontak"
                className="shimmer-btn px-6 py-3 rounded-xl bg-makassar-800 text-white font-semibold hover:bg-makassar-700 transition-colors shadow-lg shadow-makassar-800/30 inline-flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4 text-gold-300" />
                <span>Laporkan Pengaduan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#spk-tracker-section"
                className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Search className="w-4 h-4 text-gold-300" />
                <span>Lacak Tiket Aduan</span>
              </a>
              <Link
                to="/layanan"
                className="px-4 py-3 rounded-xl text-stone-300 hover:text-white font-medium text-xs sm:text-sm underline-offset-4 hover:underline inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Prosedur Layanan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-50 to-transparent h-20" />
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-makassar-800">{s.value}</p>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">{s.label}</p>
              <p className="text-[11px] text-stone-400">{s.suffix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Centerpiece: Interactive SPK SAW Complaint & Ticket Tracking Widget */}
      <HomeSpkTracker />

      {/* Highlights — anti-slop: varied layout, primary card larger than secondary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Primary highlight — spans 3 cols, visually heavier */}
          <div
            className="md:col-span-3 group p-8 sm:p-10 rounded-2xl bg-makassar-800 text-white hover:bg-makassar-900 transition-colors animate-fade-in-up"
          >
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-5">
              <highlightPrimary.icon className="w-7 h-7 text-gold-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">{highlightPrimary.title}</h3>
            <p className="text-makassar-100 leading-relaxed max-w-md">{highlightPrimary.desc}</p>
          </div>

          {/* Secondary highlights — span 2 cols, stacked */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {highlightSecondary.map((h, i) => (
              <div
                key={h.title}
                className="group p-6 rounded-2xl bg-white border border-stone-100 hover:border-makassar-200 hover:shadow-lg transition-all animate-fade-in-up flex-1"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-makassar-50 flex items-center justify-center mb-4 group-hover:bg-makassar-100 transition-colors">
                  <h.icon className="w-6 h-6 text-makassar-800" />
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">{h.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: FileText, title: 'Profil Kelurahan', desc: 'Visi-misi, sejarah & struktur', to: '/profil' },
            { icon: Users, title: 'Layanan Publik', desc: 'Ajukan online via Google Form', to: '/layanan' },
            { icon: Store, title: 'Potensi & UMKM', desc: 'Direktori & promosi usaha warga', to: '/umkm' },
            { icon: Phone, title: 'Aspirasi & Darurat', desc: 'Pengaduan & nomor satgas wilayah', to: '/kontak' },
          ].map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group p-6 rounded-2xl bg-gradient-to-br from-white to-stone-50 border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-makassar-800 flex items-center justify-center shadow-md">
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-makassar-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-stone-800">{c.title}</h3>
              <p className="text-sm text-stone-500 mt-1">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-makassar-700 font-semibold text-sm mb-2">
              <Newspaper className="w-4 h-4" /> Berita & Pengumuman
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Kabar Terbaru Kelurahan</h2>
          </div>
          <Link to="/berita" className="text-sm font-semibold text-makassar-700 hover:text-makassar-800 inline-flex items-center gap-1">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
              <div className="h-64 bg-stone-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-stone-200 rounded w-24" />
                <div className="h-6 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-100 overflow-hidden animate-pulse flex">
                  <div className="w-32 h-28 bg-stone-200 shrink-0" />
                  <div className="p-4 space-y-2 flex-1">
                    <div className="h-3 bg-stone-200 rounded w-16" />
                    <div className="h-4 bg-stone-200 rounded w-full" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured news — first item, larger */}
            {news[0] && (
              <Link
                key={news[0].id}
                to={`/berita/${news[0].id}`}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={news[0].image_url ?? ''}
                    alt={news[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-lg bg-makassar-50 text-makassar-800 text-xs font-medium mb-3">
                    {news[0].category}
                  </span>
                  <h3 className="text-lg font-bold text-stone-800 leading-snug mb-2 line-clamp-2 group-hover:text-makassar-800 transition-colors">
                    {news[0].title}
                  </h3>
                  <p className="text-sm text-stone-500 line-clamp-3">{news[0].excerpt}</p>
                  <p className="text-xs text-stone-400 mt-3">
                    {new Date(news[0].published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            )}

            {/* Supporting news — smaller horizontal cards */}
            <div className="flex flex-col gap-4">
              {news.slice(1).map((item) => (
                <Link
                  key={item.id}
                  to={`/berita/${item.id}`}
                  className="group bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all flex"
                >
                  <div className="w-32 sm:w-40 h-full overflow-hidden shrink-0">
                    <img
                      src={item.image_url ?? ''}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-center">
                    <span className="inline-block w-fit px-2 py-0.5 rounded-md bg-makassar-50 text-makassar-800 text-[11px] font-medium mb-2">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-sm text-stone-800 leading-snug mb-1 line-clamp-2 group-hover:text-makassar-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Gallery preview */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-2 text-makassar-700 font-semibold text-sm mb-2">
                <Images className="w-4 h-4" /> Galeri Kegiatan
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Momen Warga Mamajang Luar</h2>
            </div>
            <Link to="/berita" className="text-sm font-semibold text-makassar-700 hover:text-makassar-800 inline-flex items-center gap-1">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="group relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={g.image_url}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-makassar-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-xs font-medium">{g.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-makassar-700 font-semibold text-sm mb-2">
            <FileText className="w-4 h-4" /> Layanan Publik
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Prosedur Layanan Administrasi</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto">
            Pelajari prosedur pengurusan dokumen kependudukan dan surat-surat keterangan di kelurahan.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Link
              key={s.id}
              to="/layanan"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-stone-100 hover:border-makassar-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center shrink-0 group-hover:bg-makassar-100 transition-colors">
                <FileText className="w-6 h-6 text-makassar-700" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 group-hover:text-makassar-800 transition-colors">{s.title}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA — anti-slop: no floating circles, no decorative icon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-makassar-800 to-makassar-950 p-10 sm:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Butuh Bantuan atau Ingin Menyampaikan Pengaduan?</h2>
          <p className="text-makassar-100 max-w-xl mx-auto mb-8">
            Tim pelayanan Kelurahan Mamajang Luar siap membantu kebutuhan administrasi dan
            menampung setiap saran serta pengaduan warga.
          </p>
          <Link
            to="/kontak"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-makassar-800 font-semibold hover:bg-makassar-50 transition-colors shadow-lg"
          >
            Sampaikan Pengaduan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
