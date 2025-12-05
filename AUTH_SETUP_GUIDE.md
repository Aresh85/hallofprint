# Authentication System Setup Guide

## 📋 Overview

You're building a complete authentication system with:
- ✅ Email/Password login
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Role-based access (Customer vs Operator)
- ✅ Guest checkout with automatic account creation
- ✅ User profiles with addresses, preferences, and order history
- ✅ Protected admin dashboard

---

## Step 1: Run Database Schema

1. Go to https://supabase.com/dashboard
2. Select your project "supabase-cyan-kite"
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy **ALL** contents from `/web/database-auth-setup.sql`
6. Paste and click **Run**
7. Wait for "Success" message

This creates:
- `user_profiles` - User info and roles
- `user_addresses` - Delivery/billing addresses
- `user_preferences` - Marketing preferences
- `orders` - Order history
- `order_items` - Order line items

---

## Step 2: Configure Google OAuth

### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Choose **Web application**
6. Add these redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   http://localhost:3001/auth/callback (for testing)
   ```
7. Copy **Client ID** and **Client Secret**

### B. Enable in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## Step 3: Configure Facebook OAuth

### A. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** or **Business**
4. Fill in app details and create
5. Go to **Settings** → **Basic**
6. Copy **App ID** and **App Secret**
7. Add **Privacy Policy URL** (required): `https://yourdomain.com/privacy-policy`

### B. Configure Facebook Login

1. In your Facebook app, go to **Products** → **Facebook Login** → **Settings**
2. Add Valid OAuth Redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
3. Save changes

### C. Enable in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Facebook** and toggle it ON
3. Paste your **App ID** (as Client ID) and **App Secret** (as Client Secret)
4. Click **Save**

---

## Step 4: Configure Email Settings (Optional)

For production, configure email templates:

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize:
   - Confirm signup
   - Magic link
   - Password reset
3. Update **Sender Email** and **Sender Name**

---

## Step 5: Site URL Configuration

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://yourdomain.com` (or `http://localhost:3001` for dev)
3. Add **Redirect URLs**:
   ```
   http://localhost:3001/*
   https://yourdomain.com/*
   ```

---

## Step 6: Create Your First Operator Account

After the system is built, you'll need to manually promote a user to operator:

1. Sign up through the website
2. Go to Supabase Dashboard → **Table Editor** → **user_profiles**
3. Find your account
4. Edit the **role** field from `customer` to `operator` or `admin`
5. Save

---

## What's Next?

After completing these steps, I'll create:

1. **Authentication Pages**
   - Login page with Google/Facebook/Email options
   - Signup page
   - Password reset
   - Auth callback handlers

2. **Protected Routes**
   - Middleware to protect admin dashboard
   - Role-based access control

3. **User Account Pages**
   - Profile management
   - Address book
   - Order history
   - Marketing preferences

4. **Updated Checkout**
   - Guest checkout option
   - Save address on checkout
   - Automatic account creation for guests

5. **Updated Header**
   - Login/Signup buttons
   - User menu with dropdown
   - Account links

---

## Environment Variables Needed

These will be added to `.env.local`:

```bash
# Already have these:
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Will add:
NEXT_PUBLIC_SITE_URL="http://localhost:3001"  # Change in production
```

---

## Quick Reference

**Supabase Project**: supabase-cyan-kite  
**Google Console**: https://console.cloud.google.com/  
**Facebook Developers**: https://developers.facebook.com/  
**Supabase Dashboard**: https://supabase.com/dashboard

---

## Ready to Continue?

Once you've:
- ✅ Run the SQL in Supabase
- ✅ Set up Google OAuth (or skip if not needed now)
- ✅ Set up Facebook OAuth (or skip if not needed now)

Let me know and I'll build all the authentication pages and user account management!

You can also skip the OAuth setup for now and just use email/password - we can add Google/Facebook later.
