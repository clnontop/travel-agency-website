@echo off
echo ========================================
echo    Building Trinck Driver App APK
echo ========================================
echo.

echo This will create an APK file for Android devices.
echo.
echo Prerequisites:
echo - Node.js installed
echo - Expo CLI installed (npm install -g expo-cli)
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Optimizing for production...
call npx expo optimize
if %errorlevel% neq 0 (
    echo Warning: Optimization failed, continuing anyway...
)

echo.
echo ========================================
echo    Ready to build APK!
echo ========================================
echo.
echo You need an Expo account to build the APK.
echo If you don't have one, create it at: https://expo.dev
echo.
echo The build will be done on Expo servers and you'll get a download link.
echo.
pause

echo.
echo Starting APK build...
call expo build:android -t apk

echo.
echo ========================================
echo    Build Started!
echo ========================================
echo.
echo Check the build status at: https://expo.dev/accounts/YOUR_USERNAME/builds
echo.
echo Once complete, you'll receive a download link for the APK.
echo.
pause
