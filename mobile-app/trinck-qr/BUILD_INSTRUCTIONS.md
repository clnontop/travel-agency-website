# Trinck QR Manager - Build Instructions

## 📱 How to Build APK from this Mobile App

### Prerequisites
1. **Node.js** (v14 or higher)
2. **Java Development Kit (JDK)** 8 or 11
3. **Android Studio** with Android SDK
4. **Apache Cordova CLI**

### Step 1: Install Cordova CLI
```bash
npm install -g cordova
```

### Step 2: Setup Android Development Environment
1. Install **Android Studio**
2. Install **Android SDK** (API level 22-33)
3. Set environment variables:
   ```bash
   export ANDROID_HOME=/path/to/android-sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### Step 3: Navigate to Project Directory
```bash
cd "f:\treavel agency website\mobile-app\trinck-qr"
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Add Android Platform
```bash
cordova platform add android
```

### Step 6: Copy Logo to Resources
1. Copy your `logo.png` to:
   - `www/img/logo.png`
   - `www/res/icon/android/` (create different sizes)

### Step 7: Build APK
```bash
# Debug APK (for testing)
cordova build android

# Release APK (for distribution)
cordova build android --release
```

### Step 8: Find Your APK
The built APK will be located at:
- **Debug**: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Step 9: Sign Release APK (Optional)
For Google Play Store distribution:
```bash
# Generate keystore
keytool -genkey -v -keystore trinck-release-key.keystore -alias trinck -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore trinck-release-key.keystore app-release-unsigned.apk trinck

# Align APK
zipalign -v 4 app-release-unsigned.apk trinck-qr-manager.apk
```

## 🚀 Quick Build Commands

### For Development/Testing:
```bash
npm run build-android
```

### For Production:
```bash
cordova build android --release --prod
```

## 📋 Features Included in APK:
- ✅ QR Code Generation (Text, Job, Contact, WiFi)
- ✅ QR Code Scanning from Camera
- ✅ QR Code Scanning from Gallery
- ✅ Job-specific QR codes for trucking
- ✅ History tracking with local storage
- ✅ Save QR codes to device gallery
- ✅ Share QR codes via social apps
- ✅ Native mobile UI with your Trinck branding
- ✅ Offline functionality
- ✅ Hardware back button support
- ✅ Vibration feedback
- ✅ Status bar theming

## 🎨 Customization:
- App uses your **logo.png** as icon
- **Trinck** branding throughout
- **Red gradient theme** matching your website
- **Premium mobile UI** with animations

## 📱 Supported Platforms:
- **Android** 5.1+ (API 22+)
- **iOS** 11+ (requires Mac for building)

## 🔧 Troubleshooting:
1. **Gradle issues**: Update Android SDK and build tools
2. **Plugin errors**: Run `cordova clean` then rebuild
3. **Permission issues**: Check `config.xml` permissions
4. **Build failures**: Ensure all environment variables are set

## 📦 APK Size:
Expected APK size: ~8-12 MB (includes QR libraries)

Your **Trinck QR Manager** mobile app is ready to build into a real APK! 🎉
