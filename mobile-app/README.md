# Trink Driver Mobile App

A professional React Native mobile application for truck drivers built with Expo, featuring real-time GPS tracking, job management, and QR code authentication.

## Features

- **QR Code Authentication** - Secure login by scanning QR codes from the driver dashboard
- **Real-time GPS Tracking** - Live location sharing with background tracking capabilities
- **Job Management** - View, accept, and manage delivery jobs
- **Interactive Dashboard** - Performance stats, earnings tracking, and quick actions
- **Customer Verification** - QR code scanning for customer identity verification
- **Professional UI** - Modern design matching the main website theme

## Tech Stack

- **React Native** with Expo SDK 50
- **React Navigation** for screen navigation
- **Expo Location** for GPS tracking
- **Expo Notifications** for push notifications
- **React Native Maps** for interactive mapping
- **Expo Secure Store** for secure token storage
- **Expo Barcode Scanner** for QR code functionality

## Installation

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Expo Go app on your phone (for testing)

### Setup

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```
EXPO_PUBLIC_API_URL=http://your-server-url:3000
```

## Development

### Start Development Server

```bash
npm start
```

This opens the Expo development server. You can:
- Scan the QR code with Expo Go app to test on your phone
- Press `a` to open Android emulator
- Press `i` to open iOS simulator

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

## Building APK

### Install EAS CLI

```bash
npm install -g @expo/cli
```

### Configure EAS Build

1. Login to Expo:
```bash
expo login
```

2. Initialize EAS:
```bash
eas build:configure
```

3. Build APK for testing:
```bash
npm run build:apk
```

4. Build AAB for production:
```bash
npm run build:android
```

## App Structure

```
src/
├── screens/
│   ├── LoginScreen.js          # QR code authentication
│   ├── DashboardScreen.js      # Main driver dashboard
│   ├── LocationTrackingScreen.js # GPS tracking interface
│   ├── JobsScreen.js           # Job listings and management
│   └── QRScannerScreen.js      # Multi-purpose QR scanner
├── components/                 # Reusable UI components
└── utils/                      # Helper functions
```

## Key Features Explained

### QR Code Authentication
- Drivers scan QR codes generated from the web dashboard
- Secure token-based authentication
- Automatic session management

### GPS Tracking
- Real-time location updates every 5 seconds
- Background location tracking
- Route visualization with polylines
- Privacy controls (location shared only with hired customers)

### Job Management
- Real-time job listings
- Accept/decline functionality
- Job status tracking (pickup, in-transit, delivery)
- Customer contact information

### Performance Dashboard
- Daily, weekly, and monthly statistics
- Earnings tracking
- Distance and time metrics
- Online/offline status toggle

## API Integration

The app integrates with the following backend endpoints:

- `POST /api/driver/validate` - QR code authentication
- `POST /api/driver/location` - Location updates
- `GET /api/driver/dashboard/{id}` - Dashboard data
- `POST /api/driver/status` - Online/offline status
- `GET /api/driver/jobs` - Job listings
- `POST /api/driver/jobs/{id}/accept` - Accept jobs

## Permissions

The app requires the following permissions:

- **Location** - For GPS tracking and navigation
- **Camera** - For QR code scanning
- **Notifications** - For job alerts and updates
- **Background Location** - For continuous tracking

## Security

- Secure token storage using Expo Secure Store
- Session-based authentication
- Location privacy controls
- Input validation and sanitization

## Deployment

### Testing Distribution

1. Build APK:
```bash
eas build --platform android --profile preview
```

2. Download and install APK on test devices

### Production Release

1. Build AAB for Google Play:
```bash
eas build --platform android --profile production
```

2. Submit to Google Play Console:
```bash
eas submit --platform android
```

## Troubleshooting

### Common Issues

1. **Location not working**: Ensure location permissions are granted
2. **QR scanner not opening**: Check camera permissions
3. **Build failures**: Verify all dependencies are installed
4. **API connection issues**: Check EXPO_PUBLIC_API_URL in .env

### Debug Mode

Enable debug logging by setting:
```
EXPO_PUBLIC_DEBUG_MODE=true
```

## Support

For technical support or feature requests, contact the development team or check the main project documentation.

## License

This project is part of the Trink trucking platform. All rights reserved.
