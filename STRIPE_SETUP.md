# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payment processing for the booking system.

## 🎯 What's Included

✅ **Payment Processing**
- Create payment intents for deposits and full payments
- Secure card processing with Stripe Elements
- Payment status tracking

✅ **Webhook Handling**
- Automatic payment confirmation
- Refund processing
- Payment failure handling

✅ **Database Integration**
- Payment records with Stripe IDs
- Payment history tracking
- Booking status updates

✅ **User Interface**
- Professional payment form
- Payment type selection (deposit/full)
- Confirmation page

## 📋 Prerequisites

- Stripe account (free at [stripe.com](https://stripe.com))
- API keys from Stripe dashboard
- Node.js and npm installed

## 🔧 Step-by-Step Setup

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Sign up"
3. Enter your email and create account
4. Verify your email
5. Complete account setup

### Step 2: Get API Keys

1. Log in to Stripe Dashboard
2. Go to **Developers** → **API Keys**
3. You'll see two keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

⚠️ **IMPORTANT**: Never share your Secret Key!

### Step 3: Add Environment Variables

Add to `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Replace with your actual keys from Stripe Dashboard.

### Step 4: Set Up Webhook

Webhooks allow Stripe to notify your app of payment events.

**Local Development (using Stripe CLI)**:

1. Download Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl https://files.stripe.com/stripe-cli/install.sh -O
bash install.sh

# Windows
choco install stripe
```

3. Authenticate with Stripe:
```bash
stripe login
```

4. Forward webhook events to your local app:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

5. Copy the webhook signing secret and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Production Deployment**:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Enter your production URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret to production environment

### Step 5: Test Payment Processing

**Test Card Numbers** (use in development):

```
Visa:           4242 4242 4242 4242
Visa (debit):   4000 0566 5566 5556
Mastercard:     5555 5555 5555 4444
American Express: 3782 822463 10005
```

**Expiry**: Any future date (e.g., 12/25)
**CVC**: Any 3 digits (e.g., 123)

### Step 6: Test the Payment Flow

1. Start your app:
```bash
npm run dev
```

2. In another terminal, start Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Navigate to http://localhost:3000
4. Create a booking
5. You'll be redirected to payment page
6. Enter test card details
7. Click "Pay"
8. Check Stripe Dashboard for payment confirmation

## 📊 Payment Flow

```
1. Customer creates booking
   ↓
2. Redirected to /payment?bookingId=xxx
   ↓
3. Selects payment type (deposit or full)
   ↓
4. Enters card details
   ↓
5. Clicks "Pay"
   ↓
6. Frontend creates Payment Intent via /api/payments
   ↓
7. Stripe processes payment
   ↓
8. Webhook notifies /api/webhooks/stripe
   ↓
9. Payment status updated in database
   ↓
10. Booking status updated to "confirmed"
   ↓
11. Redirected to /confirmation page
```

## 💳 Payment Types

### Deposit Payment (50%)
- Customer pays 50% of service price upfront
- Remaining balance due at service time
- Booking status: "pending" → "confirmed" (after deposit)

### Full Payment
- Customer pays 100% upfront
- Booking status: "pending" → "confirmed" (immediately)
- No balance due

## 🔐 Security Features

✅ **PCI Compliance**
- Card data never touches your server
- Stripe Elements handles card input
- Stripe manages PCI compliance

✅ **Webhook Verification**
- All webhooks verified with signing secret
- Prevents unauthorized payment updates

✅ **Environment Variables**
- Secret keys stored in environment
- Never committed to version control

✅ **HTTPS Only**
- All payment requests use HTTPS
- Secure data transmission

## 📱 API Endpoints

### POST /api/payments
Creates a payment intent

**Request**:
```json
{
  "bookingId": "clx123...",
  "amount": 150.00,
  "paymentType": "deposit"
}
```

**Response**:
```json
{
  "clientSecret": "pi_test_...",
  "paymentId": "clx456...",
  "amount": 150.00,
  "paymentType": "deposit"
}
```

### PUT /api/payments
Confirms a payment

**Request**:
```json
{
  "paymentIntentId": "pi_test_...",
  "paymentId": "clx456..."
}
```

**Response**:
```json
{
  "success": true,
  "payment": { ... },
  "message": "Payment confirmed successfully"
}
```

### POST /api/webhooks/stripe
Handles Stripe webhook events

**Events handled**:
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Payment refunded

## 🧪 Testing Scenarios

### Successful Payment
1. Use card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Payment should succeed

### Failed Payment
1. Use card: `4000 0000 0000 0002`
2. Payment should fail
3. Error message displayed

### Declined Card
1. Use card: `4000 0000 0000 0069`
2. Payment declined
3. Customer can retry

## 📊 Monitoring Payments

### Stripe Dashboard
1. Go to **Payments** section
2. View all payment intents
3. Check payment status
4. View customer details
5. Process refunds if needed

### Database
```bash
# View all payments
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM \"Payment\";"

# View payments for specific booking
psql -h localhost -U $PGUSER -d booking_system -c "SELECT * FROM \"Payment\" WHERE \"bookingId\" = 'xxx';"

# View payment statistics
psql -h localhost -U $PGUSER -d booking_system -c "SELECT status, COUNT(*) FROM \"Payment\" GROUP BY status;"
```

## 🔄 Refund Processing

### Manual Refund (via Stripe Dashboard)
1. Go to **Payments**
2. Click on payment
3. Click "Refund"
4. Enter refund amount
5. Confirm refund

### Automatic Refund (via API)
```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmount, // in cents
})
```

## 🚀 Production Deployment

### Before Going Live

- [ ] Switch to live API keys (remove "test" from keys)
- [ ] Set up production webhook endpoint
- [ ] Enable 3D Secure for additional security
- [ ] Configure email notifications
- [ ] Set up payment failure handling
- [ ] Test with real card (small amount)
- [ ] Monitor first transactions closely
- [ ] Set up alerts for failed payments

### Environment Variables (Production)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_live_your_webhook_secret
```

## 📞 Support & Troubleshooting

### Common Issues

**"Invalid API Key"**
- Check key format (should start with `pk_` or `sk_`)
- Verify key is copied correctly
- Check environment variable name

**"Webhook signature verification failed"**
- Verify webhook secret is correct
- Check webhook secret matches Stripe Dashboard
- Ensure raw body is used for verification

**"Payment intent not found"**
- Check bookingId is correct
- Verify payment was created successfully
- Check database for payment record

**"Card declined"**
- Use test card numbers from Stripe docs
- Check card expiry date
- Verify CVC is correct

### Debug Mode

Enable Stripe debug logging:

```typescript
// In your payment API route
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  // Enable debug logging
  httpClient: new Stripe.HttpClient({
    timeout: 30000,
  }),
})
```

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

## 🎓 Next Steps

1. ✅ Set up Stripe account and get API keys
2. ✅ Add environment variables
3. ✅ Set up webhook with Stripe CLI
4. ✅ Test payment flow with test cards
5. ✅ Deploy to production
6. ✅ Switch to live API keys
7. ✅ Monitor payments in Stripe Dashboard
8. ✅ Set up email notifications
9. ✅ Implement refund handling
10. ✅ Add payment analytics

---

**Payment processing is now ready! 💳**
