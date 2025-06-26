set BACKEND_HOST=127.0.0.1
set BACKEND_PORT=8001
set FRONTEND_HOST=127.0.0.1
set FRONTEND_PORT=5172
set FRONTEND_ORIGIN=http://%FRONTEND_HOST%:%FRONTEND_PORT%

start cmd /k "cd backend && uvicorn main:app --host %BACKEND_HOST% --port %BACKEND_PORT% --reload"

timeout /t 2 > nul

cd frontend
set VITE_API_URL=http://%BACKEND_HOST%:%BACKEND_PORT%
set VITE_PORT=%FRONTEND_PORT%
npm run dev -- --host %FRONTEND_HOST% --port %FRONTEND_PORT% --strictPort --open