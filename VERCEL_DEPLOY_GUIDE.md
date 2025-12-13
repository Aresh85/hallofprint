# 🚀 Vercel Deployment Guide - Hall of Prints

## Step-by-Step Deployment to Vercel

### Prerequisites:
- ✅ Git repository pushed to GitHub
- ✅ Vercel account (free tier works!)
- ✅ Environment variables ready

---

## Step 1: Go to Vercel

1. Visit: https://vercel.com
2. Sign up or log in with GitHub
3. Click "Add New" → "Project"

---

## Step 2: Import Your Repository

1. Select "hallofprint" repository from the list
2. Click "Import"

---

## Step 3: Configure Project

### **Root Directory:**
Set to: `web`

⚠️ **IMPORTANT:** Your Next.js app is in the `web` folder, not root!

### **Framework Preset:**
- Should auto-detect: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## Step 4: Add Environment Variables

Click "Environment Variables" and add these:

### **Sanity Configuration:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
```

### **Supabase Configuration:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Stripe Configuration:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### **Optional - Email:**
```
RESEND_API_KEY=your-resend-key (if using Resend)
```

**Where to find these values:**
- Copy from your local `web/.env.local` file
- Or get fresh keys from respective dashboards

---

## Step 5: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. ✅ Your site will be live!

---

## Step 6: Get Your URLs

Vercel will give you:
- **Production URL:** `your-project.vercel.app`
- **Custom Domain:** (add your own later)

---

## Step 7: Configure Sanity CORS

1. Go to: https://sanity.io/manage
2. Select your project
3. Go to "API" → "CORS Origins"
4. Click "Add CORS Origin"
5. Add your Vercel URL: `https://your-project.vercel.app`
6. Allow credentials: ✓
7. Click "Save"

---

## Step 8: Test Your Deployment

Visit these URLs:
- Homepage: `https://your-project.vercel.app`
- Products: `https://your-project.vercel.app/products`
- Account: `https://your-project.vercel.app/account`

Test:
- ✅ Products load correctly
- ✅ Authentication works
- ✅ Cart functionality
- ✅ Product configurator

---

## 🔄 Automatic Deployments

**Every time you push to GitHub:**
- Vercel automatically deploys
- New preview URL for each branch
- Production deploys from `main` branch

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add new products"
git push origin main

# Vercel auto-deploys in 2-3 minutes!
```

---

## 🎯 Post-Deployment Checklist

### Immediate:
- [ ] Add Sanity CORS for Vercel URL
- [ ] Test product pages
- [ ] Test authentication
- [ ] Test cart and checkout
- [ ] Verify Stripe webhooks

### This Week:
- [ ] Add custom domain
- [ ] Set up Vercel Analytics
- [ ] Configure error monitoring
- [ ] Set up preview deployments

### Later:
- [ ] Add Vercel Speed Insights
- [ ] Configure caching rules
- [ ] Set up staging environment
- [ ] Add monitoring/alerts

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in .gitignore
2. **Use environment variables** - All secrets in Vercel dashboard
3. **Rotate keys regularly** - Stripe, Supabase, Sanity
4. **Enable Vercel authentication** - For preview deployments
5. **Use HTTPS only** - Vercel handles this automatically

---

## ⚡ Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Serverless functions

**Result:** Fast loading worldwide! 🚀

---

## 🆘 Troubleshooting

### Build Fails:
```bash
# Test build locally first
cd web
npm run build

# If successful locally, check:
- Environment variables in Vercel
- Root directory set to "web"
- Node version (use latest LTS)
```

### Products Not Showing:
- Check Sanity CORS includes Vercel URL
- Verify SANITY_PROJECT_ID is correct
- Check Sanity dataset is "production"

### Authentication Issues:
- Verify Supabase URL and keys
- Check Supabase redirect URLs include Vercel
- Test auth in incognito mode

### Stripe Not Working:
- Verify webhook endpoint in Stripe dashboard
- Add Vercel URL to webhook URLs
- Check Stripe keys are for correct mode (test/live)

---

## 📊 Vercel Dashboard Features

### **Deployments:**
- View all deployments
- Rollback to previous versions
- View build logs

### **Analytics:**
- Page views
- User behavior
- Performance metrics

### **Domains:**
- Add custom domains
- Configure DNS
- SSL certificates (automatic)

### **Settings:**
- Environment variables
- Build settings
- Team access

---

## 💰 Pricing

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

**More than enough for starting!**

---

## 🎉 Success!

Once deployed, your site will be:
- ✅ Live and accessible worldwide
- ✅ HTTPS secure automatically
- ✅ Auto-deployed on every push
- ✅ Fast with global CDN
- ✅ Monitored and backed up

---

## 📞 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Documentation:** https://vercel.com/docs
**Support:** https://vercel.com/support

**Your URLs (after deployment):**
- Production: `https://your-project.vercel.app`
- GitHub: `https://github.com/Aresh85/hallofprint`
- Sanity Studio: `http://localhost:3333` (local)

---

## 🚀 Next Steps After Deployment

1. **Create Categories** - Use Quick Start guide
2. **Add First 5 Products** - Follow QUICK_START_ECOMMERCE.md
3. **Add Product Images** - Upload to Sanity
4. **Test Thoroughly** - All features work live
5. **Share Your Site** - Send Vercel URL to team
6. **Add Custom Domain** - (optional) yoursite.com

---

**Congratulations! Your print shop is now live! 🎉**
