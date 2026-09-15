import { useState, useEffect, FormEvent } from 'react';
import { Link, useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { KELURAHAN_CONFIG } from '@/lib/config';
import { ComplaintItem, SawComplaintItem } from '@/lib/types';
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
  Search,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Activity,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Layers,
  Droplets,
  Lightbulb,
  ShieldAlert,
  Building2,
  Zap,
  Share2,
  Camera,
  Trash2,
  Maximize2,
  X,
} from 'lucide-react';

import {
  CATEGORY_OPTIONS,
  IMPACT_OPTIONS,
  generateTicketNumber,
  calculateSawPriorities,
  INITIAL_SAMPLE_COMPLAINTS,
  evaluateTextUrgency,
} from '@/lib/spkSaw';

const CATEGORY_CARDS = [
  {
    id: 'Kebersihan & Drainase',
    label: 'Drainase & Sampah',
    sub: 'Got buntu, genangan air, sampah liar',
    icon: Droplets,
    badgeColor: 'bg-cyan-100 text-cyan-800',
    selectedStyle: 'border-cyan-600 bg-cyan-50/90 ring-2 ring-cyan-500/30 text-cyan-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40 text-stone-800',
  },
  {
    id: 'Infrastruktur Vital',
    label: 'Lampu & Jalan',
    sub: 'Lampu jalan mati, jalan rusak/amblas',
    icon: Lightbulb,
    badgeColor: 'bg-amber-100 text-amber-800',
    selectedStyle: 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/30 text-amber-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/40 text-stone-800',
  },
  {
    id: 'Keamanan & Ketertiban',
    label: 'Kamtibmas & Gangguan',
    sub: 'Tawuran, bising larut malam, sengketa',
    icon: ShieldAlert,
    badgeColor: 'bg-rose-100 text-rose-800',
    selectedStyle: 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-500/30 text-rose-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/40 text-stone-800',
  },
  {
    id: 'Kesehatan Lingkungan',
    label: 'Kesehatan Lingkungan',
    sub: 'Jentik nyamuk/DBD, limbah berbau',
    icon: HeartPulse,
    badgeColor: 'bg-emerald-100 text-emerald-800',
    selectedStyle: 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/30 text-emerald-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 text-stone-800',
  },
  {
    id: 'Saran & Usulan Umum',
    label: 'Usulan Fasilitas Warga',
    sub: 'Taman, pos ronda, sarana posyandu',
    icon: Building2,
    badgeColor: 'bg-stone-100 text-stone-800',
    selectedStyle: 'border-stone-700 bg-stone-100 ring-2 ring-stone-400/30 text-stone-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-800',
  },
  {
    id: 'Masalah Lainnya',
    label: 'Lainnya / Masalah Lain',
    sub: 'Sengketa, pelayanan, bantuan, dll',
    icon: HelpCircle,
    badgeColor: 'bg-violet-100 text-violet-800',
    selectedStyle: 'border-violet-600 bg-violet-50/90 ring-2 ring-violet-500/30 text-violet-950',
    defaultStyle: 'border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 text-stone-800',
  },
];

const SCOPE_OPTIONS = [
  { id: 'Hanya Saya Pribadi', label: 'Rumah Pribadi', icon: '🏠' },
  { id: 'Beberapa Warga (1 RT)', label: '1 Lorong / RT', icon: '🏘️' },
  { id: 'Satu Rukun Warga (RW)', label: '1 Lingkungan RW', icon: '🏢' },
  { id: 'Seluruh Wilayah Kelurahan', label: 'Lintas RW / Kelurahan', icon: '🌐' },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  category: string;
  impact_scope: string;
  subject: string;
  message: string;
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  category: 'Kebersihan & Drainase',
  impact_scope: 'Beberapa Warga (1 RT)',
  subject: '',
  message: '',
};

