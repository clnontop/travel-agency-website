@echo off
echo ========================================
echo    Trinck Driver App - APK Builder
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Installing Expo CLI globally...
call npm install -g expo-cli
if %errorlevel% neq 0 (
    echo Error: Failed to install Expo CLI
    pause
    exit /b %errorlevel%
)

echo.
echo Step 3: Installing EAS CLI globally...
call npm install -g eas-cli
if %errorlevel% neq 0 (
    echo Error: Failed to install EAS CLI
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo    Ready to build APK!
echo ========================================
echo.
echo You have two options:
echo.
echo 1. Build with EAS (Recommended - requires Expo account):
echo    Run: eas build -p android --profile preview
echo.
echo 2. Build locally with Expo:
echo    Run: expo build:android -t apk
echo.
echo Note: Make sure to update API_BASE_URL in:
echo - src/services/ApiService.ts
echo - src/services/AuthService.ts
echo.
echo Press any key to start EAS build...
pause

echo.
echo Starting EAS build...
call eas build -p android --profile preview

echo.
echo ========================================
echo    Build process started!
echo ========================================
echo.
echo The APK will be available for download once the build is complete.
echo You can check the build status in your Expo dashboard.
echo.
pause
