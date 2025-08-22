'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import LoadingButton from '@/components/LoadingButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function LoadingDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [buttonStates, setButtonStates] = useState({
    loading: false,
    success: false,
    error: false
  });
  const [progress, setProgress] = useState(0);

  const loadingVariants = [
    { key: 'default', name: 'Default', color: 'red' as const },
    { key: 'truck', name: 'Truck Animation', color: 'red' as const },
    { key: 'pulse', name: 'Pulse Effect', color: 'blue' as const },
    { key: 'orbit', name: 'Orbiting Elements', color: 'purple' as const },
    { key: 'wave', name: 'Wave Bars', color: 'green' as const },
    { key: 'progress', name: 'Progress Bar', color: 'gold' as const }
  ];

  const spinnerVariants = [
    'spinner', 'dots', 'bars', 'pulse', 'bounce', 'truck', 'orbit'
  ];

  const colors = ['red', 'blue', 'green', 'purple', 'gold'] as const;

  const showDemo = (variant: string, color: string) => {
    setActiveDemo(`${variant}-${color}`);
    if (variant === 'progress') {
      // Simulate progress
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setActiveDemo(null), 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } else {
      setTimeout(() => setActiveDemo(null), 3000);
    }
  };

  const testButton = (type: 'loading' | 'success' | 'error') => {
    setButtonStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Active Demo Overlay */}
      {activeDemo && (
        <LoadingScreen
          variant={activeDemo.split('-')[0] as any}
          color={activeDemo.split('-')[1] as any}
          message="Demo Loading Screen"
          showProgress={activeDemo.includes('progress')}
          progress={progress}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 text-shimmer">
            Custom Loading Components Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Explore different loading screen variants, buttons, and spinners
          </p>
        </motion.div>

        {/* Loading Screen Variants */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Full Screen Loading Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingVariants.map((variant, index) => (
              <motion.div
                key={variant.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">{variant.name}</h3>
                <div className="mb-4">
                  <LoadingScreen
                    variant={variant.key as any}
                    color={variant.color}
                    fullScreen={false}
                    message="Preview"
                    showProgress={variant.key === 'progress'}
                    progress={65}
                  />
                </div>
                <button
                  onClick={() => showDemo(variant.key, variant.color)}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Demo Full Screen</span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Loading Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Loading Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Primary Buttons</h3>
              <div className="space-y-4">
                <LoadingButton
                  loading={buttonStates.loading}
                  onClick={() => testButton('loading')}
                  variant="primary"
                >
                  Test Loading
                </LoadingButton>
                <LoadingButton
                  success={buttonStates.success}
                  onClick={() => testButton('success')}
                  variant="primary"
                >
                  Test Success
                </LoadingButton>
                <LoadingButton
                  error={buttonStates.error}
                  onClick={() => testButton('error')}
                  variant="primary"
                >
                  Test Error
                </LoadingButton>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Secondary Buttons</h3>
              <div className="space-y-4">
                <LoadingButton variant="secondary" size="sm">
                  Small Button
                </LoadingButton>
                <LoadingButton variant="secondary" size="md">
                  Medium Button
                </LoadingButton>
                <LoadingButton variant="secondary" size="lg">
                  Large Button
                </LoadingButton>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Outline Buttons</h3>
              <div className="space-y-4">
                <LoadingButton variant="outline">
                  Outline Default
                </LoadingButton>
                <LoadingButton variant="outline" disabled>
                  Disabled State
                </LoadingButton>
                <LoadingButton variant="outline" loading>
                  Loading State
                </LoadingButton>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Loading Spinners */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Loading Spinners</h2>
          
          {/* Spinner Variants */}
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6">Spinner Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
              {spinnerVariants.map((variant) => (
                <div key={variant} className="text-center">
                  <div className="mb-3 flex justify-center">
                    <LoadingSpinner variant={variant as any} size="lg" color="red" />
                  </div>
                  <p className="text-sm text-gray-300 capitalize">{variant}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Color Variants */}
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6">Color Variants</h3>
            <div className="flex justify-center space-x-8">
              {colors.map((color) => (
                <div key={color} className="text-center">
                  <div className="mb-3">
                    <LoadingSpinner variant="spinner" size="lg" color={color} />
                  </div>
                  <p className="text-sm text-gray-300 capitalize">{color}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Size Variants */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Size Variants</h3>
            <div className="flex justify-center items-end space-x-8">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <div key={size} className="text-center">
                  <div className="mb-3 flex justify-center items-center h-16">
                    <LoadingSpinner variant="truck" size={size} color="red" />
                  </div>
                  <p className="text-sm text-gray-300 uppercase">{size}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Usage Examples */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Usage Examples</h2>
          <div className="card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Code Examples</h3>
                <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 font-mono">
                  <div className="mb-4">
                    <div className="text-green-400">// Full Screen Loading</div>
                    <div>&lt;LoadingScreen</div>
                    <div className="ml-4">variant="truck"</div>
                    <div className="ml-4">color="red"</div>
                    <div className="ml-4">message="Loading..."</div>
                    <div>/&gt;</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-green-400">// Loading Button</div>
                    <div>&lt;LoadingButton</div>
                    <div className="ml-4">loading={`{isLoading}`}</div>
                    <div className="ml-4">variant="primary"</div>
                    <div>&gt;</div>
                    <div className="ml-4">Submit</div>
                    <div>&lt;/LoadingButton&gt;</div>
                  </div>
                  <div>
                    <div className="text-green-400">// Loading Spinner</div>
                    <div>&lt;LoadingSpinner</div>
                    <div className="ml-4">variant="orbit"</div>
                    <div className="ml-4">size="md"</div>
                    <div className="ml-4">color="blue"</div>
                    <div>/&gt;</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Live Examples</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Form Submission</span>
                    <LoadingButton variant="primary" size="sm">
                      Submit Form
                    </LoadingButton>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Data Loading</span>
                    <LoadingSpinner variant="dots" color="blue" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">File Upload</span>
                    <LoadingSpinner variant="bars" color="green" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">Processing</span>
                    <LoadingSpinner variant="pulse" color="purple" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={() => {
              setActiveDemo(null);
              setButtonStates({ loading: false, success: false, error: false });
              setProgress(0);
            }}
            className="btn-secondary flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset All Demos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
