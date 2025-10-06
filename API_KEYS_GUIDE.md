# 🔑 API Keys Setup Guide - Step by Step

## What You Need to Do:

### 1️⃣ **Create `.env.local` file**
Create a new file called `.env.local` in your project root (f:\treavel agency website\) and copy this template:

```env
# ============================================
# DATABASE (Choose ONE option below)
# ============================================

# Option A: Local PostgreSQL (if you have PostgreSQL installed)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/travel_agency"

# Option B: Free Cloud Database (RECOMMENDED - Pick ONE):
# Supabase (Free): https://supabase.com
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# Neon (Free): https://neon.tech
# DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname"

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="GENERATE_THIS_SECRET_KEY_SEE_BELOW"

# ============================================
# GOOGLE (For Login & Maps)
# ============================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# ============================================
# TWILIO (For SMS/OTP) - OPTIONAL for testing
# ============================================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# STRIPE (For Payments) - OPTIONAL for testing
# ============================================
STRIPE_SECRET_KEY="your-stripe-secret-key-here"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key-here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key-here"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret-here"

# ============================================
{{ ... }}
# ============================================
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# ============================================
# REAL-TIME (OPTIONAL for testing)
# ============================================
PUSHER_APP_ID="xxxxxx"
PUSHER_KEY="xxxxxxxxxxxxxxxxxxxxxxxx"
PUSHER_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY="xxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

# ============================================
# FILE STORAGE (OPTIONAL for testing)
# ============================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxx"
CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# APP SETTINGS
# ============================================
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🚀 Quick Start (Minimum Required)

### For basic testing, you only need these 3 things:

## 1. **Database (REQUIRED)** - Choose ONE:

### Option A: Supabase (Easiest - FREE)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Email
4. Create new project (remember your password!)
5. Go to Settings → Database
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your database password

### Option B: Neon (Also FREE)
1. Go to https://neon.tech
2. Sign up
3. Create new project
4. Copy connection string from dashboard

### Option C: Local PostgreSQL
1. Download PostgreSQL: https://www.postgresql.org/download/
2. Install and remember your password
3. Create database: `CREATE DATABASE travel_agency;`

## 2. **NextAuth Secret (REQUIRED)**
Generate a secret key by running this in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Or use this online generator: https://generate-secret.vercel.app/32

## 3. **Google OAuth (REQUIRED for login)**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

## 4. **Google Maps API (REQUIRED for maps)**
1. In Google Cloud Console
2. Go to "APIs & Services" → "Library"
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the key to your domain (optional but recommended)

---

## 📦 Optional Services (Can skip for basic testing)

### Twilio (SMS/OTP)
- Sign up at https://www.twilio.com/try-twilio
- Get free trial credits
- Buy a phone number ($1/month)
- Create Verify Service for OTP

### Stripe (Payments)
- Sign up at https://stripe.com
- Use test mode (no real charges)
- Get test API keys from dashboard

### Resend (Email)
- Sign up at https://resend.com
- Free tier: 100 emails/day
- Verify your domain or use their domain

### Pusher (Real-time)
- Sign up at https://pusher.com
- Free tier: 200k messages/day
- Create new app, get credentials

### Cloudinary (File Upload)
- Sign up at https://cloudinary.com
- Free tier: 25GB storage
- Get credentials from dashboard

---

## ✅ After Adding API Keys:

1. **Test your setup:**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npm run db:push

# Seed with test data
npm run db:seed

# Start development server
npm run dev
```

2. **Visit http://localhost:3000**

3. **Test login with Google OAuth**

---

## 🆘 Troubleshooting:

### Database Connection Error:
- Check DATABASE_URL format
- Ensure database password is correct
- Make sure database server is running

### Google OAuth Error:
- Verify redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Check Client ID and Secret are correct
- Enable Google+ API in Google Cloud Console

### Maps Not Loading:
- Enable Maps JavaScript API in Google Cloud
- Check API key restrictions
- Verify billing is enabled (free tier available)

---

## 💡 Pro Tips:

1. **Start with just Database + Google OAuth** - you can add other services later
2. **Use Supabase for database** - it's free and easy
3. **Test mode for Stripe** - no real charges
4. **Skip Twilio initially** - SMS not required for basic testing

---

## 🎯 Minimum to Get Started:

Just add these 4 keys to `.env.local`:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="generate-random-32-char-string"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

That's it! The app will work with just these.
