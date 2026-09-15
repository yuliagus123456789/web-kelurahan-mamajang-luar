import { ComplaintItem, SawComplaintItem, SawScoreDetails } from './types';

// ===== 1. DEFINISI KRITERIA & BOBOT SAW =====
export const SAW_CONFIG = {
  weights: {
    category: 0.40, // C1: Kategori Masalah (40%)
    impact: 0.30,   // C2: Cakupan Dampak (30%)
    urgency: 0.30,  // C3: Tingkat Kedaruratan Teks (30%)
  },
  thresholds: {
    high: 0.75,     // >= 0.75: Prioritas Tinggi (Merah)
    medium: 0.50,   // 0.50 - 0.74: Prioritas Sedang (Kuning)
    // < 0.50: Prioritas Rendah (Hijau)
  },
};

// Pilihan Kategori Masalah (C1)
export const CATEGORY_OPTIONS = [
  { id: 'Keamanan & Ketertiban', label: 'Keamanan & Ketertiban (Kriminalitas, Keselamatan Jiwa)', score: 5 },
  { id: 'Kesehatan Lingkungan', label: 'Kesehatan Lingkungan (Wabah Penyakit, Pencemaran, Jentik Nyamuk)', score: 5 },
  { id: 'Infrastruktur Vital', label: 'Infrastruktur Vital (Jalan Rusak/Amblas, Lampu PJU Padam, Kabel Putus)', score: 4 },
  { id: 'Kebersihan & Drainase', label: 'Kebersihan & Drainase (Got Tersumbat, Sampah Menumpuk, Banjir)', score: 3 },
  { id: 'Sosial Kemasyarakatan', label: 'Sosial Kemasyarakatan (Sengketa Bertetangga, Mediasi Warga)', score: 2 },
  { id: 'Saran & Usulan Umum', label: 'Saran & Usulan Umum (Taman Baca, Kegiatan Pemuda, Fasilitas)', score: 1 },
  { id: 'Masalah Lainnya', label: 'Masalah Lainnya / Aspirasi Umum (Pelayanan, Sengketa, dll)', score: 2 },
];

// Pilihan Cakupan Dampak Masalah (C2)
export const IMPACT_OPTIONS = [
  { id: 'Seluruh Wilayah Kelurahan', label: 'Seluruh Wilayah Kelurahan (Lintas RW)', score: 4 },
  { id: 'Satu Rukun Warga (RW)', label: 'Satu Rukun Warga (1 RW / Banyak RT)', score: 3 },
  { id: 'Beberapa Warga (1 RT)', label: 'Beberapa Warga (Satu Lorong / 1 RT)', score: 2 },
  { id: 'Hanya Saya Pribadi', label: 'Hanya Saya Pribadi (Lingkup Rumah)', score: 1 },
];

// Kamus Kata Kunci Kedaruratan Teks (C3)
export const URGENCY_KEYWORDS = {
  kritis: {
    score: 4,
    label: 'Kritis / Darurat',
    words: ['banjir', 'kebakaran', 'roboh', 'runtuh', 'meninggal', 'darurat', 'tersengat', 'terbakar', 'amblas', 'longsor', 'tenggelam', 'maling', 'pencuri'],
  },
  mendesak: {
    score: 3,
    label: 'Mendesak / Berbahaya',
    words: ['rusak', 'bocor', 'mati', 'padam', 'tersumbat', 'bahaya', 'patah', 'putus', 'lubang', 'meluap', 'hancur', 'tertutup', 'tergenang'],
  },
  perhatian: {
    score: 2,
    label: 'Perlu Perhatian',
    words: ['kotor', 'bau', 'gelap', 'menumpuk', 'sampah', 'berisik', 'debu', 'lalat', 'nyamuk', 'bangkai', 'kumuh', 'limbah'],
  },
};

// ===== 2. FUNGSI EKSTRAKSI SKOR =====

/**
 * Deteksi kata kunci kedaruratan dari teks pesan
 */
