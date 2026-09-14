import { MapPin, Phone, Clock, Mail, ShieldCheck } from 'lucide-react';
import { Link } from '@/lib/router';
import { KELURAHAN_CONFIG } from '@/lib/config';

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil Kelurahan', path: '/profil' },
  { label: 'Layanan Publik', path: '/layanan' },
  { label: 'Berita & Kegiatan', path: '/berita' },
  { label: 'Potensi & UMKM', path: '/umkm' },
  { label: 'Kontak & Pengaduan', path: '/kontak' },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="h-1 bg-gradient-to-r from-makassar-800 via-gold-500 to-makassar-800" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo-pemkot-makassar.png"
                alt="Logo Pemerintah Kota Makassar"
                className="w-10 h-12 object-contain drop-shadow shrink-0"
              />
              <div>
                <p className="font-bold text-white">Kelurahan Mamajang Luar</p>
                <p className="text-xs text-stone-400">Kota Makassar</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Website resmi Kelurahan Mamajang Luar, Kecamatan Mamajang, Kota Makassar,
              Sulawesi Selatan. Melayani warga dengan sepenuh hati dan berintegritas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group relative text-sm text-stone-400 hover:text-gold-400 transition-colors inline-block"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Kontak Resmi</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <span>{KELURAHAN_CONFIG.alamatKantor}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`https://wa.me/${KELURAHAN_CONFIG.whatsappPelayanan.nomor}`}
                  className="hover:text-gold-400 transition-colors"
                >
                  WhatsApp: {KELURAHAN_CONFIG.whatsappPelayanan.nomorTampilan}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href="mailto:kelurahan.mamajangluar@makassarkota.go.id"
                  className="hover:text-gold-400 transition-colors"
                >
                  kelurahan.mamajangluar@makassarkota.go.id
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Jam Pelayanan Loket</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Senin - Kamis</p>
                  <p className="text-stone-500">07:30 - 16:00 WITA</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Jumat</p>
                  <p className="text-stone-500">07:30 - 11:00 WITA</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Sabtu & Minggu</p>
                  <p className="text-red-400">Tutup</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Pemerintah Kelurahan Mamajang Luar, Kota Makassar.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-xs text-stone-400 hover:text-gold-400 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Portal Staf / Hub Admin</span>
            </Link>
            <span className="text-stone-700">&middot;</span>
            <p className="text-xs text-stone-500">Sistem Informasi & Pelayanan Warga</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
