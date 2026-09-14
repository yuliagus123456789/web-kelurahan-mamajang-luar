import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { NewsItem, GalleryItem } from '@/lib/types';
import { Newspaper, Images, ArrowLeft, Calendar, X } from 'lucide-react';
import { OFFICIAL_NEWS_DATA, OFFICIAL_GALLERY_DATA } from '@/data/newsAndGalleryData';

export default function BeritaPage() {
  const { path, navigate } = useRouter();
  const detailId = path.startsWith('/berita/') ? path.split('/')[2] : null;

  const [news, setNews] = useState<NewsItem[]>(OFFICIAL_NEWS_DATA);
  const [gallery, setGallery] = useState<GalleryItem[]>(OFFICIAL_GALLERY_DATA);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    if (lightbox) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lightbox]);

  useEffect(() => {
    (async () => {
      try {
        const [n, g] = await Promise.all([
          supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }),
          supabase.from('gallery').select('*').order('event_date', { ascending: false }),
        ]);
        if (n.data && n.data.length > 0) {
          setNews(n.data);
        } else {
          setNews(OFFICIAL_NEWS_DATA);
        }
        if (g.data && g.data.length > 0) {
          setGallery(g.data);
        } else {
          setGallery(OFFICIAL_GALLERY_DATA);
        }
      } catch (err) {
        console.warn('Using official local news & gallery:', err);
        setNews(OFFICIAL_NEWS_DATA);
        setGallery(OFFICIAL_GALLERY_DATA);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(news.map((n) => n.category)))];
  const filtered = activeCategory === 'Semua' ? news : news.filter((n) => n.category === activeCategory);
  const detail = detailId ? news.find((n) => n.id === detailId) : null;

  if (detailId && detail) {
    return (
      <div className="pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/berita')}
            className="inline-flex items-center gap-2 text-sm font-medium text-makassar-800 hover:text-makassar-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Berita
          </button>

          <span className="inline-block px-3 py-1 rounded-full bg-makassar-50 text-makassar-800 text-xs font-medium mb-4">
            {detail.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 leading-tight">{detail.title}</h1>
          <p className="flex items-center gap-2 text-sm text-stone-500 mt-3">
            <Calendar className="w-4 h-4" />
            {new Date(detail.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {detail.image_url && (
            <div className="mt-6 rounded-2xl overflow-hidden">
              <img src={detail.image_url} alt={detail.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <div className="mt-8 prose prose-slate max-w-none">
            {detail.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-stone-600 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Banner */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/16204518/pexels-photo-16204518.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Berita"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 to-makassar-950/60" />
        </div>
        <div className="relative text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Berita & Kegiatan</h1>
          <nav className="mt-3 text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-300">Berita & Kegiatan</span>
          </nav>
        </div>
      </section>

      {/* Berita */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-makassar-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Berita & Pengumuman Resmi</h2>
            <p className="text-sm text-stone-500">Kabar terbaru dari Kelurahan Mamajang Luar</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === c
                  ? 'bg-makassar-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-20" />
                  <div className="h-5 bg-stone-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                to={`/berita/${item.id}`}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image_url ?? ''}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block px-3 py-1 rounded-full bg-makassar-50 text-makassar-800 text-xs font-medium mb-3">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-stone-800 leading-snug mb-2 line-clamp-2 group-hover:text-makassar-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-500 line-clamp-2">{item.excerpt}</p>
                  <p className="text-xs text-stone-400 mt-3">
                    {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Galeri */}
      <section className="bg-stone-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center">
              <Images className="w-6 h-6 text-makassar-800" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Galeri Kegiatan Warga / KKN</h2>
              <p className="text-sm text-stone-500">Dokumentasi kegiatan warga dan program KKN di Mamajang Luar</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <button
                key={g.id}
                onClick={() => setLightbox(g)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden text-left"
              >
                <img
                  src={g.image_url}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-makassar-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium">{g.title}</p>
                  {g.event_date && (
                    <p className="text-stone-300 text-xs mt-0.5">
                      {new Date(g.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-stone-900/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.title} className="w-full rounded-2xl" />
            <div className="mt-4 text-center">
              <h3 className="text-white font-bold text-lg">{lightbox.title}</h3>
              {lightbox.description && <p className="text-stone-300 text-sm mt-1">{lightbox.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
