# Hall of Prints - Vercel Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/Aresh85/hallofprint
- Vercel account (sign up at https://vercel.com)
- Sanity project credentials
- Stripe API keys

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and the `hallofprint` repository
4. Vercel will auto-detect it's a Next.js project

### 2. Configure Project Settings

**Root Directory:** `web`
- Set this in the Vercel import settings
- This is CRITICAL since your Next.js app is in the `web` folder

**Build & Development Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

### 3. Environment Variables

Add these environment variables in Vercel Project Settings → Environment Variables:

#### Required Variables:

**Sanity Configuration:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

**Stripe Configuration:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Application URL:**
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```
(Update this after first deployment with your actual Vercel URL)

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (first build takes 2-3 minutes)
3. Once deployed, update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
4. Redeploy to apply the URL change

### 5. Post-Deployment Setup

#### Update Stripe Webhook URL
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks`
3. Select events: `checkout.session.completed`

#### Update Sanity CORS
1. Go to Sanity Studio → API → CORS Origins
2. Add your Vercel URL: `https://your-app.vercel.app`

## Deploying Sanity Studio

The Sanity Studio in the `studio` folder can be deployed separately:

### Option 1: Sanity Cloud (Recommended)
```bash
cd studio
npm run deploy
```

### Option 2: Separate Vercel Deployment
1. Create a new Vercel project
2. Set Root Directory to `studio`
3. Deploy

## Environment Variables Reference

### Development (.env.local)
Your local `.env.local` file should contain:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Vercel)
Same variables as above, but with production URLs and keys.

## Troubleshooting

### Build Fails
- Ensure Root Directory is set to `web`
- Check that all environment variables are set
- Review build logs for specific errors

### Pages Don't Load
- Verify `NEXT_PUBLIC_BASE_URL` is correct
- Check browser console for errors
- Ensure Sanity CORS settings include your Vercel URL

### Stripe Checkout Fails
- Verify Stripe keys are correct (pk_test/pk_live for publishable, sk_test/sk_live for secret)
- Check `NEXT_PUBLIC_BASE_URL` matches your Vercel URL
- Test with Stripe test cards

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
5. Update Stripe and Sanity CORS settings

## Monitoring

- View deployment logs: Vercel Dashboard → Deployments
- Monitor errors: Vercel Dashboard → Analytics
- Check runtime logs: Vercel Dashboard → Functions

## Support

For issues:
- Vercel Support: https://vercel.com/support
- Sanity Support: https://www.sanity.io/help
- Stripe Support: https://support.stripe.com
