# Vercel Deployment Guide - AI Booking System (Neon/Railway Edition)

Complete step-by-step guide to deploy your booking system to Vercel using Neon or Railway as your database.

## 🚀 Quick Deployment (5 minutes)

### Step 1: Push Code to GitHub

```bash
cd /home/code/booking-system

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Booking System with Stripe Integration"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/booking-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" (or sign in if you have account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Click "Import Project"
6. Select your `booking-system` repository
7. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Home Services Booking
```

### Step 4: Deploy

Click "Deploy" - Vercel will automatically:
- Build your Next.js app
- Run migrations
- Deploy to production
- Provide you with a live URL

## 📋 Prerequisites

Before deploying, you need:

1. **GitHub Account** - [github.com](https://github.com)
2. **Vercel Account** - [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - Use **Neon** or **Railway** (both have great free tiers)
4. **Stripe Account** - [stripe.com](https://stripe.com)

## 🗄️ Database Setup Option 1: Neon (Recommended)

Neon is a serverless PostgreSQL database that works perfectly with Vercel.

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project
4. In the dashboard, copy the **Connection String** (ensure it's the pooled connection if available)
5. Use this as your `DATABASE_URL` in Vercel.

## 🗄️ Database Setup Option 2: Railway

Railway is another excellent choice for hosting PostgreSQL.

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Once created, click on the PostgreSQL service
5. Go to **Variables** and copy the `DATABASE_URL`
6. Use this as your `DATABASE_URL` in Vercel.

## 🔐 Stripe Setup for Production

### Get Live API Keys

1. Log in to Stripe Dashboard
2. Go to **Developers** → **API Keys**
3. Toggle "View test data" to OFF
4. Copy live keys (start with `pk_live_` and `sk_live_`)
5. Add to Vercel environment variables

### Set Up Production Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Enter your Vercel URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Visit your live URL
- [ ] Test booking form
- [ ] Test payment flow with test card
- [ ] Check admin dashboard
- [ ] Verify database connection
- [ ] Test webhook with Stripe CLI
- [ ] Set up custom domain (optional)

## 🚨 Troubleshooting

### Build Fails

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correct.
- Ensure `?sslmode=require` is at the end of your connection string if using Neon.
- Check if your database provider requires IP whitelisting (Neon usually doesn't).

**Error: "Prisma schema validation"**
- Ensure your `prisma/schema.prisma` is up to date.
- Run `npx prisma generate` locally before pushing if you made changes.

---

**Questions?** Check the documentation files:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Local setup
- `STRIPE_SETUP.md` - Stripe configuration
- `DEPLOYMENT.md` - Deployment details
