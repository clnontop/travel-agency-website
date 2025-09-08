# Google Maps Driver Location Component

This is a plain JavaScript implementation of a Google Maps component that displays driver locations across India for the Trinck trucking platform.

## Features

### 🗺️ Map Configuration
- **Centered on India**: Default center at coordinates (22.9734, 78.6569) with zoom level 5
- **India-focused styling**: Custom map styles with orange/red highways and India-themed colors
- **Regional restrictions**: Map bounds restricted to Indian subcontinent for optimal viewing
- **Responsive design**: Works on both desktop and mobile devices

### 🚛 Driver Markers
- **Real-time status indicators**: 
  - 🟢 Green markers for available drivers
  - 🔴 Red markers for busy drivers
  - ⚫ Gray markers for offline drivers
- **Interactive info windows**: Click markers to view detailed driver information
- **Sample data**: 12 realistic Indian drivers across major cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune)

### 📊 Live Statistics Panel
- Total driver count
- Available, busy, and offline driver counts
- Real-time updates with status changes

### 🎨 Modern UI/UX
- Gradient background with glassmorphism effects
- Professional header with branding
- Loading spinner during map initialization
- Mobile-responsive design
- Smooth animations and transitions

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps JavaScript API**
4. Create an API key in the Credentials section
5. Restrict the API key to your domain for security

### 2. Configure the Component
Replace `YOUR_API_KEY` in the script tag with your actual Google Maps API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&region=IN&callback=initMap" async defer></script>
```

### 3. Customize Driver Data
Update the `drivers` array with your actual driver data:

```javascript
const drivers = [
    {
        id: 1,
        lat: 28.6139,
        lng: 77.2090,
        name: "Driver Name",
        status: "available", // available, busy, offline
        vehicle: "Vehicle Model",
        phone: "+91-XXXXXXXXXX",
        rating: 4.8
    },
    // Add more drivers...
];
```

## Integration Options

### Option 1: Standalone HTML File
- Use the provided `driver-map.html` file directly
- Perfect for testing or simple implementations
- Just replace the API key and customize driver data

### Option 2: Integrate with Existing System
- Extract the JavaScript functions and integrate with your backend
- Replace the static `drivers` array with dynamic API calls
- Integrate with your existing authentication and booking system

### Option 3: Framework Integration
For React/Next.js integration, you can adapt the core functionality:

```javascript
// Example React hook for driver data
const useDriverLocations = () => {
    const [drivers, setDrivers] = useState([]);
    
    useEffect(() => {
        // Fetch drivers from your API
        fetchDrivers().then(setDrivers);
    }, []);
    
    return drivers;
};
```

## API Integration

### Real-time Updates
The component includes simulation of real-time updates. For production, replace with actual WebSocket or polling:

```javascript
// Replace simulation with real API calls
function fetchDriverUpdates() {
    fetch('/api/drivers/locations')
        .then(response => response.json())
        .then(updatedDrivers => {
            updateDriverMarkers(updatedDrivers);
            updateDriverStats();
        });
}
```

### Booking Integration
The booking functionality is currently a placeholder. Integrate with your booking API:

```javascript
function bookDriver(driverId) {
    fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, customerId: getCurrentUser().id })
    })
    .then(response => response.json())
    .then(booking => {
        showBookingConfirmation(booking);
    });
}
```

## Customization

### Map Styling
Modify the `styles` array in the map initialization to change colors and appearance:

```javascript
styles: [
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#your-color" }]
    }
    // Add more style rules...
]
```

### Marker Icons
Change marker icons by updating the `getMarkerIcon()` function:

```javascript
function getMarkerIcon(status) {
    switch(status) {
        case 'available':
            return 'path/to/your/available-icon.png';
        // Add more cases...
    }
}
```

## Security Considerations

1. **API Key Security**: Always restrict your Google Maps API key to specific domains
2. **Data Validation**: Validate all driver data before displaying on the map
3. **Rate Limiting**: Implement rate limiting for API calls to prevent abuse
4. **Authentication**: Ensure proper user authentication before showing sensitive driver information

## Performance Optimization

1. **Marker Clustering**: For large numbers of drivers, consider implementing marker clustering
2. **Lazy Loading**: Load driver data progressively as the user pans the map
3. **Caching**: Cache driver locations and update only when necessary
4. **Debouncing**: Debounce real-time updates to prevent excessive API calls

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
public/
├── driver-map.html          # Main HTML file with embedded JavaScript
└── README-driver-map.md     # This documentation file
```

## Next Steps

1. Replace `YOUR_API_KEY` with your actual Google Maps API key
2. Update the `drivers` array with real driver data from your backend
3. Integrate booking functionality with your existing system
4. Add authentication and user management
5. Implement real-time WebSocket updates for live driver tracking

## Support

For issues or questions about this implementation:
1. Check the browser console for JavaScript errors
2. Verify your Google Maps API key is correctly configured
3. Ensure the Maps JavaScript API is enabled in Google Cloud Console
4. Check network requests for API call failures

The component is designed to be easily customizable and integrable with existing trucking platforms while maintaining optimal performance and user experience.
