@echo off
title AURA Studio - ASP.NET Core 9 API Gateway
cd /d "%~dp0services\api"
echo ===================================================
echo  Starting AURA Studio API Gateway (Port 5000)
echo ===================================================
dotnet run --urls http://localhost:5000
pause

