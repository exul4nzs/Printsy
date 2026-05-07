@echo off
echo ===================================================
echo               STARTING PRINTSY
echo ===================================================
echo.
echo Starting Backend (Django on port 8000)...
start cmd /k "cd backend && python manage.py runserver"

echo Starting Frontend (Next.js on port 3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both services are launching in separate windows!
echo - Frontend will be available at: http://localhost:3000
echo - Backend will be available at: http://localhost:8000
echo.
echo To stop the servers later, simply close those two black windows.
echo ===================================================
