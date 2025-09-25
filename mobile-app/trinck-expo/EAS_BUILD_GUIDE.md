# 🚀 EAS Build Guide for Trinck QR Manager

## 📱 How to Build APK with EAS (Expo Application Services)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
*If you don't have an Expo account, create one at https://expo.dev*

### Step 3: Navigate to Project
```bash
cd "f:\treavel agency website\mobile-app\trinck-expo"
```

### Step 4: Configure EAS
```bash
eas build:configure
```
*This will create/update the eas.json file*

### Step 5: Build APK
```bash
# For preview/testing APK
eas build --platform android --profile preview

# For production APK  
eas build --platform android --profile production
```

## 🎯 Quick Commands

### Build Preview APK (Recommended for testing):
```bash
eas build -p android --profile preview
```

### Build Production APK:
```bash
eas build -p android --profile production
```

### Check Build Status:
```bash
eas build:list
```

## 📋 What EAS Does:

1. **☁️ Cloud Building** - Builds your app on Expo's servers
2. **📱 Real APK** - Creates installable Android APK file
3. **🔄 Auto Updates** - Supports over-the-air updates
4. **📊 Build Tracking** - Track build progress and history
5. **🎯 Multiple Profiles** - Development, preview, production builds

## 🎨 Your App Configuration:

- **App Name:** Trinck QR Manager
- **Package:** com.trinck.qrmanager  
- **Version:** 1.0.0
- **Build Type:** APK (not AAB)
- **Target:** Android 5.1+ (API 22+)

## ⏱️ Build Time:
- **First build:** ~10-15 minutes
- **Subsequent builds:** ~5-10 minutes

## 📥 Download Your APK:

1. After build completes, you'll get a download link
2. Download the APK file
3. Install on Android device
4. Or share the link with others

## 🔧 Troubleshooting:

### If build fails:
```bash
# Check logs
eas build:list
eas build:view [BUILD_ID]

# Clear cache and retry
eas build --clear-cache -p android
```

### Common Issues:
- **Network timeout:** Retry the build
- **Dependencies:** Make sure package.json is correct
- **Permissions:** Check app.json permissions

## 🎉 Success!

Once your build completes:
1. ✅ You'll have a real Android APK
2. ✅ Installable on any Android device
3. ✅ Ready for distribution
4. ✅ Can be uploaded to Google Play Store

## 💡 Pro Tips:

- Use `preview` profile for testing
- Use `production` profile for final release  
- Keep your Expo account credentials safe
- Builds are stored in your Expo dashboard

**Your Trinck QR Manager APK will be ready in minutes!** 🚀
