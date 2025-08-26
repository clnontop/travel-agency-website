const http = require('http');

const postData = JSON.stringify({
  phoneNumber: '+919876543210',
  otp: '123456',
  userEmail: 'clncult.02@gmail.com',
  verificationId: 'test_verification_001',
  expiresAt: '2025-08-24T20:45:00.000Z',
  isResend: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/email/send-phone-verification',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (response.success) {
        console.log('✅ Email sent successfully to clncult.02@gmail.com');
        console.log('📧 Check your email for the verification code: 123456');
      } else {
        console.log('❌ Failed to send email:', response.message);
      }
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
