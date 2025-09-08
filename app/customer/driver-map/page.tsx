'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDrivers, Driver } from '@/store/useDrivers';
import Link from 'next/link';
import { ArrowLeft, MapPin, Users, Truck } from 'lucide-react';

// Enhanced coordinates for Indian cities with precise locations
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'Delhi, India': { lat: 28.6139, lng: 77.2090 },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946 },
  'Pune, India': { lat: 18.5204, lng: 73.8567 },
  'Chennai, India': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad, India': { lat: 17.3850, lng: 78.4867 },
  'Kolkata, India': { lat: 22.5726, lng: 88.3639 },
  'Ahmedabad, India': { lat: 23.0225, lng: 72.5714 },
  'Jaipur, India': { lat: 26.9124, lng: 75.7873 },
  'Lucknow, India': { lat: 26.8467, lng: 80.9462 },
  'Gurgaon, India': { lat: 28.4595, lng: 77.0266 },
  'Noida, India': { lat: 28.5355, lng: 77.3910 },
  'Navi Mumbai, India': { lat: 19.0330, lng: 73.0297 },
  'Electronic City, Bangalore': { lat: 12.8456, lng: 77.6603 },
  'Whitefield, Bangalore': { lat: 12.9698, lng: 77.7500 }
};

export default function DriverMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  
  const { drivers, getAvailableDrivers } = useDrivers();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get available drivers count
  const availableDrivers = getAvailableDrivers();
  const availableDriversCount = availableDrivers.length;

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuKI3s7gyePo3-IZfscnKpYzkTJOyT1K4&region=IN&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        (window as any).initMap = () => {
          if (mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
              center: { lat: 22.9734, lng: 78.6569 }, // Center of India
              zoom: 5,
              styles: [
                {
                  "featureType": "administrative.country",
                  "elementType": "geometry.stroke",
                  "stylers": [{ "color": "#ff6b35" }, { "weight": 2 }]
                },
                {
                  "featureType": "administrative.province",
                  "elementType": "geometry.stroke",
                  "stylers": [{ "color": "#ff8c42" }, { "weight": 1 }]
                },
                {
                  "featureType": "road.highway",
                  "elementType": "geometry",
                  "stylers": [{ "color": "#ff6b35" }]
                },
                {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": [{ "color": "#4285f4" }]
                }
              ],
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
              restriction: {
                latLngBounds: {
                  north: 37.6,
                  south: 6.4,
                  west: 68.1,
                  east: 97.25
                },
                strictBounds: false
              }
            });

            mapInstanceRef.current = map;
            setIsLoaded(true);
            setIsLoading(false);
            addDriverMarkers();
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Add markers for available drivers only
  const addDriverMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    infoWindowsRef.current = [];

    // Get only available drivers (free for work)
    const availableDrivers = getAvailableDrivers().filter(driver => driver.isOnline);

    availableDrivers.forEach(driver => {
      const coordinates = cityCoordinates[driver.location];
      if (!coordinates) return;

      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: `${driver.name} - AVAILABLE`,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        animation: google.maps.Animation.DROP
      });

      const infoContent = `
        <div style="padding: 10px; max-width: 250px; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: bold;">
            ${driver.name}
          </h3>
          <div style="margin: 5px 0;">
            <strong>Status:</strong> 
            <span style="color: #10b981; font-weight: bold;">AVAILABLE</span>
          </div>
          <div style="margin: 5px 0;">
            <strong>Vehicle:</strong> ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}
          </div>
          <div style="margin: 5px 0;">
            <strong>Rating:</strong> ${driver.rating.toFixed(1)}/5.0
          </div>
          <div style="margin: 5px 0;">
            <strong>Contact:</strong> ${driver.phone}
          </div>
          <div style="margin: 5px 0;">
            <strong>Location:</strong> ${driver.location}
          </div>
          <div style="margin: 5px 0;">
            <strong>Capacity:</strong> ${driver.vehicleDetails?.capacity}
          </div>
          <button onclick="bookDriver('${driver.id}')" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px; width: 100%;">Book Now</button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });

      marker.addListener('click', () => {
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });
  };

  // Global booking function
  useEffect(() => {
    (window as any).bookDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        alert(`Booking request sent to ${driver.name}!\n\nDriver will contact you at your registered number shortly.\n\nVehicle: ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}\nPhone: ${driver.phone}`);
        console.log('Booking driver:', driver);
      }
    };
  }, [drivers]);

  // Update markers when drivers change
  useEffect(() => {
    if (isLoaded) {
      addDriverMarkers();
    }
  }, [drivers, isLoaded]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)' }}>
      {/* Navigation Header */}
      <nav className="premium-glass border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link 
              href="/customer" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-white font-semibold">Driver Map</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="glass-effect px-4 py-2 rounded-lg border border-red-500/30">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Live:</span>
                <span className="text-gradient font-bold">{availableDriversCount}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Header */}
      <div className="premium-glass border-b border-gray-700/50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-3 flex items-center space-x-3">
                <Truck className="w-10 h-10 text-red-500" />
                <span>Available Drivers</span>
              </h1>
              <p className="text-gray-300 text-lg">Find and book premium drivers across India</p>
            </div>
            <div className="glass-effect px-8 py-6 rounded-xl border border-red-500/30 hover-lift">
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">{availableDriversCount}</div>
                <div className="text-sm text-gray-300">Drivers Online</div>
                <div className="flex items-center justify-center mt-2 space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Panel */}
      <div className="absolute top-6 right-12 premium-glass rounded-xl p-6 min-w-[280px] border border-red-500/20 hover-lift z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mr-3">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-gradient font-bold text-lg">Live Statistics</h3>
        </div>
        
        <div className="space-y-4">
          <div className="glass-effect p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-200 font-medium">Available Now</span>
              </div>
              <span className="text-gradient font-bold text-2xl">{availableDriversCount}</span>
            </div>
            <div className="mt-2 text-xs text-green-400">
              ✓ Ready for booking
            </div>
          </div>
          
          <div className="glass-effect p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Coverage</span>
              <span className="text-white font-semibold">All India</span>
            </div>
          </div>
          
          <div className="glass-effect p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Response Time</span>
              <span className="text-green-400 font-semibold">&lt; 5 min</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-600/50 text-center">
          <p className="text-gray-400 text-xs">
            🚛 Premium verified drivers
          </p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live tracking enabled</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-[calc(100vh-240px)] rounded-t-2xl overflow-hidden mx-6 mb-6"
          style={{ minHeight: '600px' }}
        />
        
        {!isLoaded && (
          <div className="absolute inset-6 premium-glass flex items-center justify-center rounded-t-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500/30 border-t-red-500 mx-auto mb-6"></div>
              <p className="text-gray-300 text-lg">Loading driver locations...</p>
              <div className="mt-2 text-sm text-gray-400">Connecting to premium network</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
