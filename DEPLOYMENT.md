# Deployment Guide

This guide covers deploying the booking system to production using Vercel and Neon/Railway.

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: AI Booking System"
git remote add origin https://github.com/yourusername/booking-system.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Set Environment Variables
In Vercel dashboard, add:
```
DATABASE_URL=postgresql://user:password@host:5432/booking_system?sslmode=require
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Home Services Booking
RESEND_API_KEY=your_resend_key (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
TWILIO_PHONE_NUMBER=+1234567890 (optional)
```

### Step 4: Deploy
Click "Deploy" - Vercel will automatically build and deploy your app!

## 🗄️ Database Setup for Production

### Option 1: Neon (Recommended)

**Using Neon** (Free tier available):
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string (ensure `?sslmode=require` is included)
4. Add to Vercel environment variables as `DATABASE_URL`

### Option 2: Railway

**Using Railway**:
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string from the Variables tab
4. Add to Vercel environment variables as `DATABASE_URL`

## 🔐 Security Checklist

### Before Deploying
- [ ] Remove all hardcoded secrets
- [ ] Enable HTTPS/SSL (Vercel handles this)
- [ ] Set up environment variables
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable authentication
- [ ] Set up logging
- [ ] Configure backups
- [ ] Test error handling

---

**Deployment complete! 🎉**
