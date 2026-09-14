$env:PATH = "C:\Program Files\Git\cmd;C:\Program Files\Git\bin;$env:LOCALAPPDATA\Programs\Git\cmd;$env:PATH"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  PUSH WEBSITE KELURAHAN MAMAJANG LUAR KE GITHUB" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  Write-Host "[PERINGATAN] Git belum terpasang di sistem!" -ForegroundColor Yellow
  Write-Host "Jalankan installer: C:\Users\d1sko\Downloads\Git-Installer.exe" -ForegroundColor White
  exit 1
}

Set-Location "c:\Users\d1sko\Downloads\web-kelurahan-mamajang-luar-main\web-kelurahan-mamajang-luar-main"

Write-Host "1. Inisialisasi Git repository..." -ForegroundColor Green
if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

Write-Host "2. Menghubungkan remote origin..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/yuliagus123456789/web-kelurahan-mamajang-luar.git

Write-Host "3. Memasukkan seluruh berkas terbaru..." -ForegroundColor Green
git add .

Write-Host "4. Membuat commit pembaruan..." -ForegroundColor Green
git commit -m "Update komprehensif website Kelurahan Mamajang Luar: Logo resmi Pemkot Makassar, 36 UMKM Malur, 8 Berita & Kegiatan terverifikasi, bagan struktur bergaris, dan sensor KTP SEHATI"

Write-Host "5. Melakukan push ke branch main..." -ForegroundColor Green
git push -u origin main
