@echo off
REM Wellness Intelligence Platform — one-command launch (Windows)
REM Double-click or run from project root: start.bat

cd /d "%~dp0"
set ROOT=%CD%

echo ==============================================
echo   Wellness Intelligence Platform - Launch
echo ==============================================
echo.

REM Check Node
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is required. Install from https://nodejs.org
  pause
  exit /b 1
)

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Docker is required. Install Docker Desktop.
  pause
  exit /b 1
)

echo [OK] Node and Docker found
echo.

REM Create .env if missing
if not exist "backend\.env" (
  echo Creating backend\.env from .env.example...
  copy backend\.env.example backend\.env >nul
  echo [OK] backend\.env created
) else (
  echo [OK] backend\.env exists
)
echo.

REM Install dependencies if needed
if not exist "node_modules" (echo Installing root dependencies... & call npm install)
if not exist "backend\node_modules" (echo Installing backend... & cd backend && call npm install && cd ..)
if not exist "frontend\node_modules" (echo Installing frontend... & cd frontend && call npm install && cd ..)
echo [OK] Dependencies ready
echo.

REM Start database
echo Starting PostgreSQL (Docker)...
docker compose up db -d 2>nul
if %ERRORLEVEL% neq 0 docker-compose up db -d 2>nul
echo Waiting for database...
timeout /t 5 /nobreak >nul
echo [OK] Database starting
echo.

REM Migrations
echo Applying database migrations...
cd backend
call npx prisma migrate deploy 2>nul
if %ERRORLEVEL% neq 0 call npx prisma migrate dev --name init --skip-generate 2>nul
cd ..
echo [OK] Migrations done
echo.

REM Seed once
if not exist "backend\.seed-done" (
  echo Seeding demo users...
  cd backend && call npx prisma db seed 2>nul && cd ..
  echo. > backend\.seed-done
)
echo.

echo ==============================================
echo   Starting backend + frontend...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo ==============================================
echo.
echo Browser will open in ~10 seconds. Close this window to stop.
echo.

REM Open browser after 10 seconds (in background)
start /b cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3000"

REM Run both servers
call npm run dev

pause
