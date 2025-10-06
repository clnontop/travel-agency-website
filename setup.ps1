# Trinck Travel Agency - Production Setup Script
Write-Host "🚀 Trinck Travel Agency - Production Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($?) {
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18 or higher" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running (optional)
Write-Host "`n🐘 Checking PostgreSQL..." -ForegroundColor Yellow
Write-Host "Note: You can use a cloud PostgreSQL service instead of local installation" -ForegroundColor Gray

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma Client
Write-Host "`n🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Create .env.local file if it doesn't exist
if (!(Test-Path ".env.local")) {
    Write-Host "`n📝 Creating .env.local file..." -ForegroundColor Yellow
    @"
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/travel_agency_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"

# Google OAuth (for login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Twilio Configuration (SMS/OTP)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_VERIFY_SERVICE_SID="your-verify-service-sid"

# Stripe Configuration (Payments)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Resend Configuration (Email)
RESEND_API_KEY="re_your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Pusher Configuration (Real-time)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

# Cloudinary Configuration (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# App Configuration
APP_URL="http://localhost:3000"
NODE_ENV="development"
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "⚠️  Please update .env.local with your actual API keys!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

Write-Host "`n" -NoNewline
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with your actual API keys and database URL"
Write-Host "2. Run 'npm run db:push' to create database tables"
Write-Host "3. Run 'npm run db:seed' to add sample data (optional)"
Write-Host "4. Run 'npm run dev' to start the development server"
Write-Host "5. Visit http://localhost:3000"

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Setup Guide: PRODUCTION_SETUP.md"
Write-Host "- Database Management: npm run db:studio"
Write-Host "- Production Build: npm run build && npm start"

Write-Host "`n🔐 Default Test Accounts (after seeding):" -ForegroundColor Magenta
Write-Host "Admin: admin@trinck.com / admin123"
Write-Host "Customer: john.doe@example.com / customer123"
Write-Host "Driver: rajesh.kumar@example.com / driver123"

Write-Host "`n" -NoNewline
