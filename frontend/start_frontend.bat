@echo off

setlocal enabledelayedexpansion

set PORT=5172

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
)

echo =========================================
echo VIVA FRONTEND IS RUNNING
echo -----------------------------------
echo Access the frontend at http://!IP!:!PORT!
echo =========================================

npm run dev -- --host 0.0.0.0 --port !PORT!
pause