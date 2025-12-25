# AI Booking System - Complete Setup Guide

This guide walks you through setting up the home services booking system from scratch.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- PostgreSQL 12+ running locally
- npm or bun package manager
- A code editor (VS Code recommended)

## 🔧 Step-by-Step Setup

### Step 1: Database Setup

**Create the database**:
```bash
createdb -h localhost -U $PGUSER booking_system
```

**Verify connection**:
```bash
psql -h localhost -U $PGUSER -d booking_system -c "SELECT 1"
```

### Step 2: Environment Variables

**Create `.env.local` file**:
```bash
cat > .env.local << 'ENVEOF'
DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@localhost:5432/booking_system"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Home Services Booking"
ENVEOF
```

**Replace placeholders**:
- `$PGUSER`: Your PostgreSQL username
- `$PGPASSWORD`: Your PostgreSQL password

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14+ with App Router
- React 18+
- TypeScript
- Prisma ORM
- shadcn/ui components
- Tailwind CSS
- date-fns for date formatting
- Sonner for toast notifications

### Step 4: Database Migrations

**Run Prisma migrations**:
```bash
export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@localhost:5432/booking_system"
npx prisma migrate dev --name init
```

This creates all database tables:
- `Service` - Available services
- `Booking` - Customer bookings
- `Availability` - Time slots
- `TeamMember` - Team members
- `Review` - Post-appointment reviews

**Generate Prisma Client**:
```bash
npx prisma generate
```

### Step 5: Seed Database (Optional)

To populate initial services and team members:

```bash
export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@localhost:5432/booking_system"
node scripts/seed.js
```

This creates:
- 4 default services (Roofing, Plumbing, HVAC, General Maintenance)
- Availability slots (Monday-Friday, 9am-5pm)
- 3 sample team members

### Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Customer Booking**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## 🎯 First Steps After Setup

### 1. Test the Booking Form
1. Navigate to http://localhost:3000
2. Select a service (e.g., "Roofing")
3. Fill in customer information
4. Click "Request Booking"
5. You should see a success message

### 2. View Admin Dashboard
1. Navigate to http://localhost:3000/admin
2. You should see all bookings in a table
3. Filter by status using the tabs
4. View booking details

### 3. Check Database
```bash
# View all bookings
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM \"Booking\";"

# View all services
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM \"Service\";"

# View team members
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM \"TeamMember\";"
```

## 📦 Project Structure

```
booking-system/
├── app/                          # Next.js App Router
│   ├── api/bookings/route.ts     # API endpoints
│   ├── admin/page.tsx            # Admin dashboard
│   ├── page.tsx                  # Main booking page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/ui/                # shadcn/ui components
├── lib/
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── scripts/
│   └── seed.js                   # Database seeding
├── public/                       # Static files
├── .env.local                    # Environment variables
├── .env.example                  # Environment template
├── prisma.config.ts              # Prisma config
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── README.md                      # Main documentation
└── SETUP_GUIDE.md               # This file
```

## 🚀 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Validate schema
npx prisma validate
```

## 🔌 API Endpoints

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "serviceId": "roofing",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "(555) 123-4567",
  "customerAddress": "123 Main St, City, State 12345",
  "budget": 5000,
  "notes": "Need roof inspection"
}
```

### Get All Bookings
```bash
GET /api/bookings
```

## 🔐 Security Setup

### Current Security
- ✅ Server-side validation
- ✅ Type-safe database queries
- ✅ Environment variables for secrets
- ✅ CORS headers configured

### Recommended Enhancements

**1. Add Authentication**:
```bash
npm install next-auth
```

**2. Add Rate Limiting**:
```bash
npm install @upstash/ratelimit
```

**3. Add Input Sanitization**:
```bash
npm install zod
```

**4. Add CSRF Protection**:
```bash
npm install csrf
```

## 📧 Email Integration Setup

### Using Resend (Recommended)

