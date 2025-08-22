# Gmail SMTP Setup Guide

## Step 1: Enable Gmail SMTP
1. Go to your Google Account settings (https://myaccount.google.com/)
2. Navigate to **Security** section
3. Enable **2-Step Verification** if not already enabled
4. Go to **Security > 2-Step Verification > App passwords**
5. Generate an App password for "Mail" application
6. Copy the 16-character app password

## Step 2: Create Environment File
Create a file named `.env.local` in your project root with:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
NODE_ENV=production
```

## Step 3: Replace Values
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-16-character-app-password` with the app password from Step 1

## Step 4: Restart Application
After creating the `.env.local` file, restart your Next.js application:
```bash
npm run dev
```

## Security Notes
- Never commit `.env.local` to version control
- Use App passwords, not your regular Gmail password
- The `.env.local` file is already in .gitignore for security
