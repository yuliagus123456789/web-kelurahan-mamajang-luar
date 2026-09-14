import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { ServiceItem } from '@/lib/types';
import { KELURAHAN_CONFIG } from '@/lib/config';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Users,
  MapPin,
  Store,
  Heart,
  ShieldCheck,
  Send,
  ExternalLink,
  Info,
  AlertCircle,
} from 'lucide-react';

const iconMap: Record<string, typeof FileText> = {
  CreditCard,
  Users,
  MapPin,
  Store,
  Heart,
  FileText,
};

interface ServiceDetail {
  id: string;
  title: string;
  category: 'Kependudukan' | 'Keterangan' | 'Sosial & Usaha';
  description: string;
  syarat: string[];
  estimasi: string;
  biaya: string;
  steps: string[];
  icon: string;
  formUrl?: string;
  pdfForm?: string;
}

const DEFAULT_DETAILED_SERVICES: ServiceDetail[] = [
  {
    id: 'sku',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Sosial & Usaha',
    description: 'Surat resmi untuk bukti legalitas operasional usaha mikro, kecil, maupun menengah di wilayah Kelurahan Mamajang Luar.',
    syarat: [
      'Surat Pengantar dari Ketua RT / RW setempat',
      'Fotokopi KTP Elektronik Pemilik Usaha',
      'Fotokopi Kartu Keluarga (KK)',
      'Foto tempat usaha / aktivitas perniagaan di lokasi',
    ],
    estimasi: '15 - 30 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Siapkan berkas fotokopi KTP, KK, dan Surat Pengantar RT/RW',
      'Isi formulir pengajuan online via Google Form atau datang ke loket',
      'Petugas kelurahan memverifikasi data dan lokasi usaha',
      'Penandatanganan surat oleh Lurah / Sekretaris Kelurahan',
      'Surat Keterangan Usaha diterbitkan dan dapat diambil',
    ],
    icon: 'Store',
    pdfForm: 'Formulir_SKU_Mamajang_Luar.pdf',
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Sosial & Usaha',
    description: 'Surat keterangan untuk keperluan beasiswa pendidikan, pengajuan KIS/BPJS PBI, atau keringanan biaya pengobatan.',
    syarat: [
      'Surat Pengantar RT / RW yang menyatakan kondisi ekonomi pemohon',
      'Fotokopi KTP Pemohon / Kepala Keluarga',
      'Fotokopi Kartu Keluarga (KK)',
      'Foto rumah / tempat tinggal tampak depan',
      'Surat keterangan rekomendasi sekolah/kampus/RS (jika ada)',
    ],
    estimasi: '15 - 30 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Dapatkan surat pengantar tanda tangan RT dan RW setempat',
      'Unggah berkas melalui Google Form Layanan Surat atau bawa ke kantor',
      'Validasi data terpadu kesejahteraan sosial oleh Kasi Kesos',
      'Penerbitan surat keterangan resmi bertandatangan Lurah',
    ],
    icon: 'Heart',
    pdfForm: 'Formulir_SKTM_Mamajang_Luar.pdf',
  },
  {
    id: 'domisili',
    title: 'Surat Keterangan Domisili Warga',
    category: 'Keterangan',
    description: 'Keterangan tempat tinggal resmi bagi warga yang bertempat tinggal di Mamajang Luar untuk kebutuhan kerja atau perbankan.',
    syarat: [
      'Surat Pengantar RT / RW setempat',
      'Fotokopi KTP Elektronik',
      'Fotokopi Kartu Keluarga (KK)',
      'Surat pernyataan sewa / pemilik kontrakan (bila menyewa)',
    ],
    estimasi: '15 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Minta Surat Pengantar ke Ketua RT dan RW domisili tempat tinggal',
      'Kirim data permohonan via Google Form atau datang langsung ke loket',
      'Pengecekan kesesuaian alamat oleh staf administrasi kelurahan',
      'Surat Domisili selesai dan distempel resmi kelurahan',
    ],
    icon: 'MapPin',
    pdfForm: 'Formulir_Domisili_Mamajang_Luar.pdf',
  },
  {
    id: 'nikah',
    title: 'Surat Pengantar Nikah (Model N-1 / N-4)',
    category: 'Kependudukan',
    description: 'Surat pengantar kelurahan sebagai syarat mutlak pendaftaran pernikahan di Kantor Urusan Agama (KUA) Kecamatan Mamajang.',
    syarat: [
      'Surat Pengantar RT / RW setempat',
      'Fotokopi KTP calon mempelai dan orang tua/wali',
      'Fotokopi Kartu Keluarga calon mempelai',
      'Fotokopi Akta Kelahiran & Ijazah terakhir',
      'Pas foto 3x4 latar biru (4 lembar)',
      'Akta Cerai / Kematian (jika berstatus duda/janda)',
    ],
    estimasi: '30 - 45 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Penuhi berkas pengantar dari RT/RW lingkungan',
      'Ajukan berkas lewat Google Form atau serahkan ke staf loket umum',
      'Pemeriksaan kelengkapan berkas syarat KUA oleh Seklur / Kasi',
      'Penandatanganan blangko N-1, N-2, dan N-4 oleh Lurah',
      'Pengambilan berkas untuk dibawa ke KUA Mamajang',
    ],
    icon: 'Users',
    pdfForm: 'Formulir_Pengantar_Nikah_Mamajang_Luar.pdf',
  },
  {
    id: 'ktp',
    title: 'Pengantar Rekam & Cetak KTP-el',
    category: 'Kependudukan',
    description: 'Surat pengantar pembuatan KTP pemula (usia 17 tahun), penggantian KTP rusak, atau penerbitan surat kehilangan KTP.',
    syarat: [
      'Surat Pengantar RT / RW',
      'Fotokopi Kartu Keluarga (KK) terbaru',
      'KTP lama (bila mengajukan penggantian KTP rusak)',
      'Surat Kehilangan dari Polsek Mamajang (bila KTP hilang)',
    ],
    estimasi: '15 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Minta surat pengantar RT/RW',
      'Isi data permohonan di formulir online atau loket kantor kelurahan',
      'Petugas meregister dan mengeluarkan Surat Pengantar Disdukcapil',
      'Warga melanjutkan perekaman biometrik di Kantor Camat Mamajang / Disdukcapil',
    ],
    icon: 'CreditCard',
    pdfForm: 'Formulir_Pengantar_KTP_Mamajang_Luar.pdf',
  },
  {
    id: 'kk',
    title: 'Pengantar Kartu Keluarga (KK Baru / Pecah KK)',
    category: 'Kependudukan',
    description: 'Layanan pengantar pembentukan KK baru bagi pasangan baru, penambahan anggota keluarga, atau perubahan data elemen kependudukan.',
    syarat: [
      'Surat Pengantar RT / RW setempat',
      'Kartu Keluarga (KK) asli lama',
      'Buku Nikah / Akta Perkawinan (jika membentuk KK baru)',
      'Surat Keterangan Pindah (SKP) bila datang dari luar wilayah',
      'Akta Kelahiran bagi penambahan anggota keluarga baru',
    ],
    estimasi: '20 Menit',
    biaya: 'Rp 0,- (GRATIS)',
    steps: [
      'Lapor ke RT dan RW untuk mendapatkan surat pengantar',
      'Isi formulir pengajuan online via Google Form',
      'Pemeriksaan berkas kependudukan oleh petugas kelurahan',
      'Surat pengantar diterbitkan untuk diproses pencetakan ke Disdukcapil',
    ],
    icon: 'FileText',
    pdfForm: 'Formulir_Perubahan_KK_Mamajang_Luar.pdf',
  },
];

