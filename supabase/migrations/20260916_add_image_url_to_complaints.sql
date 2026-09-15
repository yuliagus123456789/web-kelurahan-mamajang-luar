-- =====================================================================
-- MIGRATION: ADD OPTIONAL IMAGE_URL COLUMN FOR PHOTO PROOF IN COMPLAINTS
-- Website Kelurahan Mamajang Luar, Kota Makassar
-- =====================================================================

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN complaints.image_url IS 'URL atau data base64 foto bukti kejadian lapangan yang diunggah warga secara opsional';
