-- =====================================================================
-- MASTER SETUP DATABASE SUPABASE KELURAHAN MAMAJANG LUAR
-- Eksekusi file SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dtmcbzrktnrjnrsjgiyf/sql
-- =====================================================================

-- 1. TABEL BERITA & PENGUMUMAN
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
CREATE POLICY "public_read_news" ON news FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_all_news" ON news;
CREATE POLICY "admin_all_news" ON news FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 2. TABEL GALERI KEGIATAN
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
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_all_gallery" ON gallery;
CREATE POLICY "admin_all_gallery" ON gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 3. TABEL DIREKTORI UMKM WARGA
CREATE TABLE IF NOT EXISTS umkm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner text NOT NULL,
  category text NOT NULL DEFAULT 'Kuliner',
  description text NOT NULL,
  image_url text,
  contact text,
  address text,
  status text NOT NULL DEFAULT 'Menunggu Verifikasi',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_umkm" ON umkm;
CREATE POLICY "public_read_umkm" ON umkm FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_umkm" ON umkm;
CREATE POLICY "public_insert_umkm" ON umkm FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_manage_umkm" ON umkm;
CREATE POLICY "admin_manage_umkm" ON umkm FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 4. TABEL PENGADUAN WARGA (SPK SAW)
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text,
  name text NOT NULL,
  email text,
  phone text,
  category text NOT NULL DEFAULT 'Kebersihan & Drainase',
  impact_scope text NOT NULL DEFAULT 'Beberapa Warga (1 RT)',
  subject text NOT NULL,
  message text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'Baru',
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE TO anon, authenticated USING (true);


-- 5. SEED DATA AWAL BERITA (CONTOH)
INSERT INTO news (title, excerpt, content, category, is_published) VALUES
('Pelaksanaan Kerja Bakti & Pembersihan Saluran Drainase', 'Aparatur bersama satgas drainase membersihkan saluran di RW 02 menyambut musim penghujan.', 'Kegiatan kerja bakti rutin dipimpin langsung oleh Lurah Mamajang Luar bersama satgas kebersihan dan tokoh masyarakat.', 'Kegiatan', true),
('Jadwal Pelayanan Posyandu Balita & Lansia', 'Pelayanan kesehatan berkala bagi balita dan lansia di Posyandu Melati Mamajang Luar.', 'Pemeriksaan kesehatan gratis, penimbangan balita, dan pemberian vitamin oleh petugas puskesmas dan kader PKK.', 'Pengumuman', true)
ON CONFLICT DO NOTHING;

-- 6. SEED DATA AWAL UMKM (CONTOH)
INSERT INTO umkm (name, owner, category, description, contact, address, status) VALUES
('Warung Coto Makassar Mamajang', 'Dg. Nuntung', 'Kuliner', 'Coto Makassar otentik dengan rempah khas dan ketupat daun kelapa segar.', '6281234567890', 'Jl. Mamajang Luar No. 12', 'Disetujui'),
('Jalangkote & Kue Tradisional Ibu Rahma', 'Ibu Rahmawati', 'Kuliner', 'Jalangkote renyah sambal khas Makassar, pastel, dan aneka kue basah.', '6281987654321', 'Lorong 3 RW 01', 'Disetujui')
ON CONFLICT DO NOTHING;