export function evaluateTextUrgency(text: string): { score: number; matchedKeywords: string[]; levelLabel: string } {
  if (!text) return { score: 1, matchedKeywords: [], levelLabel: 'Normal / Informatif' };

  const lower = text.toLowerCase();
  const matched: string[] = [];

  // 1. Cek Kritis (Skor 4)
  for (const word of URGENCY_KEYWORDS.kritis.words) {
    if (lower.includes(word)) matched.push(word);
  }
  if (matched.length > 0) {
    return { score: 4, matchedKeywords: Array.from(new Set(matched)), levelLabel: URGENCY_KEYWORDS.kritis.label };
  }

  // 2. Cek Mendesak (Skor 3)
  for (const word of URGENCY_KEYWORDS.mendesak.words) {
    if (lower.includes(word)) matched.push(word);
  }
  if (matched.length > 0) {
    return { score: 3, matchedKeywords: Array.from(new Set(matched)), levelLabel: URGENCY_KEYWORDS.mendesak.label };
  }

  // 3. Cek Perhatian (Skor 2)
  for (const word of URGENCY_KEYWORDS.perhatian.words) {
    if (lower.includes(word)) matched.push(word);
  }
  if (matched.length > 0) {
    return { score: 2, matchedKeywords: Array.from(new Set(matched)), levelLabel: URGENCY_KEYWORDS.perhatian.label };
  }

  // 4. Default Normal (Skor 1)
  return { score: 1, matchedKeywords: [], levelLabel: 'Normal / Informatif' };
}

/**
 * Konversi string kategori ke skor mentah C1
 */
export function getCategoryScore(category?: string | null): number {
  if (!category) return 3; // Default moderat jika tidak diisi
  const found = CATEGORY_OPTIONS.find((c) => c.id === category || (category && category.includes(c.id)));
  return found ? found.score : 3;
}

/**
 * Konversi string cakupan dampak ke skor mentah C2
 */
export function getImpactScore(impact?: string | null): number {
  if (!impact) return 2; // Default 1 RT jika tidak diisi
  const found = IMPACT_OPTIONS.find((i) => i.id === impact || (impact && impact.includes(i.id)));
  return found ? found.score : 2;
}

/**
 * Ekstraksi kategori dan dampak jika tersimpan dalam format teks lama
 */
export function extractComplaintMetadata(complaint: ComplaintItem): { category: string; impact_scope: string } {
  let category = complaint.category;
  let impact_scope = complaint.impact_scope;

  if (!category) {
    const matchCat = complaint.message.match(/\[Kategori:\s*([^|\]]+)\]/i);
    if (matchCat) category = matchCat[1].trim();
    else {
      // Coba tebak dari subject dan message
      const sub = (complaint.subject + ' ' + complaint.message).toLowerCase();
      if (sub.includes('jalan') || sub.includes('lampu') || sub.includes('pju') || sub.includes('listrik') || sub.includes('kabel')) {
        category = 'Infrastruktur Vital';
      } else if (sub.includes('got') || sub.includes('sampah') || sub.includes('drainase') || sub.includes('parit')) {
        category = 'Kebersihan & Drainase';
      } else if (sub.includes('nyamuk') || sub.includes('dbd') || sub.includes('limbah') || sub.includes('kesehatan') || sub.includes('wabah')) {
        category = 'Kesehatan Lingkungan';
      } else if (sub.includes('kriminal') || sub.includes('maling') || sub.includes('ribut') || sub.includes('aman') || sub.includes('polisi')) {
        category = 'Keamanan & Ketertiban';
      } else if (sub.includes('usul') || sub.includes('saran') || sub.includes('taman') || sub.includes('posyandu')) {
        category = 'Saran & Usulan Umum';
      } else {
        category = 'Kebersihan & Drainase';
      }
    }
  }

  if (!impact_scope) {
    const matchImp = complaint.message.match(/\[Dampak:\s*([^|\]]+)\]/i);
    if (matchImp) impact_scope = matchImp[1].trim();
    else impact_scope = 'Beberapa Warga (1 RT)';
  }

  return { category, impact_scope };
}

// ===== 3. INTI KALKULASI METODE SAW =====

/**
 * Menghitung skor SAW lengkap dari seluruh pengaduan yang ada.
 * Mengembalikan array terurut dari skor preferensi tertinggi ke terendah.
 */
