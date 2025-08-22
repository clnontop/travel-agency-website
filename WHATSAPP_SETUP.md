# WhatsApp OTP Setup Guide

This guide explains how to set up WhatsApp OTP delivery for your TRINK application.

## Overview

The WhatsApp OTP service supports two methods:
1. **WhatsApp Web Links** (Always available, no setup required)
2. **WhatsApp Business API** (Optional, requires setup)

## Method 1: WhatsApp Web Links (Default)

This method generates WhatsApp Web links that users can click to send the OTP to themselves. **No configuration required**.

### How it works:
- Generates a `wa.me` link with pre-filled OTP message
- User clicks the link to open WhatsApp
- Message is pre-filled, user just needs to send it
- Works on both mobile and desktop

### Usage:
```javascript
// Direct API call
const response = await fetch('/api/whatsapp/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+919876543210',
    otp: '123456'
  })
});

// Or use existing SMS endpoint (now uses WhatsApp as primary)
const response = await fetch('/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+919876543210',
    message: 'Your verification code is: 123456'
  })
});
```

## Method 2: WhatsApp Business API (Optional)

For automated WhatsApp message delivery without user interaction.

### Prerequisites:
1. Facebook Business Account
2. WhatsApp Business Account
3. Approved WhatsApp Business API access
4. Message templates approved by WhatsApp

### Setup Steps:

#### 1. Create Facebook Business Account
- Go to [business.facebook.com](https://business.facebook.com)
- Create or use existing business account

#### 2. Set up WhatsApp Business API
- Go to [developers.facebook.com](https://developers.facebook.com)
- Create a new app or use existing
- Add WhatsApp product to your app

#### 3. Get Required Credentials
- **Access Token**: From your app's WhatsApp settings
- **Phone Number ID**: Your WhatsApp Business phone number ID
- **Business Account ID**: Your WhatsApp Business account ID

#### 4. Create Message Template
Create an OTP template in WhatsApp Manager:
```
Template Name: otp_verification
Category: AUTHENTICATION
Language: English

Template Content:
Your TRINK verification code is {{1}}. Valid for 5 minutes. Do not share this code.
```

#### 5. Environment Variables
Add these to your `.env.local` file:
```bash
# WhatsApp Business API (Optional)
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

### Testing Business API
```bash
# Check WhatsApp service status
curl http://localhost:3000/api/whatsapp/send-otp

# Send test OTP
curl -X POST http://localhost:3000/api/whatsapp/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'
```

## API Endpoints

### `/api/whatsapp/send-otp` (POST)
Send OTP via WhatsApp

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "userEmail": "user@example.com" // Optional, for email fallback
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp link generated. Click to send OTP via WhatsApp.",
  "method": "web-link",
  "whatsappLink": "https://wa.me/919876543210?text=...",
  "configStatus": {
    "businessAPI": false,
    "webLink": true,
    "accessToken": false,
    "phoneNumberId": false
  }
}
```

### `/api/whatsapp/send-otp` (GET)
Check WhatsApp service status

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp OTP service status",
  "configStatus": {
    "businessAPI": false,
    "webLink": true,
    "accessToken": false,
    "phoneNumberId": false
  },
  "available": true,
  "businessApiAvailable": false
}
```

## Integration with Existing Code

Your existing SMS endpoints now use WhatsApp as the primary method:

1. **`/api/sms/send`** - Now tries WhatsApp first, then SMS fallbacks
2. **`/api/email/send-phone-otp`** - Remains as email fallback

## Fallback Chain

1. **WhatsApp** (Primary)
   - Business API (if configured)
   - Web Link (always available)
2. **SMS** (Fallback 1)
   - Textbelt service
3. **Custom SMS** (Fallback 2)
   - Email-to-SMS gateways
   - Email notification
4. **Email** (Final fallback)

## Phone Number Format

The service automatically formats phone numbers:
- Indian numbers: `+91` prefix added if missing
- International numbers: Used as provided
- Supports formats: `9876543210`, `+919876543210`, `919876543210`

## Security Notes

- OTP messages include expiry warnings
- Messages advise not to share codes
- Business API tokens should be kept secure
- Use environment variables for sensitive data

## Troubleshooting

### WhatsApp Web Link Issues
- Ensure phone number is correctly formatted
- Check if WhatsApp is installed on user's device
- Verify the generated link opens correctly

### Business API Issues
- Check access token validity
- Verify phone number ID is correct
- Ensure message template is approved
- Check WhatsApp Business API quotas

### General Issues
- Check network connectivity
- Verify environment variables
- Check API response status codes
- Review server logs for errors
