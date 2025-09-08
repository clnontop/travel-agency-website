'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDrivers, Driver } from '@/store/useDrivers';

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
            🚛 ${driver.name}
          </h3>
          <div style="margin: 5px 0;">
            <strong>Status:</strong> 
            <span style="color: #10b981; font-weight: bold;">AVAILABLE</span>
          </div>
          <div style="margin: 5px 0;">
            <strong>Vehicle:</strong> ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}
          </div>
          <div style="margin: 5px 0;">
            <strong>Rating:</strong> ⭐ ${driver.rating.toFixed(1)}/5.0
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

    updateDriverStats();
  };

  // Update driver statistics
  const updateDriverStats = () => {
    const availableDrivers = getAvailableDrivers().filter(driver => driver.isOnline);
    const driverCountElement = document.getElementById('availableDriverCount');
    if (driverCountElement) {
      driverCountElement.textContent = availableDrivers.length.toString();
    }
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
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          margin: 0
        }}>🚛 Available Drivers in India</h1>
        <p style={{
          opacity: 0.9,
          fontSize: '1.1rem',
          margin: '0.5rem 0 0 0'
        }}>Find drivers ready for work - Real-time availability</p>
      </div>

      {/* Driver Stats Panel */}
      <div style={{
        position: 'absolute',
        top: '140px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          Available Drivers: <span id="availableDriverCount" style={{ color: '#10b981' }}>0</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '0.3rem 0',
          fontSize: '0.9rem'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            marginRight: '8px'
          }}></div>
          <span>Ready for work</span>
        </div>
      </div>

      {/* Map Container */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - 120px)',
        margin: '1rem',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 2000
          }}>
            <div style={{
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading available drivers...</p>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
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
