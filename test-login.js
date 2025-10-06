// Test login with real database
async function testLogin() {
  console.log('Testing login with real database...\n');
  
  const credentials = [
    { email: 'admin@trinck.com', password: 'admin123', type: 'admin' }
  ];
  
  for (const cred of credentials) {
    console.log(`Testing ${cred.type}: ${cred.email}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Login successful! User: ${data.user.name}`);
        console.log(`   Wallet Balance: ₹${data.user.wallet.balance}`);
      } else {
        console.log(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---');
  }
}

testLogin();
