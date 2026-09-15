-- =====================================================================
-- MIGRATION: ADD SPK (SAW) ATTRIBUTES TO COMPLAINTS TABLE
-- Website Kelurahan Mamajang Luar, Kota Makassar
-- =====================================================================

-- 1. Tambahkan kolom kategori, cakupan dampak, nomor tiket, dan respon admin jika belum ada
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Kebersihan & Drainase',
  ADD COLUMN IF NOT EXISTS impact_scope text DEFAULT 'Beberapa Warga (1 RT)',
  ADD COLUMN IF NOT EXISTS ticket_number text,
  ADD COLUMN IF NOT EXISTS admin_response text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- 2. Pastikan RLS mengizinkan anon insert kolom-kolom baru tersebut
DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 3. Izinkan pembacaan pengaduan oleh staf admin kelurahan (anon & authenticated)
DROP POLICY IF EXISTS "admin_read_complaints" ON complaints;
CREATE POLICY "admin_read_complaints" ON complaints
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_complaints" ON complaints;
CREATE POLICY "admin_update_complaints" ON complaints
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_complaints" ON complaints;
CREATE POLICY "admin_delete_complaints" ON complaints
  FOR DELETE TO anon, authenticated
  USING (true);

-- 4. Komentar dokumentasi kolom
COMMENT ON COLUMN complaints.category IS 'Kategori permasalahan untuk SPK SAW (Infrastruktur, Kebersihan, Keamanan, dll)';
COMMENT ON COLUMN complaints.impact_scope IS 'Cakupan dampak warga untuk SPK SAW (Kelurahan, 1 RW, 1 RT, Pribadi)';
