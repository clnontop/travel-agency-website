# 🔧 Supabase Database Setup Guide

## ⚠️ Connection Issue Detected

Your database URL seems to be having connection issues. Let's fix this:

## Step 1: Verify Your Supabase Database

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com/projects
   - Select your project

2. **Check Database Status**
   - Make sure your project is active (not paused)
   - Free tier databases pause after 1 week of inactivity
   - If paused, click "Restore" to wake it up

3. **Get the Correct Connection String**
   - Go to Settings → Database
   - Look for "Connection string" section
   - Choose "URI" tab
   - Copy the connection string
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: Update Your Connection String

Your current connection string:
```
postgresql://postgres:clnontop@db.hfmfnrorroxhnytzfqux.supabase.co:5432/postgres
```

Make sure:
- ✅ `clnontop` is your correct database password
- ✅ The project ID `hfmfnrorroxhnytzfqux` is correct
- ✅ Your database is not paused

## Step 3: Alternative Connection Methods

### Option A: Use Pooling Connection (Recommended)
If direct connection fails, use the pooling connection:
```
postgresql://postgres:clnontop@db.hfmfnrorroxhnytzfqux.supabase.co:6543/postgres?pgbouncer=true
```
Note: Port changed from 5432 to 6543

### Option B: Use Transaction Pooling
For serverless environments:
```
postgresql://postgres:clnontop@db.hfmfnrorroxhnytzfqux.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

## Step 4: Test Your Connection

Run this command to test:
```bash
npx prisma db pull
```

If successful, it will introspect your database schema.

## Step 5: If Still Not Working

1. **Reset Database Password**
   - Go to Supabase Dashboard
   - Settings → Database
   - Click "Reset database password"
   - Use the new password in your connection string

2. **Check IP Restrictions**
   - Supabase doesn't restrict IPs by default
   - But check if you have any custom settings

3. **Create New Project**
   - If all else fails, create a new Supabase project
   - It's free and takes 2 minutes

## Quick Fix Commands

After updating your `.env` file with the correct connection string:

```bash
# Test connection
npx prisma db pull

# Push schema
npx prisma db push

# Seed database
npm run db:seed

# Start app
npm run dev
```

## Need Help?

- Supabase Status: https://status.supabase.com/
- Supabase Discord: https://discord.supabase.com/
- Connection string format: `postgresql://[user]:[password]@[host]:[port]/[database]`
