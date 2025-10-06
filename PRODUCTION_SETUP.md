# Production Setup Guide - Travel Agency Website

## 🚀 Complete Production Configuration

This guide will help you set up all the required services and configurations to make this website fully functional for production use.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database (local or cloud)
3. **npm** or **yarn** package manager

## 🔧 Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
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
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Resend Configuration (Email)
RESEND_API_KEY="re_your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Pusher Configuration (Real-time)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="ap2"

# Cloudinary Configuration (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# App Configuration
APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 🛠️ Service Setup Instructions

### 1. PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
psql -U postgres
CREATE DATABASE travel_agency_db;
```

#### Option B: Cloud PostgreSQL (Recommended)
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app
- **Render**: https://render.com

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 3. Twilio Setup (SMS/OTP)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from Dashboard
3. Buy a phone number with SMS capability
4. Create a Verify Service for OTP:
   - Go to Verify → Services → Create new service
   - Copy the Service SID

### 4. Stripe Setup (Payments)

1. Sign up at [Stripe](https://stripe.com/)
2. Get your API keys from Dashboard → Developers → API keys
3. Set up webhook endpoint:
   - Go to Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`

### 5. Resend Setup (Email)

1. Sign up at [Resend](https://resend.com/)
2. Verify your domain
3. Get API key from Settings → API Keys
4. Configure FROM email address

### 6. Pusher Setup (Real-time)

1. Sign up at [Pusher](https://pusher.com/)
2. Create a new app
3. Choose cluster closest to your users
4. Get credentials from App Keys

### 7. Cloudinary Setup (File Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get credentials from Dashboard
3. Configure upload presets for different file types

### 8. Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API, Places API, Geocoding API
3. Create API key and restrict it to your domain

## 📦 Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed the database (optional)
npm run seed

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Render
1. Create Web Service
2. Connect GitHub repository
3. Add environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Enable 2FA on all service accounts
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Enable SSL/HTTPS
- [ ] Set secure cookie settings
- [ ] Configure CSP headers
- [ ] Regular security audits

## 📊 Monitoring & Analytics

### Recommended Services:
- **Sentry**: Error tracking
- **Google Analytics**: User analytics
- **Uptime Robot**: Uptime monitoring
- **LogRocket**: Session replay

## 🧪 Testing Payments

### Stripe Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 📱 Mobile App Configuration

If using the mobile app:
1. Update API endpoints in mobile app
2. Configure deep linking
3. Set up push notifications (FCM/APNS)

## 🆘 Support

For issues or questions:
1. Check logs: `npm run logs`
2. Database issues: `npx prisma studio`
3. Check service status pages

## 📝 Important Notes

1. **Never commit `.env.local` file to Git**
2. **Use different API keys for development and production**
3. **Regular database backups are essential**
4. **Monitor API usage to avoid overage charges**
5. **Keep all dependencies updated**

## 🎯 Quick Start Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Database management
npx prisma studio     # GUI for database
npx prisma migrate dev # Run migrations
npx prisma db push    # Push schema changes

# Check setup
npm run check-env     # Verify environment variables
```

---

**Ready for Production!** 🚀

Once all services are configured and environment variables are set, your travel agency website will be fully functional with:
- ✅ Real user authentication
- ✅ SMS/OTP verification
- ✅ Payment processing
- ✅ Email notifications
- ✅ Real-time updates
- ✅ File uploads
- ✅ Map integration
