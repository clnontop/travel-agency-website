const { Client } = require('pg');

// Test different connection strings
const connectionStrings = [
  'postgresql://postgres:clnontop0001@db.hfmfnrorroxhnytzfqux.supabase.co:5432/postgres',
  'postgresql://postgres:clnontop0001@db.hfmfnrorroxhnytzfqux.supabase.co:6543/postgres?pgbouncer=true',
  'postgres://postgres:clnontop0001@db.hfmfnrorroxhnytzfqux.supabase.co:5432/postgres',
  'postgres://postgres:clnontop0001@db.hfmfnrorroxhnytzfqux.supabase.co:6543/postgres'
];

async function testConnection(connectionString) {
  console.log(`\nTesting: ${connectionString.substring(0, 50)}...`);
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('Testing Supabase database connections...\n');
  console.log('Project ID: hfmfnrorroxhnytzfqux');
  console.log('Password: clnontop0001\n');
  
  for (const cs of connectionStrings) {
    const success = await testConnection(cs);
    if (success) {
      console.log('\n🎉 Working connection string found!');
      console.log('Update your .env file with:');
      console.log(`DATABASE_URL=${cs}`);
      break;
    }
  }
}

main().catch(console.error);
