# Deployment Guide

This guide covers deploying the booking system to production.

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
DATABASE_URL=postgresql://user:password@host:5432/booking_system
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

### Option 1: Managed PostgreSQL (Recommended)

**Using Supabase** (Free tier available):
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables as `DATABASE_URL`

**Using Railway**:
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Add to Vercel environment variables

**Using AWS RDS**:
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Copy connection string
4. Add to Vercel environment variables

### Option 2: Self-Hosted PostgreSQL

```bash
# On your server
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb booking_system

# Create user
sudo -u postgres createuser booking_user
sudo -u postgres psql -c "ALTER USER booking_user WITH PASSWORD 'secure_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE booking_system TO booking_user;"
```

## 🔐 Security Checklist

### Before Deploying
- [ ] Remove all hardcoded secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable authentication
- [ ] Set up logging
- [ ] Configure backups
- [ ] Test error handling
- [ ] Review security headers

### Security Headers
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 📊 Monitoring & Logging

### Set Up Error Tracking
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Set Up Analytics
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📈 Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image'

export default function Hero() {
  return (
    <Image
      src="/hero.png"
      alt="Hero"
      width={1200}
      height={600}
      priority
      quality={80}
    />
  )
}
```

### Code Splitting
```typescript
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('@/app/admin/page'), {
  loading: () => <p>Loading...</p>,
})
```

### Database Query Optimization
```typescript
// Use indexes
// Use pagination
// Cache frequently accessed data
// Use connection pooling
```

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Using pg_dump
pg_dump -h localhost -U booking_user booking_system > backup.sql

# Restore from backup
psql -h localhost -U booking_user booking_system < backup.sql
```

### Backup Strategy
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures monthly

## 📞 Support & Maintenance

### Monitoring Checklist
- [ ] Check error logs daily
- [ ] Monitor database performance
- [ ] Review API response times
- [ ] Check email delivery rates
- [ ] Monitor SMS delivery
- [ ] Review security logs
- [ ] Check disk space
- [ ] Verify backups

### Maintenance Tasks
- Update dependencies monthly
- Review and patch security vulnerabilities
- Optimize database queries
- Clean up old logs
- Archive old data
- Test disaster recovery

## 🚨 Troubleshooting Production Issues

### Database Connection Issues
```bash
# Check connection
psql -h your-host -U your-user -d booking_system -c "SELECT 1"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### High Memory Usage
```bash
# Check Node.js memory
node --max-old-space-size=4096 server.js

# Profile with clinic.js
npm install -g clinic
clinic doctor -- node server.js
```

### Slow API Responses
```bash
# Enable query logging
export DATABASE_URL="postgresql://...?log_statement=all"

# Check slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
```

## 📋 Post-Deployment Checklist

- [ ] Test all booking flows
- [ ] Verify email sending
- [ ] Test SMS delivery
- [ ] Check admin dashboard
- [ ] Verify API endpoints
- [ ] Test error handling
- [ ] Check performance metrics
- [ ] Review security headers
- [ ] Test on mobile devices
- [ ] Verify analytics tracking
- [ ] Check SSL certificate
- [ ] Test backup/restore
- [ ] Document deployment
- [ ] Set up monitoring alerts

## 🎯 Next Steps

1. **Monitor Performance**: Watch metrics for first week
2. **Gather Feedback**: Collect user feedback
3. **Optimize**: Make improvements based on data
4. **Scale**: Add features from roadmap
5. **Market**: Promote your booking system

---

**Deployment complete! 🎉**
