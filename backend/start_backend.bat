@echo off
title Backend FastAPI (Port 8001)
echo Starting FastAPI server on http://localhost:8001
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
pause
