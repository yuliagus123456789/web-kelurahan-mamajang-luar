@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo   PUSH WEB KELURAHAN MAMAJANG LUAR KE GITHUB
echo =========================================================
echo.

set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git belum terpasang di sistem!
    echo Silakan jalankan installer yang ada di folder Downloads:
    echo "C:\Users\d1sko\Downloads\Git-Installer.exe"
    echo Lalu jalankan kembali file ini.
    echo.
    pause
    exit /b 1
)

cd /d "c:\Users\d1sko\Downloads\web-kelurahan-mamajang-luar-main\web-kelurahan-mamajang-luar-main"

echo 1. Inisialisasi Git repository...
if not exist ".git" (
    git init
    git branch -M main
)

echo 2. Menghubungkan remote GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/yuliagus123456789/web-kelurahan-mamajang-luar.git

echo 3. Menambahkan seluruh file proyek...
git add .

echo 4. Membuat commit pembaruan...
git commit -m "Update komprehensif website Kelurahan Mamajang Luar: Logo resmi Pemkot Makassar, 36 UMKM Malur, 8 Berita & Kegiatan terverifikasi, bagan struktur bergaris, dan sensor KTP SEHATI" 2>nul

echo 5. Melakukan push ke GitHub (main)...
echo (Jendela browser akan terbuka otomatis untuk login / otorisasi akun GitHub Anda)
echo Silakan klik 'Sign in with your browser' atau 'Authorize'.
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =========================================================
    echo   BERHASIL! Seluruh kode telah ter-push ke GitHub!
    echo =========================================================
) else (
    echo.
    echo [CATATAN] Jika push ditolak karena repositori di GitHub belum dibuat,
    echo pastikan Anda telah membuat repositori dengan nama:
    echo "web-kelurahan-mamajang-luar" di akun https://github.com/yuliagus123456789
)

echo.
pause
