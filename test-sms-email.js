// Test SMS via Email Gateway
async function testSMSEmailGateway() {
  try {
    const response = await fetch('http://localhost:3000/api/sms/email-gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+919876543210',
        message: 'Your TRINK verification code is: 123456'
      })
    });

    const data = await response.json();
    console.log('SMS Gateway Response:', data);
    
    if (data.success) {
      console.log('✅ SMS sent successfully via email gateway');
      console.log(`📱 Provider: ${data.provider}`);
    } else {
      console.log('❌ Failed to send SMS:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSMSEmailGateway();
