-- Migration: Aktifkan Hak Akses CRUD untuk CMS Admin Kelurahan Mamajang Luar
-- Jalankan skrip ini di Supabase SQL Editor jika fitur Tambah/Ubah/Hapus dibatasi oleh Row Level Security (RLS).

-- 1. Kebijakan untuk Berita (News)
DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news" ON news FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news" ON news FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE
  TO anon, authenticated USING (true);

-- 2. Kebijakan untuk Galeri (Gallery)
DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery;
CREATE POLICY "admin_insert_gallery" ON gallery FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery;
CREATE POLICY "admin_update_gallery" ON gallery FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery;
CREATE POLICY "admin_delete_gallery" ON gallery FOR DELETE
  TO anon, authenticated USING (true);

-- 3. Kebijakan untuk UMKM
DROP POLICY IF EXISTS "admin_insert_umkm" ON umkm;
CREATE POLICY "admin_insert_umkm" ON umkm FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_umkm" ON umkm;
CREATE POLICY "admin_update_umkm" ON umkm FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_umkm" ON umkm;
CREATE POLICY "admin_delete_umkm" ON umkm FOR DELETE
  TO anon, authenticated USING (true);

-- 4. Kebijakan untuk Pengaduan Warga (Complaints: Select, Update, Delete untuk staf)
DROP POLICY IF EXISTS "admin_select_complaints" ON complaints;
CREATE POLICY "admin_select_complaints" ON complaints FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_complaints" ON complaints;
CREATE POLICY "admin_update_complaints" ON complaints FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_complaints" ON complaints;
CREATE POLICY "admin_delete_complaints" ON complaints FOR DELETE
  TO anon, authenticated USING (true);
