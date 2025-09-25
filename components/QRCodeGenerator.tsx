'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: any;
  size?: number;
  className?: string;
  onGenerated?: (dataUrl: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  size = 200,
  className = '',
  onGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const generateQR = async () => {
      try {
        const qrData = typeof data === 'string' ? data : JSON.stringify(data);
        
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        if (onGenerated && canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL();
          onGenerated(dataUrl);
        }
      } catch (error) {
        console.error('QR Code generation error:', error);
      }
    };

    generateQR();
  }, [data, size, onGenerated]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default QRCodeGenerator;
