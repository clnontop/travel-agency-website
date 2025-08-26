// Use built-in fetch in Node.js 18+

async function testEmailVerification() {
  try {
    const response = await fetch('http://localhost:3000/api/email/send-phone-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+919876543210',
        otp: '123456',
        userEmail: 'clncult.02@gmail.com'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Email sent successfully to clncult.02@gmail.com');
      console.log('📧 Check your email for the verification code');
    } else {
      console.log('❌ Failed to send email:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmailVerification();
