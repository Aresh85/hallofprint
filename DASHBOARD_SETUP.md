# Price Match Dashboard Setup Guide

## 🎉 What's Been Created

Your Hall of Prints website now has a complete price match request system with:

1. ✅ **Price Match Request Form** (`/price-match-request`)
   - Web3Forms integration for email notifications
   - hCaptcha spam protection
   - Automatic database storage

2. ✅ **Admin Dashboard** (`/admin/price-match-dashboard`)
   - View all submissions in real-time
   - Search and filter by status, name, email, product
   - Update request status (Pending, Contacted, Approved, Rejected)
   - Statistics overview

3. ✅ **Supabase Database**
   - Stores all form submissions
   - Automatic timestamps
   - Status tracking

---

## 🔧 Final Setup Steps

### Step 1: Add Supabase Credentials to .env.local

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click on **supabase-cyan-kite**
5. Click on the **.env.local** tab
6. Copy these three values and add them to `/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="[copy from Vercel]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[copy from Vercel]"
SUPABASE_SERVICE_ROLE_KEY="[copy from Vercel - this is SUPABASE_SERVICE_ROLE_KEY]"
```

**Important:** Look for the `SUPABASE_SERVICE_ROLE_KEY` in your Vercel environment variables. You may need to get it from:
- Vercel Dashboard > Your Project > Settings > Environment Variables
- Or from Supabase Dashboard > Project Settings > API

### Step 2: Get Service Role Key from Supabase

If you can't find the service role key in Vercel:

1. Go to https://supabase.com/dashboard
2. Select your project (supabase-cyan-kite)
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API**
5. Find **service_role** key (secret, never expose to browser)
6. Copy it to your `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 How to Use

### For Customers:
1. Visit `/price-match-request` on your website
2. Fill out the form with competitor information
3. Complete the hCaptcha
4. Submit → Email sent + saved to database

### For Operators:
1. Visit `/admin/price-match-dashboard`
2. View all submissions with full details
3. Search by name, email, product, or competitor
4. Filter by status (All, Pending, Contacted, Approved, Rejected)
5. Click the status dropdown on any submission to update it

---

## 📊 Dashboard Features

### Search & Filter
- Search by customer name, email, product name, or competitor name
- Filter by status to focus on pending requests

### Statistics
- Total requests counter
- Breakdown by status (Pending, Contacted, Approved, Rejected)

### Submission Details
Each submission shows:
- Customer: Name, email, phone
- Product: Name and quantity
- Competitor: Name, price, website link
- Date submitted
- Additional information
- Current status

### Status Management
Change status with one click:
- **Pending** → New submission
- **Contacted** → Customer has been reached
- **Approved** → Price match approved
- **Rejected** → Price match declined

---

## 🔐 Security Notes

**Important:** The dashboard at `/admin/price-match-dashboard` is currently public. You should add authentication before going live.

### Recommended: Add Simple Authentication

We can add password protection later if needed. For now, keep the URL private and only share with your team.

---

## 🧪 Testing the System

### Test the Form:
1. Start your dev server: `cd web && npm run dev`
2. Go to http://localhost:3000/price-match-request
3. Fill out the form with test data
4. Submit

### Test the Dashboard:
1. Go to http://localhost:3000/admin/price-match-dashboard
2. You should see your test submission
3. Try changing the status
4. Try searching and filtering

---

## 📁 Files Created

```
web/
├── lib/
│   └── supabase.ts                         # Supabase client setup
├── app/
│   ├── price-match-request/
│   │   └── page.tsx                        # Public form
│   ├── admin/
│   │   └── price-match-dashboard/
│   │       └── page.tsx                    # Admin dashboard
│   └── api/
│       └── webhooks/
│           └── price-match/
│               └── route.ts                # Webhook to save to DB
└── database-setup.sql                      # Database schema (already run)
```

---

## 🎯 Next Steps (Optional)

### Add Authentication
- Install NextAuth.js
- Protect `/admin/*` routes
- Add login page

### Email Notifications for Status Changes
- Send email when status changes
- Notify customer of approval/rejection

### Export Data
- Add CSV export button
- Generate reports

---

## 🆘 Troubleshooting

### "Database error" when submitting form
- Check that Supabase credentials are in `.env.local`
- Restart dev server after adding credentials: `npm run dev`

### Dashboard shows "No requests found"
- Check Supabase dashboard to verify data is being saved
- Verify the SQL script was run successfully

### Environment variables not loading
- Make sure `.env.local` is in the `/web` folder
- Restart your dev server
- Never commit `.env.local` to git (it's in .gitignore)

---

## 📞 Support

For issues or questions:
- Check Supabase dashboard for database connectivity
- Check Vercel logs for deployment errors
- Verify all environment variables are set correctly

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Add all Supabase credentials to Vercel environment variables
- [ ] Test form submission in production
- [ ] Test dashboard access
- [ ] Add authentication to dashboard (recommended)
- [ ] Update `NEXT_PUBLIC_BASE_URL` in production
- [ ] Test email notifications are working
- [ ] Keep dashboard URL private or add password protection

---

**Dashboard URL:** `https://yourdomain.com/admin/price-match-dashboard`

**Public Form URL:** `https://yourdomain.com/price-match-request`
