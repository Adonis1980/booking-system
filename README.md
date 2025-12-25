# AI Booking System for Home Services

A complete, production-ready booking system for home service businesses built with Next.js, TypeScript, PostgreSQL, and shadcn/ui.

## 🎯 Features

### Customer-Facing Features
- **Service Selection**: Browse and select from multiple home services (Roofing, Plumbing, HVAC, General Maintenance)
- **Easy Booking Form**: Simple, intuitive form to capture customer information
- **Budget Tracking**: Optional budget field for customer cost estimation
- **Notes Support**: Customers can add additional details about their project
- **Real-time Validation**: Form validation with helpful error messages
- **Toast Notifications**: Instant feedback on booking status

### Admin Dashboard
- **Booking Management**: View all bookings in a clean, organized interface
- **Status Filtering**: Filter bookings by status (Pending, Confirmed, Completed, Cancelled)
- **Statistics**: Quick overview of booking metrics
- **Booking Details**: View complete customer information and project details
- **Action Buttons**: Quick actions for managing bookings (View Details, Send Reminder, Update Status)

### Backend Features
- **PostgreSQL Database**: Robust, production-ready database with proper schema
- **Prisma ORM**: Type-safe database access with migrations
- **RESTful API**: Clean API endpoints for booking management
- **Data Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- PostgreSQL 12+ running locally on port 5432
- Environment variables set up

### Installation

1. **Clone and navigate to project**:
```bash
cd /home/code/booking-system
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Copy the example file
cp .env.example .env.local

# Update with your actual values
# DATABASE_URL should be: postgresql://user:password@localhost:5432/booking_system
```

4. **Create database** (if not already created):
```bash
createdb -h localhost -U $PGUSER booking_system
```

5. **Run migrations**:
```bash
export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@localhost:5432/booking_system"
npx prisma migrate dev --name init
```

6. **Generate Prisma Client**:
```bash
npx prisma generate
```

7. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
booking-system/
├── app/
│   ├── api/
│   │   └── bookings/
│   │       └── route.ts          # Booking API endpoints
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main booking page
│   └── globals.css               # Global styles
├── components/
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── scripts/
│   └── seed.js                   # Database seeding script
├── public/                       # Static assets
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment variables template
├── prisma.config.ts              # Prisma configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🗄️ Database Schema

### Service
Represents available home services
- `id`: Unique identifier
- `name`: Service name (e.g., "Roofing")
- `description`: Service description
- `duration`: Service duration in minutes
- `price`: Base price for the service

### Booking
Represents a customer booking
- `id`: Unique identifier
- `serviceId`: Reference to Service
- `customerName`: Customer's full name
- `customerEmail`: Customer's email address
- `customerPhone`: Customer's phone number
- `customerAddress`: Service address
- `scheduledDate`: When the service is scheduled
- `status`: Booking status (pending, confirmed, completed, cancelled)
- `budget`: Customer's budget (optional)
- `notes`: Additional notes from customer
- `emailSent`: Whether 48hr reminder email was sent
- `smsSent`: Whether 1hr reminder SMS was sent
- `createdAt`: Booking creation timestamp
- `completedAt`: When the service was completed

### Availability
Tracks available time slots for each service
- `id`: Unique identifier
- `serviceId`: Reference to Service
- `dayOfWeek`: Day of week (0-6, Sunday-Saturday)
- `startTime`: Start time (HH:mm format)
- `endTime`: End time (HH:mm format)
- `isAvailable`: Whether this slot is available

### TeamMember
Represents team members who handle bookings
- `id`: Unique identifier
- `name`: Team member name
- `email`: Email address
- `phone`: Phone number
- `role`: Role (technician, manager, subcontractor)
- `isActive`: Whether the member is active

### Review
Post-appointment reviews and upsell tracking
- `id`: Unique identifier
- `bookingId`: Reference to Booking
- `rating`: Star rating (1-5)
- `comment`: Review comment
- `upsellOffered`: Whether upsell was offered
- `upsellAccepted`: Whether customer accepted upsell

## 🔌 API Endpoints

### POST /api/bookings
Create a new booking

**Request Body**:
```json
{
  "serviceId": "string",
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "customerAddress": "string",
  "budget": "number (optional)",
  "notes": "string (optional)"
}
```

**Response** (201 Created):
```json
{
  "id": "string",
  "serviceId": "string",
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "customerAddress": "string",
  "scheduledDate": "ISO 8601 datetime",
  "status": "pending",
  "budget": "number or null",
  "notes": "string or null",
  "emailSent": false,
  "smsSent": false,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "completedAt": null,
  "service": {
    "id": "string",
    "name": "string",
    "description": "string",
    "duration": "number",
    "price": "number"
  }
}
```

