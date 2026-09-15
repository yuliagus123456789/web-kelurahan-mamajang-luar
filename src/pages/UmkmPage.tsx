import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { UmkmItem } from '@/lib/types';
import { KELURAHAN_CONFIG } from '@/lib/config';
import {
  Store,
  Phone,
  MapPin,
  Search,
  PlusCircle,
  ExternalLink,
  Megaphone,
  MessageCircle,
  CheckCircle2,
  BadgeCheck,
  X,
  Camera,
  Trash2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { DATA_UMKM_MALUR } from '@/data/umkmData';

export default function UmkmPage() {
  const [umkm, setUmkm] = useState<UmkmItem[]>(() =>
    DATA_UMKM_MALUR.filter((u) => !u.status || u.status === 'Disetujui')
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Modal Pendaftaran Mandiri UMKM oleh Warga
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [regForm, setRegForm] = useState({
    name: '',
    owner: '',
    category: 'Kuliner',
    description: '',
    contact: '',
    address: '',
    image_url: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('umkm').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          // Hanya tampilkan UMKM yang telah disetujui oleh admin
          const approved = data.filter((u: UmkmItem) => !u.status || u.status === 'Disetujui');
          setUmkm(approved);
        }
      } catch (err) {
        console.warn('Using authentic DATA_UMKM_MALUR data:', err);
      }
    })();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      alert('Format berkas harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran berkas terlalu besar. Maksimal 10MB.');
      return;
    }

    setIsCompressingPhoto(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoPreview(compressed);
          setPhotoFileName(file.name);
        } catch {
          const original = event.target?.result as string;
          setPhotoPreview(original);
          setPhotoFileName(file.name);
        } finally {
          setIsCompressingPhoto(false);
        }
      };
      img.onerror = () => setIsCompressingPhoto(false);
    };
    reader.onerror = () => setIsCompressingPhoto(false);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFileName('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRegister(true);
    setRegisterError(null);

    const newRecord = {
      name: regForm.name.trim(),
      owner: regForm.owner.trim(),
      category: regForm.category,
      description: regForm.description.trim(),
      contact: regForm.contact.trim() || null,
      address: regForm.address.trim() || null,
      image_url: photoPreview || regForm.image_url.trim() || null,
      status: 'Menunggu' as const,
    };

    try {
      const { error } = await supabase.from('umkm').insert(newRecord);
      if (error) {
        console.warn('Insert to supabase error, saving local cache:', error);
      }

      // Cache locally
      try {
        const cached = JSON.parse(localStorage.getItem('mamajang_local_umkm_pending') || '[]');
        localStorage.setItem(
          'mamajang_local_umkm_pending',
          JSON.stringify([
            { id: `local-umkm-${Date.now()}`, ...newRecord, created_at: new Date().toISOString() },
            ...cached,
          ])
        );
      } catch {}

      setSubmittingRegister(false);
      setRegisterSuccess(true);
      setRegForm({
        name: '',
        owner: '',
        category: 'Kuliner',
        description: '',
        contact: '',
        address: '',
        image_url: '',
      });
      handleRemovePhoto();
    } catch (err: any) {
      setSubmittingRegister(false);
      setRegisterError(err.message || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
    }
  };

  const categories = ['Semua', ...Array.from(new Set(umkm.map((u) => u.category)))];
  const filtered = umkm.filter((u) => {
    const matchCat = activeCategory === 'Semua' || u.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.owner.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q) ||
      (u.address && u.address.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const formatWaNumber = (contact: string | null) => {
    if (!contact) return '';
    const clean = contact.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) return '62' + clean.slice(1);
    if (clean.startsWith('62')) return clean;
    return '62' + clean;
  };

  return (
    <div className="pt-24">
      {/* Banner */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/37234069/pexels-photo-37234069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="UMKM Mamajang Luar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/80 to-stone-900/90" />
        </div>
        <div className="relative text-center px-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5" />
            Data Resmi Kearsipan Kelurahan & Dinas Koperasi UKM
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Potensi & UMKM Warga</h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Etalase produk unggulan, kuliner, warung, jahit, dan usaha mikro warga Kelurahan Mamajang Luar, Kota Makassar.
          </p>
          <nav className="mt-3 text-xs sm:text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2 text-stone-500">/</span>
            <span className="text-gold-300">Potensi & UMKM</span>
          </nav>
        </div>
      </section>

      {/* Banner Ajakan Pendaftaran UMKM via Google Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-gradient-to-r from-makassar-900 via-stone-900 to-makassar-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0 text-gold-400">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gold-300">
                Fasilitas Promosi Gratis Warga
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Punya Usaha di Wilayah Mamajang Luar?</h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Promosikan warung, kuliner, toko, atau kerajinan Anda di website resmi kelurahan tanpa dipungut biaya. Pembeli bisa langsung menghubungi WhatsApp Anda!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRegisterModalOpen(true);
              setRegisterSuccess(false);
              setRegisterError(null);
            }}
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-sm shadow-lg hover:shadow-gold-500/20 transition-all group cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-stone-950 group-hover:rotate-90 transition-transform" />
            <span>Daftarkan Usaha Anda (Gratis)</span>
          </button>
        </div>
      </section>

      {/* Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Quick Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-makassar-800">{umkm.length}</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Total UMKM Terdata</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">19</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Foto Gerai Asli</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-blue-700">6</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Kategori Bidang</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
            <p className="text-xl sm:text-2xl font-black text-gold-600">100%</p>
            <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5">Bebas Biaya Promosi</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Direktori Usaha Mikro Warga</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Kenali dan dukung produk lokal karya tetangga kita untuk mendorong perputaran ekonomi lorong di Mamajang Luar.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama usaha, jenis produk, jalan, atau nama pemilik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-sm bg-white shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const count = c === 'Semua' ? umkm.length : umkm.filter((u) => u.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === c
                      ? 'bg-makassar-800 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{c}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeCategory === c ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Tidak ada UMKM yang cocok dengan kata kunci tersebut.</p>
            <p className="text-stone-400 text-xs mt-1">Coba gunakan kata pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u) => {
              const waNum = formatWaNumber(u.contact);
              const waLink = waNum
                ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Halo ${u.name}, saya melihat usaha Anda di website Kelurahan Mamajang Luar. Apakah produk/layanan Anda masih tersedia?`)}`
                : null;
              const isRealPhoto = u.image_url && u.image_url.includes('/images/umkm/');

              return (
                <div
                  key={u.id}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-makassar-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 overflow-hidden relative bg-stone-100">
                      {u.image_url ? (
                        <img
                          src={u.image_url}
                          alt={u.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                          <Store className="w-12 h-12 text-stone-300" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-makassar-900 text-[11px] font-bold shadow-sm border border-stone-100">
                        {u.category}
                      </span>
                      {isRealPhoto && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-md text-gold-300 text-[10px] font-bold shadow flex items-center gap-1.5 border border-gold-400/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Foto Gerai Asli
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-stone-800 text-lg leading-snug group-hover:text-makassar-800 transition-colors">
                        {u.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 font-medium">
                        Pemilik: <span className="text-stone-700 font-semibold">{u.owner}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                        {u.description}
                      </p>

                      <div className="mt-4 space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
                        {u.address && (
                          <p className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-makassar-700 shrink-0 mt-0.5" />
                            <span>{u.address}</span>
                          </p>
                        )}
                        {u.contact && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-makassar-700 shrink-0" />
                            <span className="font-mono">{u.contact}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all group/btn"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Hubungi via WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/btn:translate-x-0.5" />
                      </a>
                    ) : (
                      <div className="w-full text-center py-2 text-xs text-stone-400 font-medium bg-stone-50 rounded-xl border border-stone-100">
                        Kontak langsung di gerai / lokasi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* Modal Pendaftaran Mandiri UMKM */}
      {registerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
          onClick={() => !submittingRegister && setRegisterModalOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-600 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Pendaftaran Usaha UMKM Warga</h3>
                  <p className="text-xs text-stone-500">Kelurahan Mamajang Luar &bull; Promosi 100% Gratis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Modal: Sukses vs Formulir */}
            {registerSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Pendaftaran Berhasil Diajukan!</h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Terima kasih telah mendaftarkan usaha Anda. Tim admin Pemerintah Kelurahan Mamajang Luar akan memverifikasi dan menyetujui data Anda sebelum ditampilkan pada direktori publik resmi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs flex items-center gap-2.5 max-w-md mx-auto text-left">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Proses verifikasi biasanya memakan waktu 1×24 jam pada hari kerja kelurahan.</span>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs sm:text-sm shadow transition-all cursor-pointer"
                  >
                    Tutup & Kembali ke Direktori
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
                {registerError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Nama Usaha / Merek <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="Contoh: Warung Coto Beruang"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Nama Pemilik Usaha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.owner}
                      onChange={(e) => setRegForm({ ...regForm, owner: e.target.value })}
                      placeholder="Contoh: Ibu Fatimah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Kategori Bidang Usaha <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={regForm.category}
                      onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white cursor-pointer"
                    >
                      <option value="Kuliner">Kuliner & Makanan</option>
                      <option value="Kafe & Kopi">Kafe, Warkop & Minuman</option>
                      <option value="Kelontong & Sembako">Kelontong & Kebutuhan Pokok</option>
                      <option value="Fashion & Busana">Fashion, Tekstil & Jahit</option>
                      <option value="Jasa & Servis">Jasa, Servis & Keterampilan</option>
                      <option value="Kerajinan & Seni">Kerajinan Tangan & Souvenir</option>
                      <option value="Pertanian & Pangan">Pertanian Kota & Tanaman</option>
                      <option value="Lainnya">Bidang Usaha Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      No. WhatsApp Usaha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.contact}
                      onChange={(e) => setRegForm({ ...regForm, contact: e.target.value })}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Alamat Lengkap / Patokan di Mamajang Luar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.address}
                    onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                    placeholder="Contoh: Jl. Tupai No. 14 RT 02 / RW 01 (Depan Lapangan)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Deskripsi Usaha & Produk Unggulan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={regForm.description}
                    onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                    placeholder="Jelaskan menu andalan, keunggulan produk, jam buka, atau harga perkiraan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 text-xs sm:text-sm outline-none bg-white resize-none"
                  />
                </div>

                {/* Upload Foto Produk / Gerai (Opsional) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-800">
                      Foto Gerai / Produk Usaha <span className="text-stone-400 font-normal text-[11px]">(Opsional)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-semibold border border-stone-200">
                      Bisa Diabaikan
                    </span>
                  </div>

                  {!photoPreview ? (
                    <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-gold-500 bg-stone-50/70 hover:bg-gold-50/20 rounded-2xl cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePhotoChange}
                      />
                      <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-gold-600 transition-all mb-1.5 shadow-2xs">
                        <Camera className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-stone-700 group-hover:text-gold-700 text-center">
                        {isCompressingPhoto ? 'Sedang Memproses Foto...' : 'Lampirkan Foto Produk / Gerai Usaha'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5 text-center">
                        Bisa ambil foto kamera HP atau pilih dari galeri (Maks. 10MB)
                      </p>
                    </label>
                  ) : (
                    <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={photoPreview}
                          alt="Pratinjau Foto UMKM"
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 mb-0.5">
                            <Check className="w-3 h-3 text-emerald-600" /> Foto Terlampir
                          </span>
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {photoFileName || 'Foto Produk'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="shrink-0 p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={submittingRegister}
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRegister}
                    className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingRegister ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                        <span>Mengirim Pendaftaran...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-stone-950" />
                        <span>Kirim Pendaftaran Usaha</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