const downloads = [
  { name: 'Formulir Permohonan KTP-el', desc: 'Format cetak pengajuan KTP baru / penggantian', size: '215 KB' },
  { name: 'Formulir Permohonan KK', desc: 'Format cetak pembuatan / perubahan Kartu Keluarga', size: '180 KB' },
  { name: 'Formulir Surat Domisili', desc: 'Format cetak permohonan surat keterangan domisili', size: '142 KB' },
  { name: 'Formulir Surat Keterangan Usaha (SKU)', desc: 'Format cetak pengajuan SKU bagi pelaku UMKM', size: '158 KB' },
  { name: 'Formulir Pengantar Nikah (N-1)', desc: 'Format cetak pengurusan surat pengantar nikah ke KUA', size: '196 KB' },
  { name: 'Formulir SKTM', desc: 'Format cetak surat keterangan tidak mampu beasiswa/kesehatan', size: '175 KB' },
];

export default function LayananPage() {
  const [services, setServices] = useState<ServiceDetail[]>(DEFAULT_DETAILED_SERVICES);
  const [openId, setOpenId] = useState<string | null>('sku');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('services').select('*').order('title');
        if (data && data.length > 0) {
          // Merge data from supabase with rich details
          const merged = DEFAULT_DETAILED_SERVICES.map((def) => {
            const match = data.find((d: ServiceItem) => d.title.toLowerCase().includes(def.id) || def.title.toLowerCase().includes(d.title.toLowerCase()));
            if (match) {
              return { ...def, title: match.title, description: match.description || def.description };
            }
            return def;
          });
          setServices(merged);
        }
      } catch (err) {
        console.warn('Using default services configuration:', err);
      }
    })();
  }, []);

  const categories = ['Semua', 'Kependudukan', 'Keterangan', 'Sosial & Usaha'];

  const filteredServices =
    activeCategory === 'Semua'
      ? services
      : services.filter((s) => s.category === activeCategory);

  const handleDownload = (name: string) => {
    // Memberi notifikasi siap unduh formulir
    alert(`Mengunduh berkas blangko: ${name}. Formulir siap dicetak.`);
  };

  return (
    <div className="pt-24">
      {/* Banner Header */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/633017/pexels-photo-633017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Layanan Publik"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/80 to-stone-900/90" />
        </div>
        <div className="relative text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Layanan Publik & Administrasi</h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Kemudahan pengurusan dokumen kependudukan warga Kelurahan Mamajang Luar secara transparan dan cepat.
          </p>
          <nav className="mt-3 text-xs sm:text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2 text-stone-500">/</span>
            <span className="text-gold-300">Layanan Publik</span>
          </nav>
        </div>
      </section>

      {/* Maklumat Integritas & Bebas Pungli */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-600/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">Maklumat Integritas Pelayanan</p>
              <h2 className="text-lg sm:text-xl font-bold">100% Bebas Biaya (GRATIS) & Anti Pungli</h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Seluruh pelayanan surat tidak dipungut biaya apapun. Jangan ragu melapor jika menemukan pungutan liar.
              </p>
            </div>
          </div>
          <a
            href={KELURAHAN_CONFIG.googleForms.pengaduanWarga}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            Lapor Pungli
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Google Form Online Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-br from-makassar-900 via-stone-900 to-makassar-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-gold-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold mb-3 border border-gold-500/30">
                <Send className="w-3.5 h-3.5" /> Pelayanan Mandiri Berbasis Google Form
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Ajukan Permohonan Surat Dari Rumah
              </h2>
              <p className="text-stone-300 text-sm mt-2 leading-relaxed">
                Kini warga tidak perlu antre panjang di kantor lurah. Cukup isi formulir Google Form, unggah foto KTP & KK, dan petugas kami akan segera memproses berkas Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href={KELURAHAN_CONFIG.googleForms.pengajuanSurat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 font-bold text-sm shadow-md transition-all group"
              >
                <span>Buka Google Form Surat</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href={`https://wa.me/${KELURAHAN_CONFIG.whatsappPelayanan.nomor}?text=${encodeURIComponent('Halo Petugas Kelurahan Mamajang Luar, saya ingin menanyakan status berkas permohonan surat saya.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/20"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Prosedur & Persyaratan Interaktif */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-makassar-800 font-semibold text-sm mb-2">
            <FileText className="w-4 h-4" /> Persyaratan & Alur Berkas
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Katalog Layanan Surat Administrasi</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Pilih jenis surat di bawah untuk mengecek syarat berkas, lama waktu proses, dan langsung mengisi formulir pengajuan online.
          </p>

          {/* Kategori Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-makassar-800 text-white shadow-md'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Kartu Layanan Interaktif */}
        <div className="space-y-4">
          {filteredServices.map((s) => {
            const Icon = iconMap[s.icon] ?? FileText;
            const isOpen = openId === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-makassar-400/50 bg-white shadow-lg ring-1 ring-makassar-800/10'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-stone-50/70"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isOpen ? 'bg-makassar-800 text-white shadow-sm' : 'bg-makassar-50 text-makassar-800'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-800 text-base sm:text-lg">{s.title}</h3>
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                          {s.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-500 mt-0.5 line-clamp-1">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      <Clock className="w-3.5 h-3.5" /> {s.estimasi}
                    </span>
                    <div className="p-1 rounded-lg bg-stone-100 text-stone-600">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-2 border-t border-stone-100 bg-stone-50/50">
                    {/* Ringkasan Parameter */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase">Biaya Pelayanan</span>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5">{s.biaya}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase">Estimasi Waktu</span>
                        <p className="text-sm font-bold text-stone-800 mt-0.5">{s.estimasi}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase">Metode Pengajuan</span>
                        <p className="text-sm font-bold text-makassar-800 mt-0.5">Online (GForm) / Loket</p>
                      </div>
                    </div>

                    {/* Dua Kolom: Persyaratan & Langkah Alur */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Dokumen Persyaratan */}
                      <div className="bg-white rounded-xl p-4 border border-stone-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dokumen Persyaratan
                        </h4>
                        <ul className="space-y-2">
                          {s.syarat.map((sy, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                              <span>{sy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Alur Pengurusan */}
                      <div className="bg-white rounded-xl p-4 border border-stone-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-3">
                          <Info className="w-4 h-4 text-makassar-800" /> Alur Pemrosesan Berkas
                        </h4>
                        <ol className="space-y-2.5">
                          {s.steps.map((st, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-makassar-100 text-makassar-900 font-bold text-[11px] shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Tombol Aksi Permohonan */}
                    <div className="mt-5 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-stone-500 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-gold-600 shrink-0" />
                        Pastikan data dan nomor WhatsApp yang dimasukkan aktif untuk konfirmasi.
                      </p>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <a
                          href={KELURAHAN_CONFIG.googleForms.pengajuanSurat}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold shadow transition-all group"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ajukan Surat via Google Form</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Loket & Jam Pelayanan */}
      <section className="bg-stone-100/70 py-14 border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Clock,
                title: 'Jam Pelayanan Loket',
                value: 'Senin - Kamis: 07.30 - 16.00 WITA\nJumat: 07.30 - 11.00 WITA',
                highlight: 'Buka Hari Kerja',
              },
              {
                icon: Phone,
                title: 'Layanan Tanya Jawab WA',
                value: `${KELURAHAN_CONFIG.whatsappPelayanan.nomorTampilan}\n${KELURAHAN_CONFIG.whatsappPelayanan.jamLayanan}`,
                highlight: 'Responsif',
              },
              {
                icon: CheckCircle2,
                title: 'Biaya Retribusi',
                value: 'Rp 0,- (GRATIS)\nBebas Pungutan Liar & Suap',
                highlight: 'Integritas 100%',
              },
            ].map((c) => (
              <div key={c.title} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 uppercase">
                    {c.highlight}
                  </span>
                </div>
                <h3 className="font-bold text-stone-800">{c.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 whitespace-pre-line leading-relaxed">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Center Formulir Blanko */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-makassar-800 font-semibold text-sm mb-2">
            <Download className="w-4 h-4" /> Download Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Unduh Formulir Blanko Administrasi</h2>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Bila Anda ingin mengisi secara manual dan membawa berkas langsung ke loket kantor lurah, silakan unduh format PDF di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {downloads.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between p-5 rounded-2xl bg-white border border-stone-200 hover:border-makassar-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-sm">{d.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{d.desc}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-mono">PDF &middot; {d.size}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(d.name)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-makassar-800 hover:text-white transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Unduh
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