export function calculateSawPriorities(complaints: ComplaintItem[]): SawComplaintItem[] {
  if (!complaints || complaints.length === 0) return [];

  // 1. Ekstraksi nilai mentah matriks keputusan X
  const rawData = complaints.map((item) => {
    const meta = extractComplaintMetadata(item);
    const rawCategory = getCategoryScore(meta.category);
    const rawImpact = getImpactScore(meta.impact_scope);
    const textEval = evaluateTextUrgency(`${item.subject} ${item.message}`);

    return {
      item: {
        ...item,
        category: meta.category,
        impact_scope: meta.impact_scope,
      },
      rawCategory,
      rawImpact,
      rawUrgency: textEval.score,
      matchedKeywords: textEval.matchedKeywords,
    };
  });

  // 2. Tentukan nilai maksimum untuk setiap kriteria (karena seluruhnya kriteria benefit)
  const maxCategory = Math.max(...rawData.map((d) => d.rawCategory), 1);
  const maxImpact = Math.max(...rawData.map((d) => d.rawImpact), 1);
  const maxUrgency = Math.max(...rawData.map((d) => d.rawUrgency), 1);

  // 3. Normalisasi matriks R dan hitung nilai preferensi V
  const { weights, thresholds } = SAW_CONFIG;

  const scoredItems: SawComplaintItem[] = rawData.map((d) => {
    const normCategory = Number((d.rawCategory / maxCategory).toFixed(4));
    const normImpact = Number((d.rawImpact / maxImpact).toFixed(4));
    const normUrgency = Number((d.rawUrgency / maxUrgency).toFixed(4));

    // Rumus SAW: V = (W1 * R1) + (W2 * R2) + (W3 * R3)
    const finalScore = Number(
      (
        weights.category * normCategory +
        weights.impact * normImpact +
        weights.urgency * normUrgency
      ).toFixed(3)
    );

    let priorityLevel: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
    if (finalScore >= thresholds.high) {
      priorityLevel = 'Tinggi';
    } else if (finalScore >= thresholds.medium) {
      priorityLevel = 'Sedang';
    }

    const sawDetails: SawScoreDetails = {
      rawCategory: d.rawCategory,
      rawImpact: d.rawImpact,
      rawUrgency: d.rawUrgency,
      normCategory,
      normImpact,
      normUrgency,
      finalScore,
      priorityLevel,
      matchedKeywords: d.matchedKeywords,
      rank: 0, // diisi setelah sorting
    };

    return {
      ...d.item,
      saw: sawDetails,
    };
  });

  // 4. Urutkan berdasarkan skor preferensi akhir (V) descending
  scoredItems.sort((a, b) => b.saw.finalScore - a.saw.finalScore);

  // 5. Berikan nomor urut peringkat (rank 1..N)
  return scoredItems.map((item, index) => ({
    ...item,
    saw: {
      ...item.saw,
      rank: index + 1,
    },
  }));
}

// ===== 4. HELPER NOMOR TIKET & AGREGASI STATISTIK =====

/**
 * Generate nomor tiket aduan resmi, misal: MLR-26-8491
 */
export function generateTicketNumber(): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `MLR-${yearSuffix}-${randomDigits}`;
}

export interface SawComplaintStats {
  total: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  averageScore: number;
}

/**
 * Menghitung rekapitulasi statistik pengaduan untuk KPI dashboard
 */
export function calculateSawStatistics(complaints: SawComplaintItem[]): SawComplaintStats {
  if (!complaints || complaints.length === 0) {
    return {
      total: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      newCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      averageScore: 0,
    };
  }

  let highPriority = 0;
  let mediumPriority = 0;
  let lowPriority = 0;
  let newCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let scoreSum = 0;

  for (const item of complaints) {
    if (item.saw.priorityLevel === 'Tinggi') highPriority++;
    else if (item.saw.priorityLevel === 'Sedang') mediumPriority++;
    else lowPriority++;

    if (item.status === 'Baru') newCount++;
    else if (item.status === 'Diproses') inProgressCount++;
    else if (item.status === 'Selesai') completedCount++;

    scoreSum += item.saw.finalScore;
  }

  return {
    total: complaints.length,
    highPriority,
    mediumPriority,
    lowPriority,
    newCount,
    inProgressCount,
    completedCount,
    averageScore: Number((scoreSum / complaints.length).toFixed(3)),
  };
}

