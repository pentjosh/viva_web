@echo off
setlocal enabledelayedexpansion

set PORT=8001

echo =========================================
echo VIVA BACKEND IS RUNNING
echo =========================================

uvicorn main:app --host 0.0.0.0 --port !PORT! --reload
pause
