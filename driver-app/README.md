# 📱 Trinck Driver App

React Native mobile app for Trinck drivers to manage bookings and share real-time location.

## 🚀 Features

- **Real-time Location Tracking**: Sends location updates to the main website
- **Online/Offline Toggle**: Control when you're available for bookings
- **Booking Management**: Accept and complete trips
- **Earnings Tracking**: View daily earnings and statistics
- **Profile Management**: Update personal and vehicle information
- **Background Location**: Continues tracking even when app is in background

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI**: `npm install -g expo-cli`
3. **EAS CLI** (for building): `npm install -g eas-cli`
4. **Android Studio** (for Android development)
5. **Expo Go app** on your phone (for testing)

## 🛠️ Installation

1. Navigate to the driver-app directory:
```bash
cd driver-app
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in the service files:
- Open `src/services/ApiService.ts`
- Open `src/services/AuthService.ts`
- Change `API_BASE_URL` to your server URL

## 🔧 Configuration

### For Local Development:
```javascript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
// Replace YOUR_LOCAL_IP with your computer's IP address
// Example: 'http://192.168.1.100:3000/api'
```

### For Production:
```javascript
const API_BASE_URL = 'https://your-domain.com/api';
```

## 📱 Running the App

### Development Mode:

1. Start the Expo development server:
```bash
npm start
```

2. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app (opens in Expo Go)

### Test Credentials:
- **Email**: rajesh.kumar@example.com
- **Password**: driver123

## 🏗️ Building APK

### Method 1: Using EAS Build (Recommended)

1. Create an Expo account:
```bash
eas login
```

2. Configure the project:
```bash
eas build:configure
```

3. Build APK:
```bash
eas build -p android --profile preview
```

4. Download the APK from the provided link

### Method 2: Local Build with Expo

1. Install expo-cli globally:
```bash
npm install -g expo-cli
```

2. Build APK locally:
```bash
expo build:android -t apk
```

3. The APK will be available for download from Expo servers

### Method 3: Using Android Studio

1. Eject from Expo (if needed):
```bash
expo eject
```

2. Open `android` folder in Android Studio

3. Build APK:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

## 📍 Location Permissions

The app requires location permissions to function properly:

- **Foreground Location**: For tracking while app is open
- **Background Location**: For continuous tracking
- **Always Allow**: Recommended for best experience

## 🔐 Security Notes

1. The app uses JWT tokens for authentication
2. Location data is only sent when driver is online
3. All API calls are authenticated
4. Sensitive data is stored securely using AsyncStorage

## 🐛 Troubleshooting

### Location not updating:
- Check location permissions in phone settings
- Ensure GPS is enabled
- Check internet connection

### Can't login:
- Verify API_BASE_URL is correct
- Check if the main server is running
- Verify credentials are correct

### Build errors:
- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Expo: `expo upgrade`

## 📱 App Structure

```
driver-app/
├── App.tsx                 # Main app component
├── src/
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── BookingsScreen.tsx
│   │   └── EarningsScreen.tsx
│   └── services/          # API and services
│       ├── ApiService.ts
│       ├── AuthService.ts
│       └── LocationService.ts
├── assets/                # Images and icons
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🚀 Deployment Checklist

- [ ] Update API_BASE_URL to production URL
- [ ] Remove test credentials from LoginScreen
- [ ] Update app.json with production details
- [ ] Generate proper app icons and splash screen
- [ ] Test on multiple devices
- [ ] Configure push notifications
- [ ] Set up crash reporting (Sentry)
- [ ] Enable production mode in app.json

## 📞 Support

For issues or questions, contact the development team.

---

**Note**: This app is designed to work with the Trinck Travel Agency website. Ensure the main server is running and properly configured before using this app.
