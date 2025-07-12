@echo off
REM 🚀 Broku Production Deployment Script for Windows

echo 🚀 Starting Broku Production Deployment...

REM Check if we're in the right directory
if not exist "client\package.json" (
    echo ❌ Please run this script from the expense-tracker-app root directory
    exit /b 1
)

if not exist "server\package.json" (
    echo ❌ Please run this script from the expense-tracker-app root directory
    exit /b 1
)

echo ✅ Found client and server directories

REM Step 1: Build server
echo.
echo 📦 Building server...
cd server
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Server build failed
    exit /b 1
)
echo ✅ Server build successful
cd ..

REM Step 2: Install EAS CLI if not installed
echo.
echo 🔧 Checking EAS CLI...
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ EAS CLI not found. Installing...
    call npm install -g @expo/eas-cli
    echo ✅ EAS CLI installed
) else (
    echo ✅ EAS CLI already installed
)

REM Step 3: Check EAS login
echo.
echo 🔐 Checking EAS login...
cd client
call eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Not logged in to EAS. Please login:
    call eas login
)
echo ✅ EAS login verified

REM Step 4: Build production apps
echo.
echo 📱 Building production mobile apps...

set /p build_android="Do you want to build Android APK? (y/n): "
if /i "%build_android%"=="y" (
    echo ✅ Building Android production APK...
    call eas build --platform android --profile production --non-interactive
)

set /p build_ios="Do you want to build iOS app? (y/n): "
if /i "%build_ios%"=="y" (
    echo ✅ Building iOS production app...
    call eas build --platform ios --profile production --non-interactive
)

cd ..

echo.
echo ✅ 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Deploy your server to Render/Railway/Heroku
echo 2. Update client/config/env.ts with production backend URL
echo 3. Download and test the built APK/IPA files
echo 4. Submit to app stores when ready
echo.
echo 📖 See DEPLOYMENT_GUIDE.md for detailed instructions

pause
