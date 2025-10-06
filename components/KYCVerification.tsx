'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  User,
  Shield,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface KYCVerificationProps {
  userId: string;
  userType: 'customer' | 'driver';
  onComplete?: () => void;
}

export default function KYCVerification({ userId, userType, onComplete }: KYCVerificationProps) {
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState<'AADHAAR' | 'PAN' | 'DRIVING_LICENSE'>('AADHAAR');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  const documentInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'selfie') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'document') {
        setDocumentImage(base64String);
      } else {
        setSelfieImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // Validate document number format
  const validateDocumentNumber = (): boolean => {
    let regex: RegExp;
    
    switch (documentType) {
      case 'AADHAAR':
        regex = /^[2-9]{1}[0-9]{11}$/;
        if (!regex.test(documentNumber)) {
          toast.error('Invalid Aadhaar number format (12 digits)');
          return false;
        }
        break;
      case 'PAN':
        regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!regex.test(documentNumber.toUpperCase())) {
          toast.error('Invalid PAN format (e.g., ABCDE1234F)');
          return false;
        }
        break;
      case 'DRIVING_LICENSE':
        regex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
        if (!regex.test(documentNumber.toUpperCase())) {
          toast.error('Invalid DL format (e.g., MH0120170012345)');
          return false;
        }
        break;
    }
    
    return true;
  };

  // Submit verification
  const handleSubmit = async () => {
    if (!validateDocumentNumber()) return;
    
    if (!documentImage) {
      toast.error('Please upload document image');
      return;
    }
    
    if (!selfieImage) {
      toast.error('Please upload your selfie');
      return;
    }

    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber.toUpperCase());
      formData.append('documentImage', documentImage);
      formData.append('selfieImage', selfieImage);

      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus('success');
        toast.success('KYC verification successful!');
        if (onComplete) {
          setTimeout(onComplete, 2000);
        }
      } else {
        setVerificationStatus('failed');
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('failed');
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">KYC Verification</h2>
          <p className="text-gray-400">
            {userType === 'driver' 
              ? 'Complete verification to start accepting rides'
              : 'Verify your identity for a secure experience'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`} />
          <div className={`flex-1 h-2 rounded-full mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`} />
        </div>

        {/* Step 1: Choose Document Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Select Document Type</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setDocumentType('AADHAAR');
                  setStep(2);
                }}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-500 mr-4" />
                  <div>
                    <p className="text-white font-medium">Aadhaar Card</p>
                    <p className="text-gray-400 text-sm">12-digit unique identification number</p>
                  </div>
                </div>
              </button>

              {userType === 'driver' && (
                <button
                  onClick={() => {
                    setDocumentType('DRIVING_LICENSE');
                    setStep(2);
                  }}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-500 mr-4" />
                    <div>
                      <p className="text-white font-medium">Driving License</p>
                      <p className="text-gray-400 text-sm">Valid Indian driving license</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setDocumentType('PAN');
                  setStep(2);
                }}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-yellow-500 mr-4" />
                  <div>
                    <p className="text-white font-medium">PAN Card</p>
                    <p className="text-gray-400 text-sm">Permanent Account Number</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Enter Details & Upload Document */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Upload {documentType} Details</h3>
            
            <div className="space-y-6">
              {/* Document Number */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {documentType} Number
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={
                    documentType === 'AADHAAR' ? 'Enter 12-digit Aadhaar number' :
                    documentType === 'PAN' ? 'Enter PAN (e.g., ABCDE1234F)' :
                    'Enter DL number (e.g., MH0120170012345)'
                  }
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={documentType === 'AADHAAR' ? 12 : documentType === 'PAN' ? 10 : 16}
                />
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Upload {documentType} Image
                </label>
                <div 
                  onClick={() => documentInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all"
                >
                  {documentImage ? (
                    <div>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-white">Document uploaded</p>
                      <p className="text-gray-400 text-sm mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-white">Click to upload document</p>
                      <p className="text-gray-400 text-sm mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'document')}
                  className="hidden"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!documentNumber) {
                      toast.error('Please enter document number');
                      return;
                    }
                    if (!documentImage) {
                      toast.error('Please upload document image');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Take Selfie */}
        {step === 3 && !isVerifying && verificationStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Verify Your Identity</h3>
            <p className="text-gray-400 mb-6">
              Please upload a clear selfie for identity verification
            </p>
            
            <div className="space-y-6">
              {/* Selfie Upload */}
              <div>
                <div 
                  onClick={() => selfieInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all"
                >
                  {selfieImage ? (
                    <div>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-white">Selfie uploaded</p>
                      <p className="text-gray-400 text-sm mt-1">Click to retake</p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-white">Click to take selfie</p>
                      <p className="text-gray-400 text-sm mt-1">Make sure your face is clearly visible</p>
                    </div>
                  )}
                </div>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                  className="hidden"
                />
              </div>

              {/* Guidelines */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Guidelines:</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Face should be clearly visible</li>
                  <li>• Good lighting, no shadows on face</li>
                  <li>• No sunglasses or face coverings</li>
                  <li>• Look directly at the camera</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selfieImage}
                  className={`flex-1 py-3 rounded-lg transition-all ${
                    selfieImage 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Verify Now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verifying */}
        {isVerifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Verifying Your Documents</h3>
            <p className="text-gray-400">This may take a few moments...</p>
          </motion.div>
        )}

        {/* Verification Result */}
        {!isVerifying && verificationStatus !== 'pending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            {verificationStatus === 'success' ? (
              <>
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Verification Successful!</h3>
                <p className="text-gray-400">Your KYC verification is complete</p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Verification Failed</h3>
                <p className="text-gray-400 mb-6">Please check your details and try again</p>
                <button
                  onClick={() => {
                    setStep(1);
                    setVerificationStatus('pending');
                    setDocumentImage(null);
                    setSelfieImage(null);
                    setDocumentNumber('');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Try Again
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Test Numbers Info (for demo) */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Test Aadhaar Numbers (for demo):</strong><br />
          234567890123, 345678901234, 456789012345, 567890123456
        </p>
      </div>
    </div>
  );
}
