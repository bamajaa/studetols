@echo off
title STUDETOLS - Public Online Server
echo ========================================================
echo   STUDETOLS - Menjalankan Server Public Online (Cloudflare)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Menjalankan MySQL Database...
start /b "" cmd /c "C:\xampp\mysql_start.bat"
timeout /t 2 /nobreak >nul

echo [2/3] Menjalankan Backend STUDETOLS (Port 3000)...
start /b "" cmd /c "cd server && node src/index.js"
timeout /t 3 /nobreak >nul

echo [3/3] Membuka Akses Publik Online via Cloudflare Tunnel...
echo Website Anda sekarang dapat diakses secara publik dari HP atau laptop mana saja!
echo.
echo ========================================================
cloudflared.exe tunnel --url http://localhost:3000
pause
