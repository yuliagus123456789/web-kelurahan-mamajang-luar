// Konfigurasi Terpadu Website Kelurahan Mamajang Luar
// Data resmi berdasarkan arsip administrasi Pemerintah Kelurahan Mamajang Luar, Kecamatan Mamajang, Kota Makassar

export interface KelurahanConfig {
  namaKelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  alamatKantor: string;
  koordinat: {
    lat: number;
    lng: number;
  };

  // Profil Fisik Kantor Kelurahan
  profilFisik: {
    luasBangunan: string;
    luasTanah: string;
    statusBangunan: string;
    statusTanah: string;
    tahunRenovasi: string;
  };

  // Batas Wilayah Administratif
  batasWilayah: {
    utara: string;
    timur: string;
    selatan: string;
    barat: string;
  };

  // Data Statistik & Demografi Resmi
  demografi: {
    jumlahPenduduk: number;
    lakiLaki: number;
    perempuan: number;
    jumlahKK: number;
    jumlahKRT: number;
    jumlahRW: number;
    jumlahRT: number;
    anakPutusSekolah: number;
    kelahiranAnak: number;
    pklBinaan: number;
    rumahMakan: number;
    armadaSampah: string;
  };

  // Aparatur Pemerintahan Kelurahan
  aparatur: {
    lurah: {
      nama: string;
      nip: string;
      pangkat: string;
      jabatan: string;
      kontak: string;
    };
    seklur: {
      nama: string;
      nip: string;
      pangkat: string;
      jabatan: string;
    };
    kasiPemerintahan: {
      nama: string;
      nip: string;
      pangkat: string;
      jabatan: string;
    };
    staf: Array<{
      nama: string;
      nip?: string;
      pangkat?: string;
      jabatan: string;
      kontak?: string;
    }>;
  };

  // Kredensial Login Portal Staf / Admin
  adminAuth: {
    username: string;
    password: string;
    kodePemulihan?: string;
  };

  // WhatsApp Pelayanan
  whatsappPelayanan: {
    nomor: string; // Format internasional tanpa simbol: 628xxxx
    nomorTampilan: string;
    jamLayanan: string;
    pesanDefault: string;
  };

  // Tautan Google Form Warga
  googleForms: {
    pengajuanSurat: string;
    pengaduanWarga: string;
    pendaftaranUmkm: string;
    surveiKepuasanIkm: string;
  };

  // Tautan Google Spreadsheet (Khusus Staf / Admin)
  googleSheetsAdmin: {
    rekapSuratMasuk: string;
    rekapPengaduan: string;
    rekapUmkm: string;
    rekapIkm: string;
    driveArsipBerkas: string;
  };

  // Kontak Darurat & Satgas Wilayah
  kontakDarurat: Array<{
    instansi: string;
    petugas?: string;
    nomor: string;
    nomorTampilan: string;
    kategori: 'keamanan' | 'kesehatan' | 'darurat' | 'satgas';
    deskripsi: string;
  }>;

  // Daftar Pengurus RW Resmi (3 RW)
  daftarRW: Array<{
    rw: string;
    ketua: string;
    jumlahRT: number;
    jumlahKK: number;
    jumlahJiwa: number;
    wilayah: string;
    kontak: string;
  }>;

  // Daftar Lengkap 16 RT Resmi di Mamajang Luar
  daftarRT: Array<{
    rw: string;
    rt: string;
    ketua: string;
    alamat: string;
    kontak: string;
    jumlahKK: number;
  }>;

  // Protokol Kerja Mingguan RT / RW
  protokolKerjaRTRW: Array<{
    hari: string;
    program: string;
    deskripsi: string;
  }>;

  // Kelompok Urban Farming & Binaan
  urbanFarming: Array<{
    nama: string;
    ketua: string;
    lokasi: string;
    kontak: string;
    komoditas: string;
  }>;

  // Sarana Ibadah
  saranaIbadah: Array<{
    nama: string;
    alamat: string;
    kapasitasJemaah: number;
  }>;
}

