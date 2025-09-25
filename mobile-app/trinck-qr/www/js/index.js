// Trinck QR Manager - Mobile App JavaScript

class TrinckQRApp {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.qrHistory = [];
        this.currentQRData = null;
        this.cameraStream = null;
        
        this.init();
    }

    init() {
        document.addEventListener('deviceready', () => {
            this.onDeviceReady();
        }, false);
        
        // Fallback for browser testing
        if (!window.cordova) {
            setTimeout(() => this.onDeviceReady(), 1000);
        }
    }

    onDeviceReady() {
        console.log('Device is ready');
        
        // Hide splash screen
        setTimeout(() => {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'flex';
            
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
        }, 2000);
        
        this.setupEventListeners();
        this.loadHistory();
        this.setupStatusBar();
    }

    setupStatusBar() {
        if (window.StatusBar) {
            StatusBar.backgroundColorByHexString('#dc2626');
            StatusBar.styleLightContent();
        }
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item[data-screen]').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.getAttribute('data-screen');
                this.showScreen(screen);
            });
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });

        // Website button
        document.getElementById('websiteBtn').addEventListener('click', () => {
            this.openWebsite();
        });

        // QR Type selector
        document.getElementById('qrType').addEventListener('change', () => {
            this.updateFormInputs();
        });

        // Image input
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.scanFromGallery(e.target.files[0]);
        });

        // Upload area click
        document.getElementById('uploadArea').addEventListener('click', () => {
            this.selectImage();
        });

        // Hardware back button
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            if (this.currentScreen === 'mainMenu') {
                navigator.app.exitApp();
            } else {
                this.showScreen('mainMenu');
            }
        }, false);
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        
        // Update current screen
        this.currentScreen = screenId;

        // Show/hide back button
        const backBtn = document.getElementById('backBtn');
        if (screenId === 'mainMenu') {
            backBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'flex';
        }

        // Screen-specific initialization
        if (screenId === 'camera') {
            this.initCamera();
        } else if (screenId === 'history') {
            this.displayHistory();
        } else if (screenId === 'generator') {
            this.updateFormInputs();
        }
    }

    updateFormInputs() {
        const qrType = document.getElementById('qrType').value;
        
        // Hide all form sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show relevant form section
        const formMap = {
            'text': 'textForm',
            'job': 'jobForm',
            'contact': 'contactForm',
            'wifi': 'wifiForm'
        };

        const targetForm = formMap[qrType];
        if (targetForm) {
            document.getElementById(targetForm).style.display = 'block';
        }
    }

    generateQR() {
        const qrType = document.getElementById('qrType').value;
        let qrData = '';
        let displayData = {};

        try {
            switch (qrType) {
                case 'text':
                    qrData = document.getElementById('qrText').value.trim();
                    displayData = { type: 'text', content: qrData };
                    break;

                case 'job':
                    const jobData = {
                        type: 'job',
                        jobId: document.getElementById('jobId').value || 'TRK' + this.generateId(),
                        customer: document.getElementById('customerName').value,
                        pickup: document.getElementById('pickupLocation').value,
                        delivery: document.getElementById('deliveryLocation').value,
                        timestamp: Date.now()
                    };
                    qrData = JSON.stringify(jobData);
                    displayData = jobData;
                    break;

                case 'contact':
                    const contactData = {
                        name: document.getElementById('contactName').value,
                        phone: document.getElementById('contactPhone').value,
                        email: document.getElementById('contactEmail').value
                    };
                    qrData = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.name}\nTEL:${contactData.phone}\nEMAIL:${contactData.email}\nEND:VCARD`;
                    displayData = { type: 'contact', ...contactData };
                    break;

                case 'wifi':
                    const wifiData = {
                        ssid: document.getElementById('wifiSSID').value,
                        password: document.getElementById('wifiPassword').value,
                        security: document.getElementById('wifiSecurity').value
                    };
                    qrData = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
                    displayData = { type: 'wifi', ...wifiData };
                    break;
            }

            if (!qrData) {
                this.showAlert('Please fill in the required fields');
                return;
            }

            this.currentQRData = { ...displayData, qrData, timestamp: Date.now() };

            QRCode.toCanvas(document.getElementById('qrCanvas'), qrData, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            }, (error) => {
                if (error) {
                    this.showAlert('Error generating QR code: ' + error.message);
                } else {
                    document.getElementById('qrResult').style.display = 'block';
                    this.saveToHistory(this.currentQRData);
                    this.vibrate();
                }
            });

        } catch (error) {
            this.showAlert('Error: ' + error.message);
        }
    }

    generateJobQR(action) {
        const jobData = {
            type: 'job_action',
            action: action,
            jobId: 'TRK' + this.generateId(),
            customer: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            pickup: 'Connaught Place, New Delhi',
            delivery: 'Cyber City, Gurgaon',
            driver: 'Amit Singh',
            timestamp: Date.now()
        };

        this.currentQRData = jobData;

        QRCode.toCanvas(document.getElementById('jobQrCanvas'), JSON.stringify(jobData), {
            width: 280,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        }, (error) => {
            if (error) {
                this.showAlert('Error generating job QR: ' + error.message);
            } else {
                document.getElementById('jobInfo').innerHTML = `
                    <strong>Job ID:</strong> ${jobData.jobId}<br>
                    <strong>Action:</strong> ${action.charAt(0).toUpperCase() + action.slice(1)}<br>
                    <strong>Customer:</strong> ${jobData.customer}<br>
                    <strong>Phone:</strong> ${jobData.phone}<br>
                    <strong>Pickup:</strong> ${jobData.pickup}<br>
                    <strong>Delivery:</strong> ${jobData.delivery}
                `;
                document.getElementById('jobQrResult').style.display = 'block';
                this.saveToHistory(jobData);
                this.vibrate();
            }
        });
    }

    initCamera() {
        if (!navigator.camera) {
            this.showAlert('Camera not available on this device');
            return;
        }

        // For now, use file input as fallback
        // In production, implement proper camera access
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });
    }

    capturePhoto() {
        if (!navigator.camera) {
            this.showAlert('Camera not available');
            return;
        }

        const options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 600,
            correctOrientation: true
        };

        navigator.camera.getPicture(
            (imageData) => {
                this.scanQRFromImage('data:image/jpeg;base64,' + imageData);
            },
            (error) => {
                this.showAlert('Camera error: ' + error);
            },
            options
        );
    }

    selectImage() {
        document.getElementById('imageInput').click();
    }

    scanFromGallery(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.scanQRFromImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    scanQRFromImage(imageSrc) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                this.displayScanResult(code.data);
                this.vibrate();
            } else {
                this.showAlert('No QR code found in image');
            }
        };
        img.src = imageSrc;
    }

    displayScanResult(data) {
        let resultHtml = `<h4>✅ QR Code Scanned</h4>`;
        
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'job' || parsed.type === 'job_action') {
                resultHtml += `
                    <div class="scan-data">
                        <strong>Job Data Detected:</strong><br>
                        Job ID: ${parsed.jobId || 'N/A'}<br>
                        Customer: ${parsed.customer || 'N/A'}<br>
                        Action: ${parsed.action || 'N/A'}<br>
                        <br>
                        <strong>Full Data:</strong><br>
                        ${JSON.stringify(parsed, null, 2)}
                    </div>
                `;
            } else {
                resultHtml += `<div class="scan-data">${JSON.stringify(parsed, null, 2)}</div>`;
            }
        } catch (e) {
            resultHtml += `<div class="scan-data">${data}</div>`;
        }

        // Show result in appropriate screen
        const resultContainers = ['cameraResult', 'galleryResult'];
        resultContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = resultHtml;
                container.style.display = 'block';
            }
        });

        this.saveToHistory({
            type: 'scan',
            data: data,
            timestamp: Date.now()
        });
    }

    saveQR() {
        if (!this.currentQRData) return;

        const canvas = document.getElementById('qrCanvas');
        this.saveCanvasToGallery(canvas, `trinck-qr-${Date.now()}.png`);
    }

    saveJobQR() {
        if (!this.currentQRData) return;

        const canvas = document.getElementById('jobQrCanvas');
        this.saveCanvasToGallery(canvas, `trinck-job-${this.currentQRData.jobId}-${this.currentQRData.action}.png`);
    }

    saveCanvasToGallery(canvas, filename) {
        canvas.toBlob((blob) => {
            if (window.cordova && window.cordova.file) {
                // Save to device gallery using Cordova File plugin
                this.saveToDevice(blob, filename);
            } else {
                // Fallback: download for web
                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL();
                link.click();
            }
        });
    }

    saveToDevice(blob, filename) {
        // Implementation for saving to device storage
        // This requires cordova-plugin-file
        if (window.requestFileSystem) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
                fs.root.getFile(filename, { create: true, exclusive: false }, (fileEntry) => {
                    fileEntry.createWriter((fileWriter) => {
                        fileWriter.write(blob);
                        this.showAlert('QR code saved to gallery');
                    });
                });
            });
        } else {
            this.showAlert('File system not available');
        }
    }

    shareQR() {
        if (!this.currentQRData) return;

        const canvas = document.getElementById('qrCanvas') || document.getElementById('jobQrCanvas');
        
        canvas.toBlob((blob) => {
            if (navigator.share) {
                const file = new File([blob], 'trinck-qr.png', { type: 'image/png' });
                navigator.share({
                    title: 'Trinck QR Code',
                    text: 'QR Code generated by Trinck',
                    files: [file]
                }).catch(console.error);
            } else if (window.plugins && window.plugins.socialsharing) {
                // Use Cordova social sharing plugin
                const dataURL = canvas.toDataURL();
                window.plugins.socialsharing.share(
                    'QR Code generated by Trinck',
                    'Trinck QR Code',
                    dataURL,
                    null
                );
            } else {
                this.saveQR(); // Fallback to save
            }
        });
    }

    shareJobQR() {
        this.shareQR();
    }

    openWebsite() {
        const url = window.location.origin || 'https://trinck.com';
        
        if (window.cordova && window.cordova.InAppBrowser) {
            cordova.InAppBrowser.open(url, '_system');
        } else {
            window.open(url, '_blank');
        }
    }

    saveToHistory(data) {
        this.qrHistory.unshift(data);
        if (this.qrHistory.length > 100) {
            this.qrHistory = this.qrHistory.slice(0, 100);
        }
        
        if (window.localStorage) {
            localStorage.setItem('trinckQRHistory', JSON.stringify(this.qrHistory));
        }
    }

    loadHistory() {
        if (window.localStorage) {
            const saved = localStorage.getItem('trinckQRHistory');
            if (saved) {
                try {
                    this.qrHistory = JSON.parse(saved);
                } catch (e) {
                    this.qrHistory = [];
                }
            }
        }
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.qrHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No QR codes generated yet.</p>';
            return;
        }

        historyList.innerHTML = this.qrHistory.map((item, index) => {
            const date = new Date(item.timestamp).toLocaleString();
            const preview = typeof item.data === 'string' ? 
                item.data.substring(0, 100) : 
                JSON.stringify(item.data).substring(0, 100);

            return `
                <div class="history-item">
                    <h4>${item.type === 'scan' ? '📷 Scanned' : '📱 Generated'} - ${item.type}</h4>
                    <div class="timestamp">${date}</div>
                    <div class="data-preview">${preview}${preview.length >= 100 ? '...' : ''}</div>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        if (navigator.notification) {
            navigator.notification.confirm(
                'Are you sure you want to clear all history?',
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        this.qrHistory = [];
                        if (window.localStorage) {
                            localStorage.removeItem('trinckQRHistory');
                        }
                        this.displayHistory();
                        this.showAlert('History cleared');
                    }
                },
                'Clear History',
                ['Yes', 'Cancel']
            );
        } else {
            if (confirm('Are you sure you want to clear all history?')) {
                this.qrHistory = [];
                if (window.localStorage) {
                    localStorage.removeItem('trinckQRHistory');
                }
                this.displayHistory();
                this.showAlert('History cleared');
            }
        }
    }

    showAlert(message) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, 'Trinck', 'OK');
        } else {
            alert(message);
        }
    }

    vibrate(duration = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    generateId() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
}

// Global functions for HTML onclick events
window.generateQR = function() {
    window.trinckApp.generateQR();
};

window.generateJobQR = function(action) {
    window.trinckApp.generateJobQR(action);
};

window.saveQR = function() {
    window.trinckApp.saveQR();
};

window.saveJobQR = function() {
    window.trinckApp.saveJobQR();
};

window.shareQR = function() {
    window.trinckApp.shareQR();
};

window.shareJobQR = function() {
    window.trinckApp.shareJobQR();
};

window.selectImage = function() {
    window.trinckApp.selectImage();
};

window.clearHistory = function() {
    window.trinckApp.clearHistory();
};

// Initialize app
window.trinckApp = new TrinckQRApp();