1. **Sign up at [Resend.com](https://resend.com)**

2. **Install Resend**:
```bash
npm install resend
```

3. **Add API key to `.env.local`**:
```bash
RESEND_API_KEY="your_api_key_here"
```

4. **Create email template** (`lib/emails/booking-confirmation.tsx`):
```typescript
export const BookingConfirmationEmail = ({ customerName, serviceName, date }) => (
  <div>
    <h1>Booking Confirmed!</h1>
    <p>Hi {customerName},</p>
    <p>Your {serviceName} booking is confirmed for {date}.</p>
  </div>
)
```

5. **Send email in API route**:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'bookings@homeservices.com',
  to: customerEmail,
  subject: 'Booking Confirmed',
  react: BookingConfirmationEmail({ customerName, serviceName, date })
})
```

### Using SendGrid

1. **Sign up at [SendGrid.com](https://sendgrid.com)**

2. **Install SendGrid**:
```bash
npm install @sendgrid/mail
```

3. **Add API key to `.env.local`**:
```bash
SENDGRID_API_KEY="your_api_key_here"
```

4. **Send email**:
```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: customerEmail,
  from: 'bookings@homeservices.com',
  subject: 'Booking Confirmed',
  html: '<h1>Booking Confirmed!</h1>'
})
```

## 📱 SMS Integration Setup

### Using Twilio

1. **Sign up at [Twilio.com](https://www.twilio.com)**

2. **Install Twilio**:
```bash
npm install twilio
```

3. **Add credentials to `.env.local`**:
```bash
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

4. **Send SMS**:
```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

await client.messages.create({
  body: 'Your appointment is in 1 hour',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: customerPhone
})
```

## 🤖 AI Integration Setup

### Using Lindy.ai

1. **Sign up at [Lindy.ai](https://lindy.ai)**

2. **Create AI workflow for customer qualification**

3. **Add API key to `.env.local`**:
```bash
LINDY_API_KEY="your_api_key"
```

4. **Call AI workflow**:
```typescript
const response = await fetch('https://api.lindy.ai/workflows/your-workflow-id/run', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LINDY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerName: formData.name,
    customerEmail: formData.email,
    serviceType: selectedService
  })
})
```

### Using Zapier

1. **Sign up at [Zapier.com](https://zapier.com)**

2. **Create Zap**: Webhook → Send Email/SMS

3. **Add webhook URL to booking API**:
```typescript
// In POST /api/bookings
await fetch('https://hooks.zapier.com/hooks/catch/your-webhook-id/', {
  method: 'POST',
  body: JSON.stringify(booking)
})
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create booking with all fields
- [ ] Create booking with optional fields empty
- [ ] Try invalid email format
- [ ] Try invalid phone format
- [ ] Submit without selecting service
- [ ] View admin dashboard
- [ ] Filter bookings by status
- [ ] Check database directly

### API Testing with curl

```bash
# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "roofing",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "(555) 123-4567",
    "customerAddress": "123 Test St"
  }'

# Get all bookings
curl http://localhost:3000/api/bookings
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution**:
```bash
npm install
npx prisma generate
```

### Issue: "Database connection refused"
**Solution**:
```bash
# Check PostgreSQL is running
psql -h localhost -U $PGUSER -d postgres -c "SELECT 1"

# Check DATABASE_URL is correct
echo $DATABASE_URL
```

### Issue: "Migration failed"
**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually fix and create new migration
npx prisma migrate dev --name fix_schema
```

### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Next Steps

1. **Customize Services**: Edit services in database or seed script
2. **Add Email Integration**: Set up Resend or SendGrid
3. **Add SMS Reminders**: Integrate Twilio
4. **Add Authentication**: Protect admin dashboard
5. **Add Payment Processing**: Integrate Stripe
6. **Deploy to Production**: Use Vercel, Railway, or other platform

## 📞 Support

If you encounter issues:

1. **Check logs**:
```bash
# View server logs
tail -f server.log

# View database logs
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM pg_stat_statements;"
```

2. **Check database**:
```bash
npx prisma studio
```

3. **Review code comments**: All code is heavily commented

4. **Check documentation**: See README.md for more details

---

**Happy booking! 🎉**
