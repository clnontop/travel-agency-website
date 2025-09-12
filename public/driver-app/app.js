class DriverApp {
    constructor() {
        this.driverId = null;
        this.isConnected = false;
        this.locationWatchId = null;
        this.currentLocation = null;
        this.socket = null;
        this.activeJobs = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkInstallPrompt();
        this.loadStoredConnection();
        this.setupLocationTracking();
    }

    setupEventListeners() {
        // QR Scanner
        document.getElementById('qr-scan-btn').addEventListener('click', () => {
            this.startQRScanner();
        });

        document.getElementById('close-scanner').addEventListener('click', () => {
            this.stopQRScanner();
        });

        // Location tracking
        document.getElementById('location-btn').addEventListener('click', () => {
            this.requestLocationPermission();
        });

        // Install app
        document.getElementById('install-btn').addEventListener('click', () => {
            this.installApp();
        });
    }

    checkInstallPrompt() {
        // Check if app can be installed
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('install-prompt').classList.remove('hidden');
        });

        // Handle install
        this.installApp = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    document.getElementById('install-prompt').classList.add('hidden');
                }
                deferredPrompt = null;
            }
        };
    }

    loadStoredConnection() {
        const storedDriverId = localStorage.getItem('trinck_driver_id');
        const storedToken = localStorage.getItem('trinck_driver_token');
        
        if (storedDriverId && storedToken) {
            this.driverId = storedDriverId;
            this.connectToServer(storedToken);
        }
    }

    async startQRScanner() {
        try {
            const scanner = document.getElementById('qr-scanner');
            const video = document.getElementById('qr-video');
            
            scanner.classList.add('active');
            
            // Initialize QR Scanner
            const qrScanner = new QrScanner(
                video,
                (result) => {
                    this.handleQRCode(result.data);
                    this.stopQRScanner();
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );
            
            await qrScanner.start();
            this.qrScanner = qrScanner;
            
        } catch (error) {
            console.error('QR Scanner error:', error);
            alert('Camera access denied. Please enable camera permissions and try again.');
            this.stopQRScanner();
        }
    }

    stopQRScanner() {
        if (this.qrScanner) {
            this.qrScanner.stop();
            this.qrScanner.destroy();
            this.qrScanner = null;
        }
        document.getElementById('qr-scanner').classList.remove('active');
    }

    async handleQRCode(qrData) {
        try {
            // Parse QR code data
            const data = JSON.parse(qrData);
            
            if (data.type === 'trinck_driver_auth' && data.driverId && data.token) {
                this.driverId = data.driverId;
                
                // Store credentials
                localStorage.setItem('trinck_driver_id', data.driverId);
                localStorage.setItem('trinck_driver_token', data.token);
                
                // Connect to server
                await this.connectToServer(data.token);
                
                alert('✅ Successfully connected to Trinck platform!');
            } else {
                throw new Error('Invalid QR code format');
            }
        } catch (error) {
            console.error('QR Code parsing error:', error);
            alert('❌ Invalid QR code. Please scan a valid Trinck driver QR code.');
        }
    }

    async connectToServer(token) {
        try {
            // Validate token with server
            const response = await fetch('/api/driver/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driverId: this.driverId,
                    deviceInfo: this.getDeviceInfo()
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.isConnected = true;
                this.updateConnectionStatus('Connected', true);
                this.startLocationSharing();
                this.loadActiveJobs();
            } else {
                throw new Error(result.message || 'Connection failed');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.updateConnectionStatus('Connection Failed', false);
        }
    }

    updateConnectionStatus(status, isOnline) {
        document.getElementById('connection-status').textContent = status;
        const statusDot = document.getElementById('status-dot');
        
        if (isOnline) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
        }
    }

    async requestLocationPermission() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        try {
            // Request permission
            const permission = await navigator.permissions.query({name: 'geolocation'});
            
            if (permission.state === 'denied') {
                alert('Location permission denied. Please enable location access in your browser settings.');
                return;
            }

            // Get current position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.handleLocationUpdate(position);
                    this.startLocationTracking();
                },
                (error) => {
                    console.error('Location error:', error);
                    alert('Unable to get location. Please check your GPS settings.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } catch (error) {
            console.error('Permission error:', error);
        }
    }

    startLocationTracking() {
        if (this.locationWatchId) {
            navigator.geolocation.clearWatch(this.locationWatchId);
        }

        this.locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationUpdate(position);
            },
            (error) => {
                console.error('Location tracking error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 10000
            }
        );
    }

    handleLocationUpdate(position) {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date(position.timestamp);
        
        this.currentLocation = {
            latitude,
            longitude,
            accuracy,
            timestamp
        };

        // Update UI
        this.updateLocationDisplay();
        
        // Send to server if connected
        if (this.isConnected && this.driverId) {
            this.sendLocationUpdate();
        }
    }

    updateLocationDisplay() {
        const locationCard = document.getElementById('location-card');
        locationCard.classList.remove('hidden');
        
        document.getElementById('lat-value').textContent = 
            this.currentLocation.latitude.toFixed(6);
        document.getElementById('lng-value').textContent = 
            this.currentLocation.longitude.toFixed(6);
        document.getElementById('accuracy-value').textContent = 
            `±${Math.round(this.currentLocation.accuracy)}m`;
        document.getElementById('time-value').textContent = 
            this.currentLocation.timestamp.toLocaleTimeString();
    }

    async sendLocationUpdate() {
        try {
            const token = localStorage.getItem('trinck_driver_token');
            
            const response = await fetch('/api/driver/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driverId: this.driverId,
                    location: this.currentLocation,
                    activeJobs: this.activeJobs.map(job => job.id)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send location update');
            }
        } catch (error) {
            console.error('Location update error:', error);
        }
    }

    async loadActiveJobs() {
        try {
            const token = localStorage.getItem('trinck_driver_token');
            
            const response = await fetch(`/api/driver/jobs/${this.driverId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.activeJobs = result.jobs || [];
                this.updateJobsDisplay();
            }
        } catch (error) {
            console.error('Jobs loading error:', error);
        }
    }

    updateJobsDisplay() {
        const jobsSection = document.getElementById('jobs-section');
        const jobsContainer = document.getElementById('jobs-container');
        
        if (this.activeJobs.length > 0) {
            jobsSection.classList.remove('hidden');
            
            jobsContainer.innerHTML = this.activeJobs.map(job => `
                <div class="job-card">
                    <div class="job-header">
                        <span class="job-id">Job #${job.id}</span>
                        <span class="job-status">${job.status}</span>
                    </div>
                    <div class="job-route">${job.pickup} → ${job.delivery}</div>
                    <div class="job-customer">Customer: ${job.customerName}</div>
                </div>
            `).join('');
        } else {
            jobsSection.classList.add('hidden');
        }
    }

    startLocationSharing() {
        // Start continuous location updates every 10 seconds
        setInterval(() => {
            if (this.isConnected && this.currentLocation) {
                this.sendLocationUpdate();
            }
        }, 10000);
    }

    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
        
        let deviceType = 'Desktop';
        if (isTablet) deviceType = 'Tablet';
        else if (isMobile) deviceType = 'Mobile';
        
        return `${deviceType} - ${navigator.platform}`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DriverApp();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/driver-app/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