// ===== 5. DATA SIMULASI PENGADUAN AWAL RIIL MAMAJANG LUAR =====
export const INITIAL_SAMPLE_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'sample-saw-01',
    ticket_number: 'MLR-26-4819',
    name: 'H. Syamsuddin',
    phone: '081241198822',
    email: 'syamsuddin.mlr@gmail.com',
    category: 'Infrastruktur Vital',
    impact_scope: 'Satu Rukun Warga (RW)',
    subject: 'Lampu PJU Poros Jalan RW 03 Padam Total',
    message:
      'Lampu penerangan jalan umum (PJU) di pertigaan lorong utama RW 03 padam total sejak 5 hari lalu. Kondisi malam hari sangat gelap dan membahayakan pengendara motor serta pejalan kaki.',
    status: 'Baru',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(), // 4 jam lalu
    admin_response: null,
    responded_at: null,
  },
  {
    id: 'sample-saw-02',
    ticket_number: 'MLR-26-5192',
    name: 'Ibu Ratna Dewi',
    phone: '085299881123',
    email: 'ratnadewi_rt02@yahoo.com',
    category: 'Kebersihan & Drainase',
    impact_scope: 'Beberapa Warga (1 RT)',
    subject: 'Drainase Tersumbat Sampah dan Mulai Banjir Menggenang',
    message:
      'Saluran got di RT 02 RW 01 tersumbat sampah plastik dan lumpur tebal. Jika hujan sebentar saja, air kotor meluap dan terjadi banjir setinggi mata kaki masuk ke teras rumah warga.',
    status: 'Baru',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(), // 12 jam lalu
    image_url: 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    admin_response: null,
    responded_at: null,
  },
  {
    id: 'sample-saw-03',
    ticket_number: 'MLR-26-3021',
    name: 'Andi Mappatunru',
    phone: '081355442200',
    email: null,
    category: 'Kesehatan Lingkungan',
    impact_scope: 'Beberapa Warga (1 RT)',
    subject: 'Genangan Air Selokan Menjadi Sarang Jentik Nyamuk DBD',
    message:
      'Genangan air limbah cucian di lorong 4 RT 03 berbau menyengat dan banyak jentik nyamuk. Dua anak balita tetangga baru saja dirawat karena gejala demam berdarah. Mohon bantuan fogging atau pembersihan.',
    status: 'Diproses',
    created_at: new Date(Date.now() - 3600 * 1000 * 26).toISOString(), // 1 hari lalu
    admin_response:
      'Laporan telah diteruskan ke Puskesmas Mamajang dan Tim Fogging Dinas Kesehatan Kota Makassar. Jadwal penanganan ditargetkan besok pagi pukul 09.00 WITA.',
    responded_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'sample-saw-04',
    ticket_number: 'MLR-26-2108',
    name: 'Baharuddin Dg. Tutu',
    phone: '082199883344',
    email: null,
    category: 'Keamanan & Ketertiban',
    impact_scope: 'Beberapa Warga (1 RT)',
    subject: 'Remaja Kerap Berkumpul dan Berisik Hingga Larut Malam',
    message:
      'Sering ada sekelompok remaja bukan warga lorong berkumpul di pos ronda hingga jam 2 subuh sambil menyalakan knalpot brong dan musik bising yang mengganggu ketertiban istirahat warga.',
    status: 'Baru',
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 2 hari lalu
    admin_response: null,
    responded_at: null,
  },
  {
    id: 'sample-saw-05',
    ticket_number: 'MLR-26-1082',
    name: 'Nurul Hidayah (Kader PKK)',
    phone: '085340112233',
    email: 'nurul.kader@mamajangluar.id',
    category: 'Saran & Usulan Umum',
    impact_scope: 'Satu Rukun Warga (RW)',
    subject: 'Usulan Pengadaan Timbangan Digital Posyandu Kenanga & Taman Toga',
    message:
      'Kami mengusulkan pengadaan alat timbangan digital tambahan untuk penimbangan balita Posyandu Kenanga RW 02 serta bibit tanaman toga untuk program Hatinya PKK lorong.',
    status: 'Selesai',
    created_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(), // 3 hari lalu
    admin_response:
      'Usulan timbangan digital telah disetujui Lurah Mamajang Luar dan dialokasikan melalui sarana Posyandu Kenanga. Unit timbangan dapat diambil di ruang Kesos Kantor Kelurahan.',
    responded_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
];