### GET /api/bookings
Retrieve all bookings (admin endpoint)

**Response** (200 OK):
```json
[
  {
    "id": "string",
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "customerAddress": "string",
    "status": "string",
    "scheduledDate": "ISO 8601 datetime",
    "budget": "number or null",
    "notes": "string or null",
    "createdAt": "ISO 8601 datetime",
    "service": {
      "name": "string",
      "duration": "number"
    }
  }
]
```

## 🎨 UI Components

The application uses **shadcn/ui** components for a professional, accessible interface:

- **Button**: Primary and secondary action buttons
- **Card**: Content containers with header, title, and content
- **Input**: Text input fields with validation
- **Label**: Form labels
- **Textarea**: Multi-line text input
- **Badge**: Status indicators
- **Tabs**: Filtering and navigation
- **Toast**: Notifications (via Sonner)

## 🔐 Security Considerations

### Current Implementation
- ✅ Server-side validation for all inputs
- ✅ Type-safe database queries with Prisma
- ✅ Environment variables for sensitive data
- ✅ CORS headers configured

### Recommended Enhancements
- 🔒 Add authentication for admin dashboard
- 🔒 Implement rate limiting on API endpoints
- 🔒 Add CSRF protection
- 🔒 Validate email addresses with verification
- 🔒 Encrypt sensitive customer data
- 🔒 Add audit logging for all changes

## 📧 Email & SMS Integration (TODO)

The system is designed to support automated communications:

### 48-Hour Email Reminder
- Sent 48 hours before scheduled appointment
- Includes booking details and confirmation link
- Allows customer to reschedule

### 1-Hour SMS Reminder
- Sent 1 hour before appointment
- Quick confirmation or cancellation option
- Reduces no-shows

### Implementation Options
- **Email**: Resend, SendGrid, AWS SES, Mailgun
- **SMS**: Twilio, AWS SNS, Vonage

## 🤖 AI Integration (TODO)

The system is designed to integrate with AI services:

### Customer Qualification
- AI chatbot to qualify leads
- Automatic budget estimation
- Service recommendation based on customer needs

### Team Notifications
- Automated alerts to team members
- Smart scheduling based on availability
- Conflict detection and resolution

### Post-Appointment
- Automated review requests
- Upsell recommendations
- Follow-up scheduling

### Integration Options
- **Lindy.ai**: AI workflow automation
- **Zapier**: Connect to 5000+ apps
- **Make**: Advanced automation workflows
- **Custom API**: Build your own AI integration

## 📊 Analytics & Reporting (TODO)

Recommended additions:
- Booking conversion rates
- Average booking value
- Customer satisfaction metrics
- Team performance tracking
- Revenue forecasting
- Seasonal trends

## 🚀 Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- AWS Amplify
- Netlify
- Railway
- Render
- DigitalOcean

## 📝 Environment Variables

Create `.env.local` with:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/booking_system"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Home Services Booking"

# Optional: Email Service
RESEND_API_KEY="your_resend_key"

# Optional: SMS Service
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"

# Optional: AI Service
LINDY_API_KEY="your_lindy_key"
```

## 🧪 Testing

### Manual Testing
1. Navigate to `http://localhost:3000`
2. Select a service
3. Fill in customer information
4. Submit booking
5. Check admin dashboard at `/admin`

### API Testing
Use curl or Postman to test endpoints:
```bash
# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "roofing",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "(555) 123-4567",
    "customerAddress": "123 Main St, City, State 12345"
  }'

# Get all bookings
curl http://localhost:3000/api/bookings
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -h localhost -U $PGUSER -d booking_system -c "SELECT 1"

# Reset database
dropdb -h localhost -U $PGUSER booking_system
createdb -h localhost -U $PGUSER booking_system
npx prisma migrate dev --name init
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Check schema
npx prisma validate

# View database
npx prisma studio
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your business

## 🎯 Next Steps

1. **Add Authentication**: Protect admin dashboard with login
2. **Email Integration**: Set up Resend or SendGrid for confirmations
3. **SMS Reminders**: Integrate Twilio for appointment reminders
4. **Payment Processing**: Add Stripe for deposits/payments
5. **Calendar Sync**: Integrate with Google Calendar or Outlook
6. **Analytics**: Add tracking and reporting
7. **Mobile App**: Build React Native or Flutter app
8. **AI Chatbot**: Integrate Lindy.ai for customer qualification

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check Next.js and Prisma documentation
4. Open an issue on GitHub

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and shadcn/ui**
