# Complete Mobile App Development Prompt for Trink Driver App

## Project Overview
Create a professional React Native mobile application for truck drivers using Expo. This app should integrate with an existing trucking platform website and provide real-time GPS tracking, job management, and QR code authentication.

## Core Requirements

### 1. Technology Stack
- **Framework**: React Native with Expo SDK 50+
- **Navigation**: React Navigation 6+ with Stack Navigator
- **State Management**: React hooks and context (or Zustand if preferred)
- **Maps**: React Native Maps with Google Maps integration
- **Authentication**: QR code scanning with secure token storage
- **Storage**: Expo Secure Store for sensitive data
- **Notifications**: Expo Notifications for push alerts
- **Location**: Expo Location with background tracking
- **Camera**: Expo Barcode Scanner for QR codes

### 2. App Structure & Screens

#### Authentication Flow
- **LoginScreen**: QR code scanner for driver authentication
  - Camera permission handling
  - QR code validation and parsing
  - Secure token storage
  - Error handling for invalid codes
  - Professional loading states

#### Main App Flow (After Authentication)
- **DashboardScreen**: Driver home screen with:
  - Online/offline status toggle
  - Today's performance stats (jobs, earnings, distance, hours)
  - Quick action buttons (Start Tracking, View Jobs, Scan QR, Support)
  - Recent job history
  - Driver information display
  - Logout functionality

- **LocationTrackingScreen**: Real-time GPS tracking with:
  - Interactive map with current location
  - Route path visualization with polylines
  - Live statistics (distance, duration, average speed)
  - Start/stop tracking toggle
  - Emergency contact button
  - Job-specific tracking when active

- **JobsScreen**: Job management interface with:
  - Filterable job list (Available, Accepted, Completed)
  - Job cards with pickup/delivery locations
  - Payment information and job details
  - Accept/decline functionality
  - Customer contact options
  - Job status tracking

- **QRScannerScreen**: Multi-purpose QR scanner for:
  - Job action confirmations (pickup complete, delivery start, etc.)
  - Customer identity verification
  - Location check-ins
  - Professional scanning interface with frame overlay

### 3. Design Requirements

