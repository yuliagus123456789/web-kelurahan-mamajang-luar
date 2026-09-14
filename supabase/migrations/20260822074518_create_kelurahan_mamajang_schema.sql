/*
# Create schema for Kelurahan Mamajang Luar website

1. Overview
   This migration creates the data layer for a public-facing urban-village
   (kelurahan) information website for Kelurahan Mamajang Luar, Makassar.
   The site is a NO-AUTH public website: visitors never sign in. All public
   content (news, gallery, UMKM) is readable by the anon-key frontend.
   Complaints/suggestions are insert-only by anon (visitors can submit but
   cannot read other people's submissions, protecting privacy).

2. New Tables
   - `news` — berita & pengumuman resmi kelurahan
     - id, title, excerpt, content, image_url, category, is_published,
       published_at, created_at
   - `gallery` — galeri kegiatan warga / KKN
     - id, title, description, image_url, event_date, created_at
   - `umkm` — direktori UMKM / produk unggulan warga
     - id, name, owner, category, description, image_url, contact, address,
       created_at
   - `complaints` — saran / pengaduan warga
     - id, name, email, phone, subject, message, status, created_at
   - `services` — prosedur & layanan publik (static-ish content)
     - id, title, description, steps (text[]), icon, created_at

3. Security
   - RLS enabled on every table.
   - news, gallery, umkm, services: public read (anon, authenticated),
     no public write (managed by admins — no insert/update/delete policy
     for anon, so the anon role cannot mutate them).
   - complaints: anon can INSERT only (cannot SELECT/UPDATE/DELETE), so
     visitors can submit but cannot read others' private submissions.

4. Notes
   - Seed data is included for news, gallery, umkm, and services so the
     website is populated on first load.
*/

-- ===== NEWS =====
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  category text NOT NULL DEFAULT 'Pengumuman',
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_news" ON news;
CREATE POLICY "public_read_news" ON news FOR SELECT
  TO anon, authenticated USING (is_published = true);

-- ===== GALLERY =====
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  event_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

-- ===== UMKM =====
CREATE TABLE IF NOT EXISTS umkm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner text NOT NULL,
  category text NOT NULL DEFAULT 'Kuliner',
  description text NOT NULL,
  image_url text,
  contact text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_umkm" ON umkm;
CREATE POLICY "public_read_umkm" ON umkm FOR SELECT
  TO anon, authenticated USING (true);

-- ===== COMPLAINTS =====
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'Baru',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===== SERVICES =====
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  steps text[] NOT NULL DEFAULT '{}',
  icon text NOT NULL DEFAULT 'FileText',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

-- ===== SEED DATA =====

