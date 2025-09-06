# Google Maps Setup Instructions

## Overview
The driver location map feature requires a Google Maps API key to function properly. Follow these steps to set up Google Maps integration.

## Step 1: Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced location features)
4. Go to "Credentials" and create a new API key
5. Restrict the API key to your domain for security

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory of your project and add:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Important:** 
- The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js
- Never commit your actual API key to version control
- Keep your API key secure and restrict it to your domain

## Step 3: API Key Restrictions (Recommended)

For security, restrict your API key in the Google Cloud Console:

1. Go to your API key settings
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain(s):
   - `localhost:3000` (for development)
   - `your-production-domain.com` (for production)

## Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `/customer/driver-map`
3. You should see a map with driver locations marked

## Features Included

### Driver Map Component (`/components/DriverMap.tsx`)
- Interactive Google Maps with custom styling
- Driver markers with color-coded availability status:
  - 🟢 Green: Available drivers
  - 🔴 Red: Busy drivers  
  - ⚫ Gray: Offline drivers
- Filter panel to show all/available/online drivers
- Click markers to view driver details
- Real-time driver statistics

### Driver Map Page (`/customer/driver-map`)
- Full-screen map interface
- Driver contact modal with detailed information
- Navigation integration with other customer features
- Responsive design for mobile and desktop

### Driver Data Integration
- Uses existing driver store (`/store/useDrivers.ts`)
- Real-time availability status
- Driver ratings, completed jobs, and vehicle information
- Premium driver indicators

## City Coordinates

The implementation includes coordinates for major Indian cities:
- Delhi, Mumbai, Bangalore, Pune
- Chennai, Hyderabad, Kolkata, Ahmedabad
- Jaipur, Lucknow

You can extend this by:
1. Adding more cities to the `cityCoordinates` object in `DriverMap.tsx`
2. Implementing geocoding API for dynamic location resolution
3. Adding GPS tracking for real-time driver positions

## Troubleshooting

### Map Not Loading
- Check that your API key is correctly set in `.env.local`
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for API key errors

### Markers Not Appearing
- Verify driver data has valid location strings
- Check that locations match entries in `cityCoordinates`
- Ensure drivers have proper availability status

### API Key Errors
- Confirm API key restrictions allow your domain
- Check that billing is enabled for your Google Cloud project
- Verify the API key has necessary permissions

## Cost Considerations

Google Maps API usage is billed based on:
- Map loads
- API requests
- Additional features used

Monitor your usage in the Google Cloud Console and set up billing alerts to avoid unexpected charges.

## Next Steps

Consider implementing:
1. Real-time GPS tracking for drivers
2. Route optimization and directions
3. Geofencing for delivery areas
4. Advanced search and filtering options
