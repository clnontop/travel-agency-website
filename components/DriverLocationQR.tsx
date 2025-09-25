'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DriverLocationQRProps {
  driverId: string;
  driverName: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export default function DriverLocationQR({ driverId, driverName, currentLocation }: DriverLocationQRProps) {
  const [qrData, setQrData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateLocationQR = async () => {
    setIsGenerating(true);
    
    try {
      // Get current location if not provided
      let location = currentLocation;
      
      if (!location && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current Location'
        };
      }

      // Generate location-based QR code
      const locationQRData = {
        type: 'driver_location',
        driverId,
        driverName,
        location: location || {
          lat: 28.6139, // Default to Delhi
          lng: 77.2090,
          address: 'Delhi, India'
        },
        timestamp: Date.now(),
        trackingId: `TRACK_${driverId}_${Date.now()}`,
        actions: {
          checkin: true,
          checkout: true,
          jobUpdate: true,
          emergencyAlert: true
        },
        validUntil: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        instructions: {
          scan: 'Scan this QR to check-in at this location',
          location: 'Location will be recorded for job tracking',
          time: 'Timestamp will be logged automatically'
        }
      };

      setQrData(JSON.stringify(locationQRData));
      setLastGenerated(new Date());
      toast.success('Location QR code generated!');
      
    } catch (error) {
      console.error('Location QR generation error:', error);
      toast.error('Failed to get location. Using default location.');
      
      // Fallback QR with default location
      const fallbackQRData = {
        type: 'driver_location',
        driverId,
        driverName,
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'Delhi, India'
        },
        timestamp: Date.now(),
        trackingId: `TRACK_${driverId}_${Date.now()}`,
        actions: {
          checkin: true,
          checkout: true,
          jobUpdate: true,
          emergencyAlert: true
        },
        validUntil: Date.now() + (24 * 60 * 60 * 1000),
        instructions: {
          scan: 'Scan this QR to check-in at this location',
          location: 'Location will be recorded for job tracking',
          time: 'Timestamp will be logged automatically'
        }
      };
      
      setQrData(JSON.stringify(fallbackQRData));
      setLastGenerated(new Date());
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const svg = document.querySelector('#location-qr-code svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
        
        const link = document.createElement('a');
        link.download = `${driverName.replace(/\s+/g, '-')}-location-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Auto-generate on mount
  useEffect(() => {
    generateLocationQR();
  }, [driverId]);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Location Check-in QR</h3>
        <p className="text-gray-300 text-sm">
          QR code for {driverName} to check-in at current location
        </p>
      </div>

      {qrData ? (
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-xl text-center" id="location-qr-code">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
              className="mx-auto"
            />
            <p className="text-gray-600 text-sm mt-3 font-medium">
              Scan to Check-in at Location
            </p>
          </div>

          {/* Location Info */}
          {currentLocation && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-400" />
                Current Location
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-white">Address:</span> {currentLocation.address || 'Unknown'}</p>
                <p><span className="text-white">Coordinates:</span> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
              </div>
            </div>
          )}

          {/* QR Features */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              QR Code Features
            </h4>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Location check-in/check-out tracking
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Job status updates with GPS coordinates
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Automatic timestamp logging
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Emergency alert capability
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={downloadQR}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download QR
            </button>
            
            <button
              onClick={generateLocationQR}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Updating...' : 'Refresh QR'}
            </button>
          </div>

          {/* Last Generated */}
          {lastGenerated && (
            <div className="text-center text-sm text-gray-400">
              Last updated: {lastGenerated.toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={generateLocationQR}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 inline-block mr-2" />
                Generate Location QR
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
