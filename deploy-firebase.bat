@echo off
setlocal
title Deploy YTFlow to Firebase Hosting
echo ========================================================
echo       Deploying YTFlow to ytdownloader-d4673.web.app
echo ========================================================
echo.

if not defined VITE_API_BASE_URL (
    set /p "VITE_API_BASE_URL=Enter the deployed backend API base URL (must include /api): "
)
if not defined VITE_API_BASE_URL (
    echo [ERROR] A deployed backend API URL is required. Firebase Hosting only serves the frontend.
    pause
    exit /b 1
)

echo Step 1: Building React Production Bundle...
cd /d "%~dp0\frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please review the error above.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Authenticating with Firebase...
echo (If you are not logged in, your browser will open to select your Google account)
cd /d "%~dp0"
call npx -y firebase login

echo.
echo Step 3: Deploying static assets to Firebase Hosting...
call npx -y firebase deploy --only hosting --project ytdownloader-d4673

echo.
echo ========================================================
echo [SUCCESS] Your YTFlow site is now live!
echo Visit: https://ytdownloader-d4673.web.app
echo Alternative: https://ytdownloader-d4673.firebaseapp.com
echo ========================================================
pause
