// Simple test script for Textbelt SMS functionality
// Run with: node test-textbelt.js

const testPhoneNumber = '+1234567890'; // Replace with your test number
const testOTP = '123456';

async function testTextbeltAPI() {
  try {
    console.log('🧪 Testing Textbelt SMS API...');
    
    // Test the OTP endpoint
    const response = await fetch('http://localhost:3000/api/sms/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber
      })
    });

    const result = await response.json();
    
    console.log('📱 OTP API Response:', result);
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log(`📊 Quota remaining: ${result.quotaRemaining || 'Unknown'}`);
      console.log(`🆔 Message ID: ${result.messageId}`);
    } else {
      console.log('❌ SMS failed:', result.message);
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    console.log('💡 Make sure your Next.js server is running on port 3000');
  }
}

// Test general SMS endpoint
async function testGeneralSMS() {
  try {
    console.log('\n🧪 Testing general SMS endpoint...');
    
    const response = await fetch('http://localhost:3000/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber,
        message: `Your TRINK verification code is: ${testOTP}. Valid for 5 minutes.`
      })
    });

    const result = await response.json();
    
    console.log('📱 General SMS Response:', result);
    
    if (result.success) {
      console.log('✅ SMS sent successfully via', result.method);
    } else {
      console.log('❌ SMS failed:', result.message);
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Textbelt SMS Tests');
console.log('📞 Test phone number:', testPhoneNumber);
console.log('⚠️  Note: Using free tier (1 SMS per day per number)\n');

testTextbeltAPI().then(() => {
  return testGeneralSMS();
}).then(() => {
  console.log('\n✨ Tests completed!');
});
