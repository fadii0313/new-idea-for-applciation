@echo off
title AURA Virtual Try-On Studio Launcher
echo ========================================================
echo   Launching AURA Dual-Mode Studio (Web + API Gateway)
echo ========================================================
echo.
start "AURA API Gateway" "%~dp0start-api.bat"
timeout /t 3 /nobreak >nul
start "AURA Web Frontend" "%~dp0start-web.bat"
echo.
echo Both servers have been launched in background windows!
echo - API Gateway: http://localhost:5000
echo - Web Studio:  http://localhost:3000
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000

