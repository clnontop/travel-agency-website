# SMS & Phone Verification Setup

This project uses multiple SMS providers based on phone number country.

## Country-Specific SMS Handling

### 🇮🇳 Indian Numbers (+91)
- **Development**: OTP shown in console + WhatsApp link
- **Production**: WhatsApp manual delivery (Textbelt blocks Indian numbers)
- **Optional**: Fast2SMS integration (add `FAST2SMS_API_KEY` to `.env.local`)

### 🌍 International Numbers
- **Primary**: Textbelt free tier (1 SMS per day per number)
- **No API key required** - Uses hardcoded `'textbelt'` key
- **Works out of the box**

## Setup Options

### Zero Setup (Default)
✅ **Works immediately** - Indian numbers get console logs + WhatsApp links
✅ **International numbers** - Real SMS via Textbelt free tier

### Enhanced Setup (Optional)
Add to `.env.local` for better Indian SMS delivery:
```bash
# Fast2SMS for Indian numbers (free tier available)
FAST2SMS_API_KEY=your_fast2sms_key

# Textbelt paid tier for higher quotas
TEXTBELT_API_KEY=your_paid_textbelt_key
```

## Usage

The phone verification system will:
1. **Primary**: Use Textbelt for SMS delivery
2. **Fallback**: Use the existing custom email-to-SMS gateway if Textbelt fails
3. **Final Fallback**: Provide WhatsApp link for manual verification

## API Endpoints

- `POST /api/sms/send-otp` - Send OTP to phone number
- `POST /api/sms/send` - Send general SMS (with OTP detection)

## Phone Number Format

The system automatically formats phone numbers:
- Indian numbers: `+91XXXXXXXXXX`
- US numbers: `+1XXXXXXXXXXX`
- Other countries: `+[country_code][number]`

## Testing

To test the SMS functionality:
1. Use the free tier (1 SMS per day)
2. Check the console logs for delivery status
3. Verify the `quotaRemaining` field in API responses

## Troubleshooting

- **Quota exceeded**: Wait 24 hours or upgrade to paid tier
- **Invalid phone number**: Ensure proper formatting
- **Network errors**: Check internet connection and Textbelt service status