export const KELURAHAN_CONFIG: KelurahanConfig = {
  namaKelurahan: 'Kelurahan Mamajang Luar',
  kecamatan: 'Kecamatan Mamajang',
  kota: 'Kota Makassar',
  provinsi: 'Sulawesi Selatan',
  kodePos: '90132',
  alamatKantor: 'Jl. Onta Lama No. 1, Kelurahan Mamajang Luar, Kec. Mamajang, Kota Makassar, Sulawesi Selatan 90132',
  koordinat: {
    lat: -5.155398,
    lng: 119.416862,
  },

  profilFisik: {
    luasBangunan: '165,60 m²',
    luasTanah: '222,49 m²',
    statusBangunan: 'Milik Pemerintah Kota Makassar',
    statusTanah: 'Bersertifikat Pemerintah Kota Makassar',
    tahunRenovasi: '2022',
  },

  batasWilayah: {
    utara: 'Kelurahan Maricaya Selatan',
    timur: 'Kelurahan Mandala',
    selatan: 'Kelurahan Bonto Biraeng',
    barat: 'Kelurahan Mariso',
  },

  demografi: {
    jumlahPenduduk: 3025,
    lakiLaki: 1460,
    perempuan: 1565,
    jumlahKK: 878,
    jumlahKRT: 534,
    jumlahRW: 3,
    jumlahRT: 16,
    anakPutusSekolah: 0,
    kelahiranAnak: 10,
    pklBinaan: 30,
    rumahMakan: 11,
    armadaSampah: '3 Unit Viar/Fukuda Roda Tiga',
  },

  aparatur: {
    lurah: {
      nama: 'Muhammad Ansar AR, SE',
      nip: '19761029 200801 1 005',
      pangkat: 'Penata Tingkat I',
      jabatan: 'Lurah Mamajang Luar',
      kontak: '0819-9848-3190',
    },
    seklur: {
      nama: 'Muhammad Ilham, S.Sos',
      nip: '197501211994021002',
      pangkat: 'Penata Tingkat I',
      jabatan: 'Plt. Sekretaris Lurah',
    },
    kasiPemerintahan: {
      nama: 'Anwar Dg. Tasa',
      nip: '197408082007011022',
      pangkat: 'Penata Muda (III/a)',
      jabatan: 'Plt. Kepala Seksi Pemerintahan',
    },
    staf: [
      {
        nama: 'Hafsah Djafar, S.Sos',
        nip: '197110111995032003',
        pangkat: 'Penata Tingkat I',
        jabatan: 'Pengadministrasi & Kinerja Pegawai',
      },
      {
        nama: 'Ramadhan Surya Atmadja',
        nip: '199104032025211112',
        jabatan: 'Operator Layanan Operasional',
      },
      {
        nama: 'Abd. Rajab',
        nip: '199511152025211100',
        jabatan: 'Operator Layanan Operasional',
      },
      {
        nama: 'Muh. Ansar Alfarisi',
        jabatan: 'Komandan Satlinmas / Trantib Wilayah',
        kontak: '0853-4296-2520',
      },
      {
        nama: 'Ustadz Muktabar M.',
        jabatan: 'Imam Kelurahan / Pembina Rohani',
      },
    ],
  },

  adminAuth: {
    username: 'admin',
    password: 'mamajangluar2026',
    kodePemulihan: '90132',
  },

  whatsappPelayanan: {
    nomor: '6281998483190',
    nomorTampilan: '0819-9848-3190',
    jamLayanan: 'Senin - Jumat (07.30 - 15.30 WITA)',
    pesanDefault: 'Halo Pelayanan Kelurahan Mamajang Luar, saya ingin menanyakan informasi mengenai...',
  },

  googleForms: {
    pengajuanSurat: 'https://forms.gle/kelurahan-mamajang-luar-permohonan-surat',
    pengaduanWarga: 'https://forms.gle/kelurahan-mamajang-luar-aspirasi-pengaduan',
    pendaftaranUmkm: 'https://forms.gle/kelurahan-mamajang-luar-daftar-umkm',
    surveiKepuasanIkm: 'https://forms.gle/kelurahan-mamajang-luar-survei-ikm',
  },

  googleSheetsAdmin: {
    rekapSuratMasuk: 'https://docs.google.com/spreadsheets/d/rekap-surat-mamajang-luar',
    rekapPengaduan: 'https://docs.google.com/spreadsheets/d/rekap-pengaduan-mamajang-luar',
    rekapUmkm: 'https://docs.google.com/spreadsheets/d/rekap-umkm-mamajang-luar',
    rekapIkm: 'https://docs.google.com/spreadsheets/d/rekap-ikm-mamajang-luar',
    driveArsipBerkas: 'https://drive.google.com/drive/folders/arsip-kelurahan-mamajang-luar',
  },

  kontakDarurat: [
    {
      instansi: 'Call Center Darurat Makassar',
      nomor: '112',
      nomorTampilan: '112 (Bebas Pulsa)',
      kategori: 'darurat',
      deskripsi: 'Pusat komando darurat medis, kecelakaan & bencana Pemkot Makassar 24 jam.',
    },
    {
      instansi: 'Kantor Kelurahan Mamajang Luar',
      petugas: 'Lurah Muhammad Ansar AR, SE',
      nomor: '6281998483190',
      nomorTampilan: '0819-9848-3190',
      kategori: 'satgas',
      deskripsi: 'Kanal koordinasi resmi kantor lurah Jl. Onta Lama No. 1.',
    },
    {
      instansi: 'Satlinmas Mamajang Luar',
      petugas: 'Muh. Ansar Alfarisi',
      nomor: '6285342962520',
      nomorTampilan: '0853-4296-2520',
      kategori: 'keamanan',
      deskripsi: 'Satuan Linmas penjagaan ketertiban, poskamling, dan patroli wilayah kelurahan.',
    },
    {
      instansi: 'Bhabinkamtibmas Mamajang Luar',
      petugas: 'Aiptu M. Ridwan',
      nomor: '6281355667788',
      nomorTampilan: '0813-5566-7788',
      kategori: 'keamanan',
      deskripsi: 'Petugas Kepolisian pembina keamanan & ketertiban lingkungan kelurahan.',
    },
    {
      instansi: 'Babinsa Kel. Mamajang Luar',
      petugas: 'Serma Hasanuddin',
      nomor: '6282188990011',
      nomorTampilan: '0821-8899-0011',
      kategori: 'keamanan',
      deskripsi: 'Bintara Pembina Desa Koramil Mamajang.',
    },
    {
      instansi: 'Puskesmas Mamajang',
      nomor: '62411854321',
      nomorTampilan: '(0411) 854-321',
      kategori: 'kesehatan',
      deskripsi: 'Fasilitas pelayanan kesehatan tingkat pertama rujukan warga.',
    },
    {
      instansi: 'Dinas Pemadam Kebakaran Makassar',
      nomor: '113',
      nomorTampilan: '113 / (0411) 854-444',
      kategori: 'darurat',
      deskripsi: 'Posko induk penanggulangan kebakaran Kota Makassar.',
    },
  ],

  daftarRW: [
    {
      rw: 'RW 01',
      ketua: 'Muh. Indra Thahir',
      jumlahRT: 6,
      jumlahKK: 313,
      jumlahJiwa: 1028,
      wilayah: 'Jl. Mawas III, IV, V, Jl. Kancil III, Jl. Amirullah Lr. 1',
      kontak: '0813-4179-9341',
    },
    {
      rw: 'RW 02',
      ketua: 'Udhin Hamid',
      jumlahRT: 5,
      jumlahKK: 295,
      jumlahJiwa: 1026,
      wilayah: 'Jl. Onta Baru, Jl. Onta I, Jl. Kancil Utara, Jl. Mawas V',
      kontak: '0887-0545-0598',
    },
    {
      rw: 'RW 03',
      ketua: 'Andi Ilham',
      jumlahRT: 5,
      jumlahKK: 270,
      jumlahJiwa: 971,
      wilayah: 'Jl. Onta V, Jl. Tupai Lr. 18, Jl. Beruang Lr. 3, Jl. Beruang Utara Lr. 1, Jl. Badak Utara',
      kontak: '0823-4550-8730',
    },
  ],

  daftarRT: [
    // RW 01
    {
      rw: 'RW 01',
      rt: 'RT 01',
      ketua: 'Ilham Hamid',
      alamat: 'Jl. Mawas III No. 493',
      kontak: '0853-4365-0583',
      jumlahKK: 45,
    },
    {
      rw: 'RW 01',
      rt: 'RT 02',
      ketua: 'Lettu Inf. Munawir',
      alamat: 'Perum Taman Sultana Residence Blok K 14',
      kontak: '0852-4218-7375',
      jumlahKK: 37,
    },
    {
      rw: 'RW 01',
      rt: 'RT 03',
      ketua: 'Pelda Agus Salim',
      alamat: 'Jl. Mawas IV No. H 62',
      kontak: '0813-5678-5027',
      jumlahKK: 43,
    },
    {
      rw: 'RW 01',
      rt: 'RT 04',
      ketua: 'Nurwati',
      alamat: 'Jl. Kancil III No. 33A',
      kontak: '0851-9152-7624',
      jumlahKK: 84,
    },
    {
      rw: 'RW 01',
      rt: 'RT 05',
      ketua: 'Taribang Bugis',
      alamat: 'Jl. Mawas V No. 1',
      kontak: '0852-4020-9453',
      jumlahKK: 29,
    },
    {
      rw: 'RW 01',
      rt: 'RT 06',
      ketua: 'Asriuddin Massi',
      alamat: 'Jl. Amirullah Lr. 1 No. 9 B',
      kontak: '0823-2427-2477',
      jumlahKK: 14,
    },

    // RW 02
    {
      rw: 'RW 02',
      rt: 'RT 01',
      ketua: 'Muh. Ansar',
      alamat: 'Jl. Onta I No. 20',
      kontak: '0853-4296-2520',
      jumlahKK: 16,
    },
    {
      rw: 'RW 02',
      rt: 'RT 02',
      ketua: 'Ervin Amir',
      alamat: 'Jl. Kancil Utara No. 2 A',
      kontak: '0823-9416-7877',
      jumlahKK: 63,
    },
    {
      rw: 'RW 02',
      rt: 'RT 03',
      ketua: 'Hawa Hartina',
      alamat: 'Jl. Mawas V No. 12',
      kontak: '0859-2076-7548',
      jumlahKK: 30,
    },
    {
      rw: 'RW 02',
      rt: 'RT 04',
      ketua: 'Budiman',
      alamat: 'Jl. Kancil Utara No. 9',
      kontak: '0813-4177-7890',
      jumlahKK: 34,
    },
    {
      rw: 'RW 02',
      rt: 'RT 05',
      ketua: 'Ibrahim M',
      alamat: 'Jl. Kancil 3 No. 26',
      kontak: '0821-9045-7122',
      jumlahKK: 40,
    },

    // RW 03
    {
      rw: 'RW 03',
      rt: 'RT 01',
      ketua: 'Aspar Lamada',
      alamat: 'Jl. Tupai Lr. 18 No. 5 Makassar',
      kontak: '0888-0404-5601',
      jumlahKK: 19,
    },
    {
      rw: 'RW 03',
      rt: 'RT 02',
      ketua: 'Amiruddin',
      alamat: 'Jl. Beruang Lr. 3 No. 5',
      kontak: '0812-4390-4540',
      jumlahKK: 60,
    },
    {
      rw: 'RW 03',
      rt: 'RT 03',
      ketua: 'Nirmalasari',
      alamat: 'Jl. Beruang Utara Lr. 1 No. 5',
      kontak: '0838-3020-8550',
      jumlahKK: 46,
    },
    {
      rw: 'RW 03',
      rt: 'RT 04',
      ketua: 'Syamsiah Ratna',
      alamat: 'Jl. Onta Lama V No. 2',
      kontak: '0858-4130-5429',
      jumlahKK: 26,
    },
    {
      rw: 'RW 03',
      rt: 'RT 05',
      ketua: 'Aria Yudha Oktavian',
      alamat: 'Jl. Badak Utara No. 6 Makassar',
      kontak: '0817-0320-0270',
      jumlahKK: 36,
    },
  ],

  protokolKerjaRTRW: [
    {
      hari: 'Senin',
      program: 'Rapat Koordinasi RT/RW',
      deskripsi: 'Monitoring & evaluasi bulanan bersama mengenai kebersihan lingkungan, keamanan, dan ketertiban umum.',
    },
    {
      hari: 'Selasa',
      program: 'SEHATI (Sentuh Hati)',
      deskripsi: 'Pendataan dan pembaruan berkala data kependudukan warga, pemantauan lansia, serta warga disabilitas.',
    },
    {
      hari: 'Rabu',
      program: 'Pelayanan HAYATI',
      deskripsi: 'Pelayanan langsung menyentuh hati warga untuk menampung aspirasi sosial kemasyarakatan.',
    },
    {
      hari: 'Kamis',
      program: 'Pelayanan HAYATI',
      deskripsi: 'Pendampingan administrasi dan pembinaan potensi kemandirian keluarga oleh pengurus RT/RW.',
    },
    {
      hari: 'Jumat',
      program: "Jum'at Bersih",
      deskripsi: 'Kerja bakti pembersihan drainase lorong, penanganan sampah lingkungan, dan penataan lorong bersama warga.',
    },
    {
      hari: 'Minggu',
      program: 'Minggu Sehat',
      deskripsi: 'Senam kebugaran jasmani bersama seluruh warga masyarakat di lingkungan RW masing-masing.',
    },
  ],

  urbanFarming: [
    {
      nama: "Kelompok Urban Farming Je'ne Tallasa",
      ketua: 'Herman Tandek',
      lokasi: 'RT 005 / RW 001, Kelurahan Mamajang Luar',
      kontak: '0831-3906-9000',
      komoditas: 'Sayuran Organik, Tanaman Obat Keluarga (TOGA), Buah, Tanaman Hias, dan Kolam Budidaya Ikan',
    },
    {
      nama: "Kelompok Urban Farming Je'ne Ma'dinging",
      ketua: 'Muh. Ansar Al Farisi',
      lokasi: 'RT 001 / RW 002, Kelurahan Mamajang Luar',
      kontak: '0853-4296-2520',
      komoditas: 'Tanaman Obat Tradisional dan Tanaman Hias Lingkungan',
    },
  ],

  saranaIbadah: [
    {
      nama: 'Mesjid As-Saidah',
      alamat: 'Jl. Onta Lama No. 13',
      kapasitasJemaah: 270,
    },
    {
      nama: 'Mesjid Azhar',
      alamat: 'Jl. Onta Baru No. 41',
      kapasitasJemaah: 160,
    },
    {
      nama: 'Mesjid Jami Nur Muhammad',
      alamat: 'Jl. Mawas V',
      kapasitasJemaah: 290,
    },
  ],
};
