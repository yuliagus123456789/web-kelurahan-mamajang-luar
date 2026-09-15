-- =====================================================================
-- MIGRATION: ADD STATUS COLUMN TO UMKM TABLE & PUBLIC REGISTRATION POLICY
-- Website Kelurahan Mamajang Luar, Kota Makassar
-- =====================================================================

-- 1. Tambahkan kolom status pada tabel umkm
ALTER TABLE umkm
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Disetujui';

COMMENT ON COLUMN umkm.status IS 'Status moderasi UMKM: Disetujui (aktif di katalog), Menunggu (pendaftaran mandiri warga), Ditolak';

-- 2. Pastikan anon dapat mendaftarkan UMKM baru (status default Menunggu)
DROP POLICY IF EXISTS "public_insert_umkm" ON umkm;
CREATE POLICY "public_insert_umkm" ON umkm
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Pastikan anon dapat membaca UMKM yang disetujui
DROP POLICY IF EXISTS "public_read_umkm" ON umkm;
CREATE POLICY "public_read_umkm" ON umkm
  FOR SELECT
  TO anon, authenticated
  USING (true);