export default function KontakPage() {
  const { path } = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');
  const [form, setForm] = useState<FormState>(initialForm);
  const [customCategory, setCustomCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional Photo Proof State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoFileSize, setPhotoFileSize] = useState<number>(0);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Modal Pembesar Foto Bukti
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar bisa memilih ulang file yang sama jika diinginkan
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setPhotoError('Format berkas harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Ukuran berkas terlalu besar. Maksimal 10MB.');
      return;
    }

    setPhotoError(null);
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

          // Kompresi ringan agar ramah jaringan dan database
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoPreview(compressed);
          setPhotoFileName(file.name);
          setPhotoFileSize(Math.round((compressed.length * 3) / 4));
        } catch {
          const original = event.target?.result as string;
          setPhotoPreview(original);
          setPhotoFileName(file.name);
          setPhotoFileSize(file.size);
        } finally {
          setIsCompressingPhoto(false);
        }
      };
      img.onerror = () => {
        setIsCompressingPhoto(false);
        setPhotoError('Gagal memuat pratinjau gambar.');
      };
    };
    reader.onerror = () => {
      setIsCompressingPhoto(false);
      setPhotoError('Gagal membaca berkas.');
    };
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFileName('');
    setPhotoFileSize(0);
    setPhotoError(null);
  };

  // Deteksi kategori dari URL (misal saat diklik dari Beranda: #/kontak?kategori=drainase)
  useEffect(() => {
    const raw = window.location.hash || path;
    if (raw.includes('kategori=drainase')) {
      setForm((prev) => ({ ...prev, category: 'Kebersihan & Drainase' }));
      setActiveTab('create');
    } else if (raw.includes('kategori=lampu')) {
      setForm((prev) => ({ ...prev, category: 'Infrastruktur Vital' }));
      setActiveTab('create');
    } else if (raw.includes('kategori=keamanan')) {
      setForm((prev) => ({ ...prev, category: 'Keamanan & Ketertiban' }));
      setActiveTab('create');
    } else if (raw.includes('kategori=kesehatan')) {
      setForm((prev) => ({ ...prev, category: 'Kesehatan Lingkungan' }));
      setActiveTab('create');
    } else if (raw.includes('kategori=usulan')) {
      setForm((prev) => ({ ...prev, category: 'Saran & Usulan Umum' }));
      setActiveTab('create');
    } else if (raw.includes('tab=track')) {
      setActiveTab('track');
    }
  }, [path]);

  // Success Ticket State
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tracking States
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState<SawComplaintItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSwitchToTrack = (ticket?: string) => {
    setActiveTab('track');
    if (ticket) {
      setTrackQuery(ticket);
      handleTrackSubmit(undefined, ticket);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const finalCategory =
      form.category === 'Masalah Lainnya' && customCategory.trim()
        ? `Lainnya (${customCategory.trim()})`
        : form.category;

    const ticketNumber = generateTicketNumber();
    const taggedMessage = `${form.message}\n\n[Tiket: ${ticketNumber} | Kategori: ${finalCategory} | Dampak: ${form.impact_scope}]`;

    const localItem: ComplaintItem = {
      id: `local-comp-${Date.now()}`,
      ticket_number: ticketNumber,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      category: finalCategory,
      impact_scope: form.impact_scope,
      subject: form.subject,
      message: form.message,
      image_url: photoPreview || null,
      status: 'Baru',
      created_at: new Date().toISOString(),
      admin_response: null,
      responded_at: null,
    };

    // 1. Coba simpan ke Supabase dengan kolom lengkap (termasuk foto bukti)
    const { error: insertError } = await supabase.from('complaints').insert({
      ticket_number: ticketNumber,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      category: finalCategory,
      impact_scope: form.impact_scope,
      subject: form.subject,
      message: form.message,
      image_url: photoPreview || null,
      status: 'Baru',
    });

    if (insertError) {
      // 2. Fallback jika kolom ticket_number/image_url belum dibuat di skema Supabase
      await supabase.from('complaints').insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        subject: form.subject,
        message: `${taggedMessage}${photoPreview ? ' [Ada Bukti Foto]' : ''}`,
        status: 'Baru',
      });
    }

    // 3. Simpan di cache lokal peramban agar instan bisa dilacak
    try {
      const existing: ComplaintItem[] = JSON.parse(
        localStorage.getItem('mamajang_local_complaints') || '[]'
      );
      localStorage.setItem('mamajang_local_complaints', JSON.stringify([localItem, ...existing]));
    } catch {
      // ignore storage error
    }

    setSubmitting(false);
    setSuccess(true);
    setCreatedTicket(ticketNumber);
    setForm(initialForm);
    handleRemovePhoto();
  };

  // Fungsi Pelacakan Status Pengaduan
  const handleTrackSubmit = async (e?: FormEvent, forcedQuery?: string) => {
    if (e) e.preventDefault();
    const query = (forcedQuery !== undefined ? forcedQuery : trackQuery).trim().toLowerCase();
    if (!query) return;

    setIsSearching(true);
    setTrackError(null);
    setHasSearched(true);

    try {
      // 1. Query Supabase
      const { data: dbData } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Cache lokal warga
      let localData: ComplaintItem[] = [];
      try {
        localData = JSON.parse(localStorage.getItem('mamajang_local_complaints') || '[]');
      } catch {
        // ignore
      }

      // 3. Gabungkan semua sumber data tanpa duplikasi ID
      const allPool: ComplaintItem[] = [
        ...(dbData || []),
        ...localData,
        ...INITIAL_SAMPLE_COMPLAINTS,
      ];
      const uniqueMap = new Map<string, ComplaintItem>();
      for (const item of allPool) {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      }
      const uniqueList = Array.from(uniqueMap.values());

      // 4. Filter berdasarkan nomor tiket atau nomor telepon atau nama
      const matched = uniqueList.filter((item) => {
        const ticketMatch = item.ticket_number && item.ticket_number.toLowerCase().includes(query);
        const phoneMatch = item.phone && item.phone.toLowerCase().includes(query);
        const nameMatch = item.name && item.name.toLowerCase().includes(query);
        const msgMatch = item.message && item.message.toLowerCase().includes(query);
        return ticketMatch || phoneMatch || nameMatch || msgMatch;
      });

      // 5. Hitung skor SPK SAW untuk hasil
      const scoredMatches = calculateSawPriorities(matched);
      setTrackResults(scoredMatches);
    } catch (err: unknown) {
      const errObj = err as Error;
      setTrackError(errObj.message || 'Gagal mencari data laporan.');
    } finally {
      setIsSearching(false);
    }
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

      {/* Main Container: Form Pengaduan Web (Kiri / Atas) & Info Kantor (Kanan / Bawah) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form Pengaduan Web & Pelacakan Tiket (Dinaikkan ke Posisi Paling Atas) */}
          <div className="lg:col-span-3">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-sm">
              {/* Tab Selector: Kirim Pengaduan vs Lacak Status */}
              <div className="flex items-center p-1.5 rounded-2xl bg-stone-100 border border-stone-200 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'create'
                      ? 'bg-white text-makassar-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Sampaikan Pengaduan Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'track'
                      ? 'bg-makassar-800 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Status Tiket Pengaduan</span>
                </button>
              </div>

              {/* ===== TAB 1: FORMULIR PENGADUAN BARU ===== */}
              {activeTab === 'create' && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-makassar-50 flex items-center justify-center text-makassar-800">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">Kirim Aspirasi & Pengaduan Warga</h2>
                      <p className="text-xs sm:text-sm text-stone-500">
                        Aduan Anda diprioritaskan secara objektif menggunakan SPK Simple Additive Weighting (SAW)
                      </p>
                    </div>
                  </div>

                  {/* Kartu Tiket Berhasil Dikirim */}
                  {success && createdTicket ? (
                    <div className="mt-5 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-300 text-emerald-950 animate-slide-down">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-emerald-900">
                            Pengaduan Anda Telah Berhasil Dicatat!
                          </h3>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Sistem secara otomatis mengalokasikan nomor tiket pengaduan resmi berikut:
                          </p>
                        </div>
                      </div>

                      {/* Kotak Nomor Tiket */}
                      <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                            Nomor Tiket Aduan Anda
                          </span>
                          <span className="text-2xl font-black font-mono tracking-wider text-stone-900">
                            {createdTicket}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(createdTicket)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Tersalin!' : 'Salin Tiket'}</span>
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                              `Halo Satgas Kelurahan Mamajang Luar, saya telah mengirimkan pengaduan warga melalui portal resmi.\n\n📌 Nomor Tiket: *${createdTicket}*\n👤 Pelapor: *${form.name || 'Warga'}*\n🏷️ Kategori: *${form.category}*\n📍 Lokasi: *${form.subject}*\n\nMohon dicek dan ditindaklanjuti. Terima kasih.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Kirim ke WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleSwitchToTrack(createdTicket)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <span>Lacak Status</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-800 mt-3 leading-relaxed">
                        💡 Simpan nomor tiket di atas. Anda dapat memantau proses verifikasi lapangan dan respon lurah kapan saja di tab <strong>Lacak Status Tiket</strong>.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSuccess(false);
                          setCreatedTicket(null);
                        }}
                        className="mt-4 text-xs font-bold text-emerald-900 underline hover:text-emerald-700 cursor-pointer"
                      >
                        + Kirim Laporan Pengaduan Lainnya
                      </button>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-amber-800 text-xs">{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* 1. Kategori Masalah (Pilihan Kartu 1-Klik) */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-800">
                            1. Pilih Masalah yang Dihadapi <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {CATEGORY_CARDS.map((cat) => {
                              const isSelected = form.category === cat.id;
                              const Icon = cat.icon;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setForm({ ...form, category: cat.id })}
                                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                    isSelected ? cat.selectedStyle : cat.defaultStyle
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.badgeColor}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    {isSelected && (
                                      <span className="w-2.5 h-2.5 rounded-full bg-makassar-700" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs leading-tight text-stone-900">{cat.label}</p>
                                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">{cat.sub}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Opsi Tambahan jika Memilih 'Masalah Lainnya' */}
                          {form.category === 'Masalah Lainnya' && (
                            <div className="mt-2.5 p-3.5 rounded-xl bg-violet-50/80 border border-violet-200 animate-slide-down">
                              <label className="block text-xs font-bold text-violet-950 mb-1">
                                Tuliskan Jenis / Topik Masalah Anda (Opsional):
                              </label>
                              <input
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Contoh: Sengketa Batas Rumah / Urusan Surat / Bantuan Sosial..."
                                className="w-full px-3.5 py-2 rounded-lg border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/30 text-xs bg-white text-stone-800"
                              />
                              <p className="text-[10px] text-violet-700 mt-1">
                                Petugas kelurahan akan menelaah dan mengarahkan laporan ini ke seksi/satgas terkait.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 2. Lingkup Cakupan Dampak */}
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-xs font-bold text-stone-800">
                            2. Seberapa Luas Dampak Masalah Ini? <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {SCOPE_OPTIONS.map((scope) => {
                              const isSelected = form.impact_scope === scope.id;
                              return (
                                <button
                                  key={scope.id}
                                  type="button"
                                  onClick={() => setForm({ ...form, impact_scope: scope.id })}
                                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-makassar-800 text-white border-makassar-800 shadow-xs'
                                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                                  }`}
                                >
                                  <span>{scope.icon}</span>
                                  <span>{scope.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Lokasi & Uraian Masalah */}
                        <div className="space-y-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-stone-800 mb-1">
                              3. Lokasi / Patokan Kejadian <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={form.subject}
                              onChange={(e) => setForm({ ...form, subject: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm bg-white"
                              placeholder="Contoh: Jl. Tupai Lorong 2 RT 01 RW 02 (Dekat Pos Ronda)"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-800 mb-1">
                              4. Ceritakan Masalahnya Secara Singkat <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              required
                              rows={3}
                              value={form.message}
                              onChange={(e) => setForm({ ...form, message: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm resize-none bg-white"
                              placeholder="Jelaskan apa yang terjadi, sejak kapan kendala ini muncul, atau bantuan yang diharapkan..."
                            />
                          </div>
                        </div>

                        {/* Indikator Urgensi Real-Time Ramah Warga */}
                        {(() => {
                          const urgencyEval = evaluateTextUrgency(form.message);
                          const isHigh =
                            form.category === 'Keamanan & Ketertiban' ||
                            form.category === 'Kesehatan Lingkungan' ||
                            form.impact_scope === 'Seluruh Wilayah Kelurahan' ||
                            form.impact_scope === 'Satu Rukun Warga (RW)' ||
                            urgencyEval.score >= 3;

                          return (
                            <div
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                                isHigh
                                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                                  : 'bg-stone-50 border-stone-200 text-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Zap
                                  className={`w-4 h-4 shrink-0 ${isHigh ? 'text-rose-600' : 'text-stone-500'}`}
                                />
                                <span className="leading-tight">
                                  Estimasi Urutan Penanganan:{' '}
                                  <strong>
                                    {isHigh
                                      ? 'Prioritas Cepat / Darurat'
                                      : 'Prioritas Terjadwal'}
                                  </strong>
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 shrink-0">
                                SPK SAW Otomatis
                              </span>
                            </div>
                          );
                        })()}

                        {/* 5. Unggah Foto Bukti Kejadian (Opsional) */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-stone-800">
                              5. Foto Bukti Kejadian <span className="text-stone-400 font-normal text-[11px]">(Opsional)</span>
                            </label>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-semibold border border-stone-200">
                              Bisa Diabaikan Jika Tidak Ada
                            </span>
                          </div>

                          {!photoPreview ? (
                            <div>
                              <label className="relative flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-stone-300 hover:border-makassar-400 bg-stone-50/70 hover:bg-makassar-50/20 rounded-2xl cursor-pointer transition-all group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handlePhotoChange}
                                />
                                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-makassar-800 group-hover:scale-105 transition-all shadow-2xs mb-2">
                                  <Camera className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-stone-700 group-hover:text-makassar-900 text-center">
                                  {isCompressingPhoto ? 'Sedang Memproses Foto...' : 'Lampirkan Foto Bukti Kejadian Lapangan'}
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5 text-center">
                                  Ambil foto langsung dari kamera HP atau pilih dari galeri (Maks. 10MB)
                                </p>
                              </label>
                              {photoError && (
                                <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{photoError}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalImage(photoPreview)}
                                  className="relative group shrink-0"
                                  title="Klik untuk melihat foto lebih besar"
                                >
                                  <img
                                    src={photoPreview}
                                    alt="Pratinjau Bukti"
                                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-white group-hover:opacity-90 transition-opacity"
                                  />
                                  <div className="absolute inset-0 rounded-xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </div>
                                </button>
                                <div className="min-w-0">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 mb-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Foto Bukti Terlampir
                                  </span>
                                  <p className="text-xs font-bold text-stone-800 truncate">
                                    {photoFileName || 'Foto Kejadian'}
                                  </p>
                                  <p className="text-[10px] text-stone-400 font-mono">
                                    {photoFileSize ? `${(photoFileSize / 1024).toFixed(0)} KB (Optimal)` : 'Optimal'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="shrink-0 p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Hapus Lampiran Foto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 6. Kontak Pelapor */}
                        <div className="pt-2 border-t border-stone-100 space-y-3">
                          <p className="text-xs font-bold text-stone-800">
                            6. Kontak Pelapor (Untuk Kabar Progres & Verifikasi)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                Nama Lengkap Pelapor <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                  type="text"
                                  required
                                  value={form.name}
                                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm bg-white"
                                  placeholder="Nama Anda"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                No. WhatsApp Aktif <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                  type="tel"
                                  required
                                  value={form.phone}
                                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm bg-white font-mono"
                                  placeholder="0812-xxxx-xxxx"
                                />
                              </div>
                              <p className="text-[10px] text-stone-400 mt-1">
                                Bukti tiket & notifikasi tindak lanjut dikirim ke nomor ini.
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-makassar-800 text-white font-bold text-xs sm:text-sm hover:bg-makassar-700 disabled:opacity-60 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sedang Menyimpan & Menghitung Prioritas...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-gold-300" />
                              <span>Kirim Pengaduan & Dapatkan Nomor Tiket</span>
                            </>
                          )}
                        </button>

                        <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                          🛡️ Identitas Anda dilindungi. Keluhan diproses objektif menggunakan SPK SAW tanpa biaya/pungli apa pun.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* ===== TAB 2: PELACAKAN STATUS PENGADUAN WARGA ===== */}
              {activeTab === 'track' && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-800">Lacak Status Pengaduan Warga</h2>
                      <p className="text-xs sm:text-sm text-stone-500">
                        Masukkan nomor tiket aduan atau nomor WhatsApp untuk memantau status tindak lanjut.
                      </p>
                    </div>
                  </div>

                  {/* Form Pencarian Tiket */}
                  <form onSubmit={(e) => handleTrackSubmit(e)} className="mt-5">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={trackQuery}
                          onChange={(e) => setTrackQuery(e.target.value)}
                          placeholder="Masukkan No. Tiket (contoh: MLR-26-3021) atau No. HP..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-makassar-500 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="px-6 py-3 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSearching ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        <span>Lacak Tiket</span>
                      </button>
                    </div>

                    {/* Tombol Contoh Cepat untuk Pengujian */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                      <span className="text-[11px] font-medium text-stone-400">Contoh Tiket Terverifikasi:</span>
                      {['MLR-26-3021', 'MLR-26-1082', 'MLR-26-4819', 'MLR-26-5192'].map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => {
                            setTrackQuery(sample);
                            handleTrackSubmit(undefined, sample);
                          }}
                          className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono font-semibold transition-colors"
                        >
                          #{sample}
                        </button>
                      ))}
                    </div>
                  </form>

                  {trackError && (
                    <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  {/* Hasil Pencarian */}
                  <div className="mt-6 space-y-4">
                    {hasSearched && trackResults.length === 0 && !isSearching && (
                      <div className="text-center py-10 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <h4 className="font-bold text-stone-700 text-sm">Laporan Tidak Ditemukan</h4>
                        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                          Tidak ditemukan laporan dengan kata kunci &ldquo;{trackQuery}&rdquo;. Pastikan nomor tiket atau nomor telepon sudah sesuai.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('create')}
                          className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                        >
                          Buat Laporan Baru Sekarang
                        </button>
                      </div>
                    )}

                    {trackResults.map((item) => {
                      const isSelesai = item.status === 'Selesai';
                      const isDiproses = item.status === 'Diproses' || isSelesai;
                      const isBaru = true;

                      const priorityBg =
                        item.saw.priorityLevel === 'Tinggi'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : item.saw.priorityLevel === 'Sedang'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                      return (
                        <div
                          key={item.id}
                          className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-stone-200 shadow-sm hover:border-makassar-300 transition-all space-y-5"
                        >
                          {/* Header Tiket & Prioritas */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-base text-stone-900">
                                  #{item.ticket_number || item.id}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${priorityBg}`}>
                                  Prioritas {item.saw.priorityLevel} (Skor: {item.saw.finalScore})
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                <span>
                                  Masuk: {new Date(item.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} WITA
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  item.status === 'Selesai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.status === 'Diproses'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                Status: {item.status}
                              </span>
                            </div>
                          </div>

                          {/* Stepper Progres Tindak Lanjut */}
                          <div className="py-2">
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                              Progres Penanganan Laporan:
                            </span>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              {/* Step 1 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                                    isBaru ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-stone-800 text-[11px]">1. Diterima</span>
                                <span className="text-[10px] text-stone-400">Tercatat di sistem</span>
                              </div>

                              {/* Step 2 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                                    isDiproses ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}
                                >
                                  {isDiproses ? <Activity className="w-4 h-4" /> : 2}
                                </div>
                                <span className="font-bold text-stone-800 text-[11px]">2. Sedang Diproses</span>
                                <span className="text-[10px] text-stone-400">Penanganan Satgas</span>
                              </div>

                              {/* Step 3 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                                    isSelesai ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'
                                  }`}
                                >
                                  {isSelesai ? <CheckCircle2 className="w-4 h-4" /> : 3}
                                </div>
                                <span className="font-bold text-stone-800 text-[11px]">3. Selesai</span>
                                <span className="text-[10px] text-stone-400">Rampung Ditindak</span>
                              </div>
                            </div>
                          </div>

                          {/* Rincian Aduan Pelapor */}
                          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                            <div>
                              <span className="text-stone-400 block text-[11px] font-medium">Perihal Aduan:</span>
                              <strong className="text-stone-900 text-sm">{item.subject}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[11px] font-medium">Isi Pesan:</span>
                              <p className="text-stone-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-stone-200/70">
                                &ldquo;{item.message}&rdquo;
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                              <span><strong>Kategori:</strong> {item.category || 'Kebersihan & Drainase'}</span>
                              <span>&bull;</span>
                              <span><strong>Cakupan:</strong> {item.impact_scope || '1 RT'}</span>
                            </div>

                            {/* Foto Bukti Kejadian jika Ada */}
                            {item.image_url && (
                              <div className="pt-2 border-t border-stone-200/80">
                                <span className="text-stone-500 font-medium block text-[11px] mb-1.5 flex items-center gap-1.5">
                                  <Camera className="w-3.5 h-3.5 text-makassar-800" />
                                  Lampiran Foto Bukti Lapangan:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalImage(item.image_url!)}
                                  className="group relative rounded-xl overflow-hidden border border-stone-200 block text-left max-w-sm"
                                  title="Klik untuk memperbesar foto bukti"
                                >
                                  <img
                                    src={item.image_url}
                                    alt="Foto Bukti Lapangan"
                                    className="max-h-48 w-full object-cover group-hover:scale-105 transition-all duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                    <Maximize2 className="w-4 h-4" />
                                    <span>Klik untuk Memperbesar Foto</span>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Tanggapan Resmi Staf Kelurahan */}
                          {item.admin_response ? (
                            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                  Tanggapan Resmi Pemerintah Kelurahan Mamajang Luar
                                </span>
                                {item.responded_at && (
                                  <span className="text-[10px] text-emerald-700 font-medium">
                                    {new Date(item.responded_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-900 leading-relaxed font-medium bg-white/80 p-3 rounded-lg border border-emerald-200/80">
                                {item.admin_response}
                              </p>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-[11px]">Sedang Dalam Antrean Penanganan</p>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                  Laporan Anda telah berhasil masuk dan saat ini sedang ditindaklanjuti oleh staf / Satgas Kelurahan Mamajang Luar sesuai peringkat prioritas SAW.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Kantor & Jam Pelayanan (Kolom Pendukung di Sebelah Kanan / Bawah pada Layar HP) */}
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
        </div>
      </div>

      {/* Banner Survei Kepuasan Masyarakat (IKM) KemenPAN-RB (Ditempatkan Rapi di Bagian Bawah) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Survei Standar KemenPAN-RB</span>
              <h3 className="text-base sm:text-lg font-bold">Indeks Kepuasan Masyarakat (IKM)</h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5 max-w-xl">
                Beri penilaian 1 menit terhadap kualitas pelayanan petugas kelurahan untuk peningkatan mutu layanan.
              </p>
            </div>
          </div>
          <a
            href={KELURAHAN_CONFIG.googleForms.surveiKepuasanIkm}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            title="Isi Survei IKM"
          >
            <span>Isi Survei</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

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
      {/* Modal Pratinjau Foto Bukti Ukuran Penuh */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs sm:text-sm">
                <Camera className="w-4 h-4 text-makassar-800" />
                <span>Foto Bukti Kejadian Lapangan</span>
              </div>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-stone-900/5 rounded-xl max-h-[75vh] overflow-hidden">
              <img
                src={previewModalImage}
                alt="Foto Bukti Lengkap"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
