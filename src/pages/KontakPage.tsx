import { useState, FormEvent } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { KELURAHAN_CONFIG } from '@/lib/config';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  User,
  Shield,
  HeartPulse,
  Flame,
  PhoneCall,
  ExternalLink,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

export default function KontakPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('complaints').insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      subject: form.subject,
      message: form.message,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Terjadi kendala saat mengirim via sistem web. Anda juga dapat menggunakan tombol Google Form pengaduan alternatif di atas.');
      return;
    }

    setSuccess(true);
    setForm(initialForm);
    setTimeout(() => setSuccess(false), 6000);
  };

  return (
    <div className="pt-24">
      {/* Banner */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4904994/pexels-photo-4904994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Kontak & Pengaduan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-makassar-950/80 to-stone-900/90" />
        </div>
        <div className="relative text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Kontak & Aspirasi Warga</h1>
          <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Kanal komunikasi resmi, nomor darurat satgas wilayah, dan sarana penyampaian aspirasi masyarakat.
          </p>
          <nav className="mt-3 text-xs sm:text-sm text-stone-300">
            <Link to="/" className="hover:text-gold-300">Beranda</Link>
            <span className="mx-2 text-stone-500">/</span>
            <span className="text-gold-300">Kontak & Aspirasi</span>
          </nav>
        </div>
      </section>

      {/* Banner Alternatif Google Form & Survei Kepuasan (IKM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Pengaduan GForm dengan Upload Bukti */}
          <div className="bg-gradient-to-r from-makassar-900 to-stone-900 rounded-2xl p-5 text-white shadow-xl border border-gold-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0 text-gold-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-300">Google Form Aspirasi</span>
                <h3 className="text-base font-bold">Lapor Masalah & Unggah Bukti Foto</h3>
                <p className="text-xs text-stone-300 mt-0.5">Sampah menumpuk, jalan rusak, atau lampu mati? Laporkan dengan foto.</p>
              </div>
            </div>
            <a
              href={KELURAHAN_CONFIG.googleForms.pengaduanWarga}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs shadow transition-all flex items-center gap-1.5"
              title="Buka Form Pengaduan"
            >
              <span>Isi Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Survei Kepuasan Masyarakat (IKM) */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-5 text-white shadow-xl border border-emerald-600/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Survei Standar KemenPAN-RB</span>
                <h3 className="text-base font-bold">Indeks Kepuasan Masyarakat (IKM)</h3>
                <p className="text-xs text-emerald-100/80 mt-0.5">Beri penilaian 1 menit terhadap kualitas pelayanan petugas kelurahan.</p>
              </div>
            </div>
            <a
              href={KELURAHAN_CONFIG.googleForms.surveiKepuasanIkm}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow transition-all flex items-center gap-1.5"
              title="Isi Survei IKM"
            >
              <span>Isi Survei</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Info + Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info Kantor & Jam Pelayanan */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-makassar-800 to-makassar-950 text-white shadow-md">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                <MapPin className="w-6 h-6 text-gold-300" />
              </div>
              <h3 className="font-bold text-lg">Alamat Kantor Kelurahan</h3>
              <p className="text-stone-200 text-sm mt-2 leading-relaxed">
                {KELURAHAN_CONFIG.alamatKantor}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <Phone className="w-6 h-6 text-makassar-800 mb-2" />
                <h4 className="font-bold text-stone-800 text-sm">WhatsApp Pelayanan</h4>
                <p className="text-xs text-stone-500 mt-1 font-mono font-semibold text-emerald-700">
                  {KELURAHAN_CONFIG.whatsappPelayanan.nomorTampilan}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <Mail className="w-6 h-6 text-makassar-800 mb-2" />
                <h4 className="font-bold text-stone-800 text-sm">Surel Resmi</h4>
                <p className="text-[11px] text-stone-500 mt-1 break-all">kelurahan.mamajangluar@makassarkota.go.id</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-makassar-800" />
                <h4 className="font-bold text-stone-800 text-sm">Jam Operasional Pelayanan</h4>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600">Senin - Kamis</span>
                  <span className="text-stone-800 font-semibold">07:30 - 16:00 WITA</span>
                </li>
                <li className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-600">Jumat</span>
                  <span className="text-stone-800 font-semibold">07:30 - 11:00 WITA</span>
                </li>
                <li className="flex justify-between py-1">
                  <span className="text-stone-600">Sabtu, Minggu & Hari Libur</span>
                  <span className="text-red-500 font-bold">Tutup</span>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              <iframe
                title="Lokasi Kantor Kelurahan Mamajang Luar"
                src="https://www.openstreetmap.org/export/embed.html?bbox=119.410%2C-5.160%2C119.424%2C-5.150&layer=mapnik&marker=-5.155398%2C119.416862"
                className="w-full h-52"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form Pengaduan Web */}
          <div className="lg:col-span-3">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Kirim Pesan & Pengaduan Langsung</h2>
                  <p className="text-xs sm:text-sm text-stone-500">Pesan Anda akan dicatat dalam rekapitulasi pengaduan kelurahan</p>
                </div>
              </div>

              {success && (
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 animate-slide-down">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Pengaduan Anda berhasil terkirim!</p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Terima kasih atas kepedulian Anda. Staf Kelurahan Mamajang Luar akan meninjau dan menindaklanjuti pesan Anda.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-xs">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                        placeholder="Nama lengkap pemohon"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">No. WhatsApp / HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                        placeholder="0812-xxxx-xxxx"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Email (Opsional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Topik / Subjek Pengaduan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                    placeholder="Contoh: Lampu lorong padam / Saluran air tersumbat di RT 02"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Isi Laporan / Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-400 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm resize-none"
                    placeholder="Jelaskan rincian lokasi, kendala yang dihadapi, atau saran perbaikan..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-makassar-800 text-white font-bold text-xs sm:text-sm hover:bg-makassar-700 disabled:opacity-60 transition-all shadow-md"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sedang Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Kirim Pengaduan Sekarang
                    </>
                  )}
                </button>

                <p className="text-[11px] text-stone-400 text-center">
                  Identitas pelapor dilindungi dan tidak akan dipublikasikan ke publik tanpa persetujuan.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Buku Kontak Darurat & Satgas Wilayah */}
      <section className="bg-stone-100 py-14 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-makassar-800 bg-makassar-50 px-3 py-1 rounded-full border border-makassar-200/50 mb-2">
              <PhoneCall className="w-3.5 h-3.5" /> Tanggap Darurat & Keamanan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">Nomor Darurat & Satgas Wilayah Mamajang Luar</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xl mx-auto">
              Simpan kontak penting ini saat membutuhkan pertolongan medis, kebakaran, atau gangguan ketertiban masyarakat di lingkungan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KELURAHAN_CONFIG.kontakDarurat.map((k) => {
              const isCallCenter = k.nomor === '112' || k.nomor === '113';
              const telUrl = `tel:${k.nomor}`;

              return (
                <div
                  key={k.instansi}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        k.kategori === 'darurat'
                          ? 'bg-red-50 text-red-600'
                          : k.kategori === 'keamanan'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {k.kategori === 'darurat' ? (
                          <Flame className="w-5 h-5" />
                        ) : k.kategori === 'keamanan' ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <HeartPulse className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 uppercase">
                        {k.kategori}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-800 text-base">{k.instansi}</h3>
                    {k.petugas && (
                      <p className="text-xs font-semibold text-makassar-800 mt-0.5">
                        Petugas: {k.petugas}
                      </p>
                    )}
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{k.deskripsi}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-800">{k.nomorTampilan}</span>
                    <a
                      href={telUrl}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isCallCenter
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-stone-100 hover:bg-makassar-800 hover:text-white text-stone-700'
                      }`}
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{isCallCenter ? 'Panggil Cepat' : 'Hubungi'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
