'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Smartphone, Shield, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DriverQRGeneratorProps {
  driverId: string;
  driverName: string;
}

export default function DriverQRGenerator({ driverId, driverName }: DriverQRGeneratorProps) {
  const [qrData, setQrData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/driver/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId })
      });

      const result = await response.json();
      
      if (result.success) {
        setQrData(result.qrData);
        setExpiresAt(new Date(result.expiresAt));
        toast.success('QR Code generated successfully!');
      } else {
        toast.error(result.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const svg = document.querySelector('#driver-qr-code svg');
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
        link.download = `trinck-driver-${driverName.replace(/\s+/g, '-')}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Driver Mobile App</h3>
        <p className="text-gray-300 text-sm">
          Generate QR code for {driverName} to connect their mobile device
        </p>
      </div>

      {!qrData ? (
        <div className="text-center">
          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 inline-block mr-2" />
                Generate QR Code
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-xl text-center" id="driver-qr-code">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
              className="mx-auto"
            />
            <p className="text-gray-600 text-sm mt-3 font-medium">
              Scan with Trinck Driver App
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Setup Instructions
            </h4>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-medium text-white">Visit Driver App</p>
                  <p>Go to: <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">{window.location.origin}/driver-app</code></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-medium text-white">Install App</p>
                  <p>Tap "Install App" when prompted to add to home screen</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-medium text-white">Scan QR Code</p>
                  <p>Tap "Scan QR Code" and scan the code above</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="font-medium text-white">Enable Location</p>
                  <p>Allow location permissions for live tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              App Features
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Real-time GPS location tracking
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Job notifications and management
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Privacy-controlled location sharing
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Offline capability with sync
              </li>
            </ul>
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
              onClick={generateQRCode}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              New QR Code
            </button>
          </div>

          {/* Expiry Info */}
          {expiresAt && (
            <div className="text-center text-sm text-gray-400">
              QR Code expires: {expiresAt.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