#### Visual Design
- **Color Scheme**: 
  - Primary: Red gradient (#dc2626 to #b91c1c)
  - Background: Dark theme (#1f2937, #374151)
  - Text: White (#fff) and gray (#9ca3af, #d1d5db)
- **Typography**: Clean, professional fonts with good readability
- **UI Components**: 
  - Glass morphism effects with backdrop blur
  - Gradient buttons and cards
  - Modern icons (use Lucide React or similar)
  - Smooth animations and transitions

#### UX Patterns
- **Navigation**: Stack-based with clear back buttons
- **Loading States**: Professional spinners and skeleton screens
- **Error Handling**: User-friendly error messages with retry options
- **Accessibility**: Proper contrast ratios and touch targets
- **Responsive**: Works on various Android screen sizes

### 4. Core Features Implementation

#### GPS Tracking System
```javascript
// Key requirements:
- Real-time location updates every 5-10 seconds
- Background location tracking with proper permissions
- Route path recording and visualization
- Distance and speed calculations using Haversine formula
- Privacy controls (location shared only with active customers)
- Battery optimization considerations
```

#### QR Code Authentication
```javascript
// Authentication flow:
1. Scan QR code from driver web dashboard
2. Parse JSON data: { type: "driver_auth", sessionToken: "...", driverId: "..." }
3. Validate with backend API
4. Store secure session token
5. Navigate to dashboard on success
```

#### Job Management
```javascript
// Job data structure:
{
  id: "JOB001",
  pickup: "Mumbai Central",
  delivery: "Pune Station", 
  distance: "148 km",
  payment: 2500,
  customerName: "Rajesh Kumar",
  customerPhone: "+91-9876543210",
  status: "available|accepted|in_progress|completed",
  pickupTime: "2024-01-15 10:00 AM",
  cargoType: "Electronics",
  weight: "500 kg"
}
```

### 5. API Integration

#### Required Endpoints
```javascript
// Authentication
POST /api/driver/validate
Body: { sessionToken, driverId, deviceInfo }

// Location Updates  
POST /api/driver/location
Body: { driverId, latitude, longitude, timestamp, activeJobs }

// Dashboard Data
GET /api/driver/dashboard/{driverId}
Response: { stats, recentJobs, performanceMetrics }

// Status Management
POST /api/driver/status  
Body: { driverId, isOnline, location }

// Job Operations
GET /api/driver/jobs?status=available
POST /api/driver/jobs/{jobId}/accept
POST /api/driver/qr/job (for QR-based job actions)

// Customer Verification
POST /api/driver/verify-customer
Body: { customerId, customerName, phone, driverId }
```

### 6. Permissions & Security

#### Required Permissions
- **Location**: Fine location, coarse location, background location
- **Camera**: For QR code scanning
- **Notifications**: For job alerts and updates
- **Network**: For API communication

#### Security Measures
- Secure token storage using Expo Secure Store
- Input validation and sanitization
- API request authentication
- Session management and automatic logout
- Privacy controls for location sharing

### 7. Configuration Files

#### package.json Dependencies
```json
{
  "expo": "~50.0.0",
  "react": "18.2.0", 
  "react-native": "0.73.6",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "react-native-screens": "~3.29.0",
  "react-native-safe-area-context": "4.8.2",
  "react-native-gesture-handler": "~2.14.0",
  "expo-location": "~16.5.5",
  "expo-notifications": "~0.27.6", 
  "expo-secure-store": "~12.8.1",
  "expo-barcode-scanner": "~12.9.3",
  "expo-linear-gradient": "~12.7.2",
  "react-native-maps": "1.10.0",
  "expo-constants": "~15.4.6",
  "expo-status-bar": "~1.11.1"
}
```

#### app.json Configuration
```json
{
  "expo": {
    "name": "Trink Driver",
    "slug": "trink-driver-app", 
    "version": "1.0.0",
    "android": {
      "package": "com.trink.driverapp",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION", 
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA"
      ]
    },
    "plugins": [
      ["expo-location", {
        "locationAlwaysAndWhenInUsePermission": "Allow Trink Driver to track deliveries and provide real-time updates.",
        "isAndroidBackgroundLocationEnabled": true
      }]
    ]
  }
}
```

### 8. Key Implementation Details

#### State Management Pattern
```javascript
// Use React Context or Zustand for:
- Authentication state (user, token, isAuthenticated)
- Location state (currentLocation, isTracking, routePath)
- Job state (availableJobs, activeJobs, jobHistory)
- App state (isOnline, notifications, settings)
```

#### Error Handling Strategy
- Network connectivity checks
- Graceful API failure handling
- User-friendly error messages
- Retry mechanisms for critical operations
- Offline mode considerations

#### Performance Optimizations
- Efficient location update intervals
- Memory management for route paths
- Image optimization and lazy loading
- Background task optimization
- Battery usage minimization

### 9. Testing & Deployment

#### Development Testing
- Use Expo Go app for rapid testing
- Test on multiple Android devices/screen sizes
- Verify all permissions work correctly
- Test offline scenarios

#### Build Configuration
```json
// eas.json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" }
    }
  }
}
```

### 10. Additional Features (Nice to Have)
- Push notifications for new jobs
- Offline job caching
- Route optimization suggestions
- Driver performance analytics
- Multi-language support
- Dark/light theme toggle
- Voice navigation integration

## Success Criteria
1. **Functional**: All core features work reliably
2. **Performance**: Smooth 60fps animations, fast load times
3. **Security**: Proper authentication and data protection
4. **UX**: Intuitive interface that drivers can use while working
5. **Reliability**: Handles network issues and edge cases gracefully
6. **Professional**: Polished UI that matches the main website's quality

## Deliverables
1. Complete React Native app with all screens
2. Proper navigation and state management
3. API integration with error handling
4. Build configuration for APK generation
5. Documentation and setup instructions
6. Testing on real devices

This prompt should provide any AI assistant with comprehensive requirements to build a professional-grade mobile app for your trucking platform.