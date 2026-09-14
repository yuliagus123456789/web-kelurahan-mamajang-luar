import { useState } from 'react';
import { Link } from '@/lib/router';
import { KELURAHAN_CONFIG } from '@/lib/config';
import StrukturOrganisasiChart from '@/components/StrukturOrganisasiChart';
import {
  Target,
  Eye,
  Compass,
  Users,
  MapPin,
  History,
  Building2,
  Award,
  CheckCircle2,
  Landmark,
  Briefcase,
  ClipboardList,
  HeartHandshake,
  Shield,
  Phone,
  UserCheck,
  Calendar,
  Home,
  Check,
  Layers,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

const tabs = [
  { id: 'sejarah', label: 'Profil & Sejarah', icon: History },
  { id: 'visimisi', label: 'Visi & Misi', icon: Compass },
  { id: 'struktur', label: 'Struktur Organisasi', icon: Users },
  { id: 'rtrw', label: 'Direktori RW & RT (16 RT)', icon: Home },
  { id: 'protokol', label: 'Protokol Kerja RT/RW', icon: Calendar },
  { id: 'peta', label: 'Peta & Fasilitas Wilayah', icon: MapPin },
];

const visi =
  'Terwujudnya Kelurahan Mamajang Luar yang Maju, Mandiri, Sejahtera, dan Berakhlak dalam pelayanan publik yang prima berbasis teknologi dan gotong royong warga.';

const misi = [
  'Meningkatkan kualitas pelayanan publik administrasi kependudukan yang cepat, tepat, transparan, dan bebas biaya.',
  'Membangun tata kelola pemerintahan kelurahan yang bersih, akuntabel, dan berintegritas.',
  'Memberdayakan potensi ekonomi warga melalui pengembangan UMKM dan program ketahanan pangan Urban Farming.',
  'Meningkatkan partisipasi aktif warga dalam pembangunan lorong, pemeliharaan kebersihan lingkungan, dan kegiatan sosial.',
  'Menciptakan lingkungan yang aman, tertib, sehat, dan nyaman bagi seluruh keluarga di Mamajang Luar.',
];

export default function ProfilPage() {
  const [active, setActive] = useState('sejarah');
  const [selectedRwFilter, setSelectedRwFilter] = useState<string>('Semua');

  const filteredRT = KELURAHAN_CONFIG.daftarRT.filter((item) => {
    if (selectedRwFilter === 'Semua') return true;
    return item.rw === selectedRwFilter;
  });

  return (
    <div className="pt-24">
      {/* Banner */}
      <section className="relative h-64 sm:h-72 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/28907351/pexels-photo-28907351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Mamajang"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/80 to-stone-900/90" />
        </div>
        <div className="relative text-center px-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Pemerintah Kota Makassar &bull; Kecamatan Mamajang
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Profil Kelurahan Mamajang Luar</h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2">
            Pusat pelayanan administrasi kependudukan dan pemberdayaan masyarakat di Jl. Onta Lama No. 1, Kota Makassar.
          </p>
          <nav className="mt-3 text-xs sm:text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2 text-stone-500">/</span>
            <span className="text-gold-300 font-medium">Profil Kelurahan</span>
          </nav>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  active === t.id
                    ? 'bg-makassar-800 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* TAB 1: SEJARAH & GAMBARAN UMUM */}
        {active === 'sejarah' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Sejarah & Gambaran Umum</h2>
                  <p className="text-xs sm:text-sm text-stone-500">Mengenal Kelurahan Mamajang Luar, Kota Makassar</p>
                </div>
              </div>

              <div className="prose prose-stone max-w-none space-y-4 text-stone-600 text-sm leading-relaxed">
                <p>
                  <strong>Kelurahan Mamajang Luar</strong> merupakan salah satu wilayah administratif kelurahan di lingkungan Kecamatan Mamajang, Kota Makassar, Provinsi Sulawesi Selatan. Secara historis, kawasan Mamajang merupakan permukiman bersejarah di pusat Kota Makassar yang memiliki dinamika sosial kemasyarakatan yang kuat serta kearifan lokal bernafaskan gotong royong (*Sipakalebbi*, *Sipakatau*, dan *Sipakalingai*).
                </p>
                <p>
                  Pusat operasional dan pelayanan kelurahan bertempat di <strong>Jl. Onta Lama No. 1, Kota Makassar (Kode Pos 90132)</strong>. Gedung kantor kelurahan berdiri di atas tanah seluas 222,49 m² dengan luas bangunan 165,60 m² berstatus aset milik Pemerintah Kota Makassar yang telah bersertifikat resmi dan telah direnovasi pada tahun 2022 guna menghadirkan ruang pelayanan yang representatif bagi warga.
                </p>
                <p>
                  Secara kependudukan resmi, Kelurahan Mamajang Luar terbagi atas <strong>3 Rukun Warga (RW)</strong> dan <strong>16 Rukun Tetangga (RT)</strong> dengan jumlah penduduk sebanyak <strong>3.025 jiwa</strong> (terdiri dari 1.460 laki-laki dan 1.565 perempuan) yang terhimpun dalam <strong>878 Kepala Keluarga (KK)</strong> serta 534 Kepala Rumah Tangga (KRT).
                </p>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Jumlah Penduduk', value: '3.025 Jiwa', sub: '1.460 L / 1.565 P' },
                { icon: Home, label: 'Kepala Keluarga (KK)', value: '878 KK', sub: '534 Rumah Tangga' },
                { icon: Layers, label: 'Wilayah Rukun Warga', value: '3 RW / 16 RT', sub: 'Tersebar Teratur' },
                { icon: Building2, label: 'Luas Kantor', value: '165,60 m²', sub: 'Tanah 222,49 m²' },
              ].map((d) => (
                <div key={d.label} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm text-center">
                  <div className="w-10 h-10 rounded-xl bg-makassar-50 text-makassar-800 flex items-center justify-center mx-auto mb-2">
                    <d.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-stone-500">{d.label}</p>
                  <p className="text-lg font-bold text-stone-800 mt-0.5">{d.value}</p>
                  <p className="text-[11px] text-makassar-700 font-medium mt-0.5">{d.sub}</p>
                </div>
              ))}
            </div>

            {/* Kartu Profil Kantor Resmi */}
            <div className="bg-gradient-to-br from-stone-900 to-makassar-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Profil Fisik Kantor Kelurahan</h3>
                  <p className="text-xs text-stone-300">Data inventaris fisik & aset resmi Pemkot Makassar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Alamat Lengkap</span>
                  <span className="font-semibold text-stone-100 mt-1 block">{KELURAHAN_CONFIG.alamatKantor}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Titik Koordinat GPS</span>
                  <span className="font-mono font-semibold text-gold-300 mt-1 block">
                    {KELURAHAN_CONFIG.koordinat.lat}, {KELURAHAN_CONFIG.koordinat.lng}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Status Bangunan & Tanah</span>
                  <span className="font-semibold text-emerald-300 mt-1 block">
                    {KELURAHAN_CONFIG.profilFisik.statusBangunan}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Luas Bangunan / Tanah</span>
                  <span className="font-semibold text-stone-100 mt-1 block">
                    {KELURAHAN_CONFIG.profilFisik.luasBangunan} / {KELURAHAN_CONFIG.profilFisik.luasTanah}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Tahun Terakhir Renovasi</span>
                  <span className="font-semibold text-stone-100 mt-1 block">Tahun {KELURAHAN_CONFIG.profilFisik.tahunRenovasi}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-stone-400 block text-[11px]">Sarana Pengangkut Sampah</span>
                  <span className="font-semibold text-stone-100 mt-1 block">{KELURAHAN_CONFIG.demografi.armadaSampah}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISI & MISI */}
        {active === 'visimisi' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-makassar-800 to-makassar-950 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Visi</h2>
              </div>
              <p className="text-makassar-50 text-base sm:text-lg leading-relaxed">{visi}</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Misi Kelurahan</h2>
                  <p className="text-xs text-stone-500">5 Komitmen utama pelayanan Pemerintah Kelurahan Mamajang Luar</p>
                </div>
              </div>
              <ul className="space-y-4">
                {misi.map((m, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-makassar-100 text-makassar-800 font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-stone-600 text-sm leading-relaxed">{m}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Award, label: 'Mandiri & Maju', desc: 'Mendorong pemberdayaan ekonomi dan kemandirian warga lorong.' },
                { icon: CheckCircle2, label: 'Transparan & Cepat', desc: 'Pelayanan administrasi terbuka tanpa biaya (100% Bebas Pungli).' },
                { icon: HeartHandshake, label: 'Berakhlak & Humanis', desc: 'Melayani dengan prinsip sentuh hati dan kepedulian sosial yang tulus.' },
              ].map((v) => (
                <div key={v.label} className="p-6 rounded-2xl bg-white border border-stone-200 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center mx-auto mb-3 text-makassar-800">
                    <v.icon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-stone-800 text-sm">{v.label}</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STRUKTUR ORGANISASI & APARATUR RESMI DENGAN GARIS-GARIS HIERARKI */}
        {active === 'struktur' && (
          <StrukturOrganisasiChart onNavigateToRtRw={() => setActive('rtrw')} />
        )}

        {/* TAB 4: DIREKTORI LENGKAP RW & RT (16 RT) */}
        {active === 'rtrw' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-makassar-50 flex items-center justify-center mx-auto mb-3 text-makassar-800">
                <Home className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Direktori Pengurus RW & RT Kelurahan</h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
                Daftar resmi Ketua Rukun Warga (3 RW) dan Rukun Tetangga (16 RT) di Mamajang Luar. Hubungi RT/RW setempat untuk permohonan Surat Pengantar.
              </p>
            </div>

            {/* Kartu 3 RW Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {KELURAHAN_CONFIG.daftarRW.map((rw) => (
                <div
                  key={rw.rw}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-makassar-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-makassar-800 text-white font-bold text-xs">
                        {rw.rw}
                      </span>
                      <span className="text-xs text-stone-500 font-semibold">{rw.jumlahRT} RT &bull; {rw.jumlahKK} KK</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">{rw.ketua}</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      <strong>Cakupan Wilayah:</strong> {rw.wilayah}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Jumlah Jiwa: <strong>{rw.jumlahJiwa} Jiwa</strong>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-stone-700">{rw.kontak}</span>
                    <a
                      href={`https://wa.me/${rw.kontak.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Chat WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabel Lengkap 16 RT */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">Daftar Lengkap 16 Rukun Tetangga (RT)</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Filter berdasarkan lingkungan RW untuk memudahkan pencarian kontak</p>
                </div>

                {/* Filter RW */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl self-start sm:self-auto">
                  {['Semua', 'RW 01', 'RW 02', 'RW 03'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedRwFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRwFilter === f
                          ? 'bg-makassar-800 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Wilayah</th>
                      <th className="py-3 px-3">Nama Ketua RT</th>
                      <th className="py-3 px-3">Alamat Domisili</th>
                      <th className="py-3 px-3 text-center">Jumlah KK</th>
                      <th className="py-3 px-3 text-right">Kontak RT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredRT.map((rt) => {
                      const cleanPhone = rt.kontak.replace(/[^0-9]/g, '');
                      const waUrl = cleanPhone.startsWith('0')
                        ? `https://wa.me/62${cleanPhone.slice(1)}`
                        : `https://wa.me/${cleanPhone}`;

                      return (
                        <tr key={`${rt.rw}-${rt.rt}`} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-makassar-800 bg-makassar-50 px-2.5 py-1 rounded-md">
                              {rt.rw} - {rt.rt}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-stone-900 whitespace-nowrap">{rt.ketua}</td>
                          <td className="py-3.5 px-3 text-stone-600">{rt.alamat}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-stone-800 whitespace-nowrap">
                            {rt.jumlahKK} KK
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-600 text-stone-700 hover:text-white font-bold transition-all"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{rt.kontak}</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROTOKOL KERJA RT/RW */}
        {active === 'protokol' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-makassar-50 flex items-center justify-center mx-auto mb-3 text-makassar-800">
                <Calendar className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Protokol Kerja Mingguan RT & RW</h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                Panduan agenda operasional rutin Ketua RT dan RW se-Kelurahan Mamajang Luar yang ditetapkan oleh Lurah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {KELURAHAN_CONFIG.protokolKerjaRTRW.map((p, idx) => (
                <div
                  key={p.hari}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-makassar-800 text-white font-bold text-xs">
                      {p.hari}
                    </span>
                    <span className="text-[11px] font-bold text-gold-600 uppercase tracking-wider">
                      Agenda #{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-2">{p.program}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{p.deskripsi}</p>
                </div>
              ))}
            </div>

            {/* Banner Keputusan Lurah */}
            <div className="p-6 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-makassar-800 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-sm">Ketentuan Resmi Pelayanan Warga</p>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Ditetapkan di Makassar oleh Lurah Mamajang Luar: <strong>Muhammad Ansar AR, SE</strong> (NIP. 19761029 200801 1 005)
                  </p>
                </div>
              </div>
              <Link
                to="/layanan"
                className="px-4 py-2 rounded-xl bg-makassar-800 text-white font-bold text-xs hover:bg-makassar-700 transition-colors shrink-0"
              >
                Lihat Prosedur Surat
              </Link>
            </div>
          </div>
        )}

        {/* TAB 6: PETA & FASILITAS WILAYAH */}
        {active === 'peta' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Peta Wilayah & Batas Administratif</h2>
                <p className="text-xs sm:text-sm text-stone-500">Batas wilayah nyata dan fasilitas sosial di Mamajang Luar</p>
              </div>
            </div>

            {/* Peta OpenStreetMap presisi */}
            <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-md">
              <iframe
                title="Peta Kantor Kelurahan Mamajang Luar"
                src="https://www.openstreetmap.org/export/embed.html?bbox=119.410%2C-5.160%2C119.424%2C-5.150&layer=mapnik&marker=-5.155398%2C119.416862"
                className="w-full h-[400px]"
                loading="lazy"
              />
            </div>

            {/* 4 Batas Wilayah & Sarana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-5 h-5 text-makassar-800" /> Batas Wilayah Geografis
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                  <li className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-800">Sebelah Utara:</span>
                    <span className="text-makassar-800 font-medium">{KELURAHAN_CONFIG.batasWilayah.utara}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-800">Sebelah Timur:</span>
                    <span className="text-makassar-800 font-medium">{KELURAHAN_CONFIG.batasWilayah.timur}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-800">Sebelah Selatan:</span>
                    <span className="text-makassar-800 font-medium">{KELURAHAN_CONFIG.batasWilayah.selatan}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="font-semibold text-stone-800">Sebelah Barat:</span>
                    <span className="text-makassar-800 font-medium">{KELURAHAN_CONFIG.batasWilayah.barat}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Building2 className="w-5 h-5 text-makassar-800" /> Sarana Rumah Ibadah (Masjid)
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                  {KELURAHAN_CONFIG.saranaIbadah.map((m) => (
                    <li key={m.nama} className="py-1 border-b border-stone-100 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-900">{m.nama}</span>
                        <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          ~{m.kapasitasJemaah} Jemaah
                        </span>
                      </div>
                      <span className="text-stone-400 text-xs block mt-0.5">{m.alamat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
