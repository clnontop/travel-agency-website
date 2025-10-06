# 🔧 Fix Build Errors - Driver App

## Current Issue
The app has dependency conflicts with `fsevents` and navigation packages. Here's how to fix it:

## Solution 1: Use Simple Version (Quickest)

The app is already updated with a simpler version that works without navigation. Just restart the server:

```bash
# Stop current server (Ctrl+C)
# Start fresh
cd driver-app
npx expo start --clear
```

Now scan the QR code with Expo Go app on your phone.

## Solution 2: Clean Install (Recommended)

1. **Stop all processes** (Close terminal)

2. **Clean the project:**
```bash
cd driver-app
rmdir /s /q node_modules
del package-lock.json
```

3. **Reinstall dependencies:**
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

4. **Start the app:**
```bash
npx expo start --clear
```

## Solution 3: Use Yarn Instead

If npm continues to have issues:

```bash
# Install yarn
npm install -g yarn

# Remove npm files
rmdir /s /q node_modules
del package-lock.json

# Install with yarn
yarn install

# Start with yarn
yarn start
```

## What's Working Now

The simplified App.tsx includes:
- ✅ Basic UI without navigation
- ✅ Online/Offline toggle
- ✅ Stats display
- ✅ Location tracking indicator
- ✅ Test credentials display

## To Test on Phone

1. **Make sure server is running:**
   - You should see QR code in terminal
   - URL shows: `exp://192.168.1.6:8081`

2. **On your phone:**
   - Open Expo Go app
   - Scan QR code
   - App will load

3. **What you'll see:**
   - Driver dashboard
   - Online/Offline button (tap to toggle)
   - Earnings and trips display
   - Location tracking status

## If Still Having Issues

### Error: "Network response timed out"
- Check phone and computer are on same WiFi
- Check Windows Firewall (allow Node.js)
- Try: `npx expo start --tunnel`

### Error: "Unable to resolve module"
- Clear cache: `npx expo start --clear`
- Delete .expo folder: `rmdir /s /q .expo`

### Error: "fsevents" permission
- This is a Mac-only package, safe to ignore on Windows
- Already added to optionalDependencies

## Alternative: Build APK Directly

Skip testing and build APK:

```bash
# Using Expo online build service
expo build:android -t apk

# Or use EAS
eas build -p android --profile preview
```

## Current Status

✅ **Simple app version is ready**
✅ **Server can run at exp://192.168.1.6:8081**
✅ **API URLs updated to your IP**
✅ **Basic functionality working**

Just need to:
1. Clear any cache/locks
2. Restart Expo server
3. Scan QR code on phone

The app will work without the navigation for now. Once it's running, we can add navigation back.