-- News
INSERT INTO news (title, excerpt, content, image_url, category, published_at) VALUES
('Kelurahan Mamajang Luar Sukses Gelar Kerja Bakti Membersihkan Lingkungan', 'Kegiatan kerja bakti diikuti oleh warga, perangkat kelurahan, dan pemuda setempat untuk menciptakan lingkungan yang bersih dan sehat.', 'Kelurahan Mamajang Luar menggelar kegiatan kerja bakti yang diikuti oleh warga, perangkat kelurahan, karang taruna, dan pemuda setempat. Kegiatan ini bertujuan untuk menciptakan lingkungan yang bersih, sehat, dan nyaman bagi seluruh warga.

Kegiatan dimulai pukul 07.00 WITA dengan membersihkan saluran air, trotoar, dan area fasilitas umum. Lurah Mamajang Luar dalam sambutannya mengapresiasi antusiasme warga dan berharap kegiatan ini dapat menjadi rutinitas bulanan.

"Kita harus menjaga kebersihan lingkungan bersama-sama. Lingkungan yang bersih adalah cerminan warga yang sehat," ujar Lurah Mamajang Luar.

Kegiatan ditutup dengan pemberian makanan ringan kepada seluruh peserta kerja bakti.', 'https://images.pexels.com/photos/36596595/pexels-photo-36596595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Kegiatan', '2026-08-15'),
('Pendaftaran Program Bantuan Sosial Tahap II Resmi Dibuka', 'Pendaftaran program bantuan sosial untuk warga kurang mampu kini dibuka di kantor kelurahan setiap hari kerja.', 'Pendaftaran Program Bantuan Sosial Tahap II resmi dibuka di Kelurahan Mamajang Luar. Warga yang berhak menerima bantuan sosial dapat mendaftar langsung di kantor kelurahan dengan membawa persyaratan administrasi yang dibutuhkan.

Persyaratan:
1. Fotokopi KTP dan KK
2. Fotokopi rekening listrik
3. Surat keterangan tidak mampu dari RT/RW
4. Mengisi formulir pendaftaran

Pendaftaran dibuka setiap hari kerja pukul 08.00 - 14.00 WITA. Bagi warga yang membutuhkan informasi lebih lanjut dapat menghubungi sekretariat kelurahan.

Pastikan data yang dimasukkan adalah data yang valid dan sesuai dengan kondisi sebenarnya agar proses verifikasi berjalan lancar.', 'https://images.pexels.com/photos/6647005/pexels-photo-6647005.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Pengumuman', '2026-08-10'),
('Pelatihan UMKM Digital Marketing untuk Warga Mamajang Luar', 'Kelurahan bekerja sama dengan tim KKN Universitas mengadakan pelatihan digital marketing bagi pelaku UMKM lokal.', 'Dalam rangka meningkatkan perekonomian warga, Kelurahan Mamajang Luar bekerja sama dengan tim KKN dari Universitas Hasanuddin mengadakan pelatihan digital marketing bagi pelaku UMKM lokal.

Pelatihan yang berlangsung selama tiga hari ini membahas tentang pemanfaatan media sosial untuk pemasaran produk, pembuatan konten yang menarik, dan penggunaan aplikasi pesan untuk transaksi jual beli.

Sebanyak 35 pelaku UMKM dari berbagai bidang mengikuti pelatihan ini. Para peserta diajarkan cara membuat foto produk yang menarik menggunakan kamera ponsel, serta teknik copywriting untuk caption media sosial.

"Kami berharap pelatihan ini membantu pelaku UMKM di Mamajang Luar untuk go digital dan menjangkau lebih banyak pelanggan," kata ketua panitia pelatihan.', 'https://images.pexels.com/photos/7156162/pexels-photo-7156162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Kegiatan', '2026-08-05'),
('Peringatan HUT Kemerdekaan RI ke-81 Rangkaian Acara di Mamajang Luar', 'Rangkaian acara peringatan HUT Kemerdekaan RI ke-81 meliputi upacara, lomba rakyat, dan pentas seni budaya.', 'Kelurahan Mamajang Luar mengadakan rangkaian acara peringatan Hari Ulang Tahun Kemerdekaan Republik Indonesia ke-81 dengan beragam kegiatan yang melibatkan seluruh lapisan masyarakat.

Acara dimulai dengan upacara bendera di lapangan kelurahan, dilanjutkan dengan berbagai lomba rakyat seperti balap karung, panjat pinang, lomba makan kerupuk, dan lomba kelereng. Selain itu juga diadakan pentas seni budaya yang menampilkan kesenian tradisional Makassar.

Lurah Mamajang Luar mengucapkan selamat Hari Kemerdekaan kepada seluruh warga dan berharap semangat kebersamaan dan gotong royong terus terjaga di lingkungan kelurahan.

Acara ditutup dengan pembagian hadiah kepada pemenang lomba dan makan bersama seluruh warga.', 'https://images.pexels.com/photos/39046078/pexels-photo-39046078.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Pengumuman', '2026-08-17');

-- Gallery
INSERT INTO gallery (title, description, image_url, event_date) VALUES
('Kerja Bakti Lingkungan', 'Warga bersama perangkat kelurahan membersihkan lingkungan', 'https://images.pexels.com/photos/36596595/pexels-photo-36596595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-08-15'),
('Pelatihan UMKM Digital', 'Pelatihan digital marketing untuk pelaku UMKM lokal', 'https://images.pexels.com/photos/7156162/pexels-photo-7156162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-08-05'),
('Pembagian Sembako', 'Kegiatan sosial pembagian paket sembako untuk warga', 'https://images.pexels.com/photos/6646778/pexels-photo-6646778.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-07-28'),
('Volunteer Community Service', 'Relawan muda membersihkan trotoar dan area umum', 'https://images.pexels.com/photos/6647012/pexels-photo-6647012.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-07-20'),
('Festival Kuliner Warga', 'Pameran kuliner khas warga Mamajang Luar', 'https://images.pexels.com/photos/37234069/pexels-photo-37234069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-07-15'),
('Peringatan HUT RI', 'Rangkaian acara peringatan kemerdekaan RI', 'https://images.pexels.com/photos/30335349/pexels-photo-30335349.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '2026-08-17');

-- UMKM
INSERT INTO umkm (name, owner, category, description, image_url, contact, address) VALUES
('Warung Nasi Kuning Mama Andi', 'Andi Tenri', 'Kuliner', 'Nasi kuning khas Makassar dengan bumbu rempah pilihan, tersedia setiap pagi dengan menu lengkap dan harga terjangkau.', 'https://images.pexels.com/photos/36590872/pexels-photo-36590872.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0812-4567-8901', 'Jl. Mamajang Raya No. 12'),
('Kue Tradisional Cik Ira', 'Ira Sukmawati', 'Kuliner', 'Aneka kue tradisional Sulawesi Selatan seperti barongko, cucuru, dan pisang epe. Menerima pesanan untuk acara.', 'https://images.pexels.com/photos/37234069/pexels-photo-37234069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0852-9988-7766', 'Jl. Bontang Raya No. 8'),
('Toko Kelontong Berkah', 'Haji Yusuf', 'Perdagangan', 'Kebutuhan sehari-hari, sembako, dan peralatan rumah tangga dengan harga grosir untuk warga Mamajang Luar.', 'https://images.pexels.com/photos/7025416/pexels-photo-7025416.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0813-2233-4455', 'Jl. Mamajang Dalam No. 45'),
('Kerajinan Tangan Sulam Mamajang', 'Rahmawati', 'Kerajinan', 'Kerajinan tangan berupa sulaman dan bordir khas Sulawesi Selatan, menerima pesanan custom untuk berbagai kebutuhan.', 'https://images.pexels.com/photos/18396411/pexels-photo-18396411.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0821-7766-5544', 'Jl. Bontomarannu No. 22'),
('Warung Kopi Pahlawan', 'Pak Hasan', 'Kuliner', 'Kopi hitam khas Makassar dengan suasana hangat dan nyaman, tempat berkumpul warga dan pekerja.', 'https://images.pexels.com/photos/36128610/pexels-photo-36128610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0853-1122-3344', 'Jl. Pahlawan No. 3'),
('Toko Kue Cik Anwar', 'Anwar', 'Kuliner', 'Roti dan kue kering untuk lebaran dan acara keluarga, dibuat dengan bahan berkualitas dan resep turun-temurun.', 'https://images.pexels.com/photos/27109728/pexels-photo-27109728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '0812-8899-7766', 'Jl. Mamajang Raya No. 67');

-- Services
INSERT INTO services (title, description, steps, icon) VALUES
('Pembuatan KTP Elektronik', 'Prosedur pengurusan Kartu Tanda Penduduk (KTP) elektronik untuk warga Mamajang Luar.', '{"Siapkan fotokopi KK lama dan akte kelahiran","Datang ke kantor kelurahan dengan membawa dokumen asli","Mengisi formulir permohonan KTP","Melakukan pengambilan foto dan sidik jari","KTP dapat diambil 14 hari kerja setelah pemberitahuan"}', 'CreditCard'),
('Pembuatan Kartu Keluarga', 'Prosedur pengurusan Kartu Keluarga (KK) baru maupun perubahan data.', '{"Siapkan dokumen pendukung (akte nikah, akte kelahiran, KTP)","Datang ke kantor kelurahan pada jam pelayanan","Mengisi formulir permohonan KK","Verifikasi berkas oleh petugas kelurahan","KK baru dapat diambil dalam 7 hari kerja"}', 'Users'),
('Surat Pengantar Domisili', 'Pengurusan surat keterangan domisili untuk keperluan administrasi warga.', '{"Bawa KTP dan KK asli","Mengisi formulir permohonan surat domisili","Pengisian data dilengkapi tanda tangan RT/RW setempat","Pengajuan ke kantor kelurahan untuk ditandatangani Lurah","Surat dapat diambil 1-2 hari kerja"}', 'MapPin'),
('Surat Keterangan Usaha', 'Penguruan surat keterangan usaha untuk pelaku UMKM di wilayah Mamajang Luar.', '{"Siapkan KTP, KK, dan foto lokasi usaha","Mengisi formulir permohonan SKU","Melampirkan keterangan dari RT/RW","Pengajuan dan verifikasi oleh petugas kelurahan","Surat dapat diambil 3 hari kerja"}', 'Store'),
('Surat Pengantar Nikah', 'Pengurusan surat pengantar untuk keperluan pernikahan (N-1).', '{"Membawa KTP, KK, dan akte kelahiran","Mengisi formulir N-1 di kantor kelurahan","Melampirkan pas foto sesuai persyaratan","Verifikasi data calon mempelai","Surat dapat diambil 2 hari kerja"}', 'Heart'),
('Surat Keterangan Tidak Mampu', 'Pengurusan surat keterangan tidak mampu untuk keperluan bantuan sosial atau pendidikan.', '{"Bawa KTP dan KK","Mengisi formulir permohonan SKTM","Melampirkan keterangan RT/RW","Survey lapangan oleh petugas kelurahan","Surat dapat diambil 5 hari kerja"}', 'FileText');
