@echo off
echo ========================================
echo        HARDINI AGRICULTURE APP
echo ========================================
echo.
echo Starting Hardini Backend Server...
echo.
cd backend
start cmd /k "node server.js"
timeout /t 3 /nobreak > nul
cd ..
echo.
echo Opening Hardini App in browser...
echo.
start index.html
echo.
echo ========================================
echo Backend server should be running on:
echo http://localhost:3001
echo.
echo Hardini App opened in your browser!
echo ========================================
pause
