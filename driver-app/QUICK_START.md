# 🚀 Quick Start Guide - Trinck Driver App

## 📱 Test the App Right Now (Without Building APK)

### Step 1: Install Expo Go on Your Phone
- **Android**: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Start the Development Server
```bash
cd driver-app
npm start
```

### Step 3: Connect Your Phone
1. Make sure your phone and computer are on the **same WiFi network**
2. Open **Expo Go** app on your phone
3. Scan the QR code shown in the terminal
4. The app will load on your phone!

### Step 4: Test Login
Use these credentials:
- **Email**: `rajesh.kumar@example.com`
- **Password**: `driver123`

---

## 🏗️ Build APK for Distribution

### Method 1: Using Expo (Easiest)
```bash
# Run this command
expo build:android -t apk

# Follow the prompts to:
# 1. Create/login to Expo account
# 2. Choose build options
# 3. Wait for build (takes 15-30 minutes)
# 4. Download APK from the link provided
```

### Method 2: Using EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build -p android --profile preview

# Download APK from the link
```

### Method 3: Local Build (Advanced)
```bash
# Eject from Expo
expo eject

# Open android folder in Android Studio
# Build > Generate Signed Bundle/APK
```

---

## ⚙️ Important Configuration

### Update API URL for Your Network

1. Find your computer's IP address:
   - Windows: Run `ipconfig` and look for IPv4 Address
   - Mac/Linux: Run `ifconfig` and look for inet address

2. Update these files:
   - `src/services/ApiService.ts`
   - `src/services/AuthService.ts`

   Change:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```
   
   To:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

---

## 🔍 Troubleshooting

### Can't connect to server?
1. Check if main website is running: `npm run dev` in main folder
2. Verify IP address is correct
3. Check firewall settings
4. Make sure phone and computer are on same network

### App crashes on launch?
1. Clear Expo cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Update Expo: `expo upgrade`

### Location not working?
1. Enable location permissions in phone settings
2. Turn on GPS/Location services
3. For Android: Allow "Always" permission for background tracking

---

## 📞 Test Features

Once logged in, test these features:

1. **Toggle Online/Offline** - Switch availability status
2. **View Stats** - Check earnings and trip count
3. **Profile** - Update driver information
4. **Location Tracking** - Goes online, location sent to server
5. **Bookings** - View booking history
6. **Earnings** - Check daily/weekly/monthly earnings

---

## 🎯 Next Steps

1. **Replace placeholder icons** in `assets/` folder
2. **Update app name** in `app.json`
3. **Configure push notifications**
4. **Set up production API URL**
5. **Test on multiple devices**
6. **Build final APK for distribution**

---

## 📝 Notes

- The app sends location updates every 10 seconds when online
- Background location tracking requires "Always Allow" permission
- Location is only visible to customers who booked the driver
- All data syncs with the main website in real-time

---

**Need Help?** Check the main README.md for detailed documentation.
