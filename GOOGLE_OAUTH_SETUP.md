# 🔐 Google OAuth Setup Guide

## 📋 **Quick Setup Steps**

### **1. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google Identity API**

### **2. Configure OAuth Consent Screen**
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: Travel Agency Website
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email addresses)

### **3. Create OAuth Credentials**
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: Travel Agency Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google`
     - `https://yourdomain.com/api/auth/google` (for production)

### **4. Get Your Credentials**
After creating, you'll get:
- **Client ID**: `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdef123456`

## ⚙️ **Environment Configuration**

Copy these to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

## 🚀 **Testing Google Sign-In**

### **Development Testing:**
1. Make sure your `.env.local` has the correct Google credentials
2. Start your development server: `npm run dev`
3. Go to login page: `http://localhost:3000/auth/login`
4. Click "Continue with Google"
5. Sign in with your Google account

### **Expected Flow:**
1. **Click Google button** → Google popup opens
2. **Select Google account** → User grants permissions
3. **Automatic redirect** → User logged into your app
4. **Account creation** → New users automatically registered
5. **Dashboard redirect** → Users sent to appropriate dashboard

## 🔧 **Features Implemented**

### **✅ Complete Google OAuth Integration:**
- **Secure token verification** using Google's official library
- **Automatic account creation** for new users
- **Account linking** for existing email addresses
- **User type selection** (driver/customer) during sign-in
- **Profile data sync** (name, email, profile picture)
- **Seamless integration** with existing auth system

### **✅ Security Features:**
- **Token verification** against Google's servers
- **Email verification** required (only verified Google emails)
- **Secure password generation** for Google users
- **Session management** integrated with existing system
- **User data protection** with proper sanitization

### **✅ User Experience:**
- **One-click sign-in** with Google account
- **Automatic profile setup** with Google data
- **Seamless registration** for new users
- **Account recovery** for existing users
- **Cross-device compatibility** with responsive design

## 🛡️ **Security Considerations**

### **Production Deployment:**
1. **Update redirect URIs** to your production domain
2. **Use HTTPS** for all OAuth endpoints
3. **Secure environment variables** on your hosting platform
4. **Regular credential rotation** for enhanced security
5. **Monitor OAuth usage** in Google Cloud Console

### **Privacy Compliance:**
- **Minimal data collection** (only email, name, profile picture)
- **User consent** clearly displayed during sign-in
- **Data retention** follows your privacy policy
- **Account deletion** removes all Google-linked data

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **"OAuth Error: Invalid Client"**
- ✅ Check `GOOGLE_CLIENT_ID` matches exactly
- ✅ Verify authorized origins in Google Console
- ✅ Ensure no extra spaces in environment variables

#### **"Redirect URI Mismatch"**
- ✅ Add exact URL to authorized redirect URIs
- ✅ Include both HTTP (dev) and HTTPS (prod) versions
- ✅ Check for trailing slashes

#### **"Access Blocked"**
- ✅ Add your email to test users in OAuth consent screen
- ✅ Verify app is in testing mode for development
- ✅ Check required scopes are configured

#### **"Google Sign-In Not Loading"**
- ✅ Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- ✅ Check browser console for JavaScript errors
- ✅ Ensure Google APIs are enabled in Cloud Console

## 📞 **Support**

### **Google Cloud Console Links:**
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [Credentials](https://console.cloud.google.com/apis/credentials)
- [API Library](https://console.cloud.google.com/apis/library)

### **Testing Checklist:**
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Credentials created with correct URIs
- [ ] Environment variables set in `.env.local`
- [ ] Development server running
- [ ] Google Sign-In button appears on login page
- [ ] Sign-in flow completes successfully
- [ ] User redirected to appropriate dashboard

**Your Google Sign-In is now fully functional! 🎉**
