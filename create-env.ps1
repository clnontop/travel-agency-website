# Create .env.local file with your configuration

$envContent = @"
# ============================================
# DATABASE - Your Supabase Database
# ============================================
DATABASE_URL="postgresql://postgres:clnontop@db.hfmfnrorroxhnytzfqux.supabase.co:5432/postgres"

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="va/KnD51biJXj77th+By1AwUVsAUzSPbeoC7kFFMGic="

# ============================================
# GOOGLE (For Login & Maps) - YOU NEED TO ADD THESE
# ============================================
# Get these from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# ============================================
# OPTIONAL SERVICES (Can be added later)
# ============================================

# Twilio (SMS/OTP) - Optional
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
TWILIO_VERIFY_SERVICE_SID=""

# Stripe (Payments) - Optional
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email (Resend) - Optional
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@trinck.com"

# Real-time (Pusher) - Optional
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

# File Storage (Cloudinary) - Optional
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ============================================
# APP SETTINGS
# ============================================
APP_URL="http://localhost:3000"
NODE_ENV="development"
"@

# Write to .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Created .env.local file with your Supabase database!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to add Google OAuth keys!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Create OAuth 2.0 credentials" -ForegroundColor White
Write-Host "3. Add redirect URI: http://localhost:3000/api/auth/callback/google" -ForegroundColor White
Write-Host "4. Copy the Client ID and Secret" -ForegroundColor White
Write-Host "5. Edit .env.local and replace the Google placeholders" -ForegroundColor White
Write-Host ""
Write-Host "Then run these commands:" -ForegroundColor Cyan
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npm run db:push" -ForegroundColor White
Write-Host "  npm run db:seed" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
