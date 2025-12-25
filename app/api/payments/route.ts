/**
 * POST /api/payments
 * 
 * Creates a Stripe Payment Intent for a booking
 * 
 * Request body:
 * - bookingId: string (ID of the booking)
 * - amount: number (Amount in dollars, e.g., 50 for $50.00)
 * - paymentType: string (deposit or full)
 * 
 * Response:
 * - Returns clientSecret for Stripe payment form
 * - Status 200 on success
 * - Status 400 on validation error
 * - Status 500 on server error
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { bookingId, amount, paymentType = 'deposit' } = body

    // Validate required fields
    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 400 }
      )
    }

    // Create Stripe Payment Intent
    // Amount should be in cents (e.g., 5000 for $50.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId,
        paymentType,
        customerEmail: booking.customerEmail,
        serviceName: booking.service.name,
      },
      description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment for ${booking.service.name} - ${booking.customerName}`,
    })

    // Create Payment record in database
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: amount.toString(),
        currency: 'usd',
        status: 'pending',
        paymentType,
        stripePaymentIntentId: paymentIntent.id,
        description: `${paymentType} payment for ${booking.service.name}`,
      },
    })

    // Return client secret for frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount,
      paymentType,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/payments/confirm
 * 
 * Confirms a payment after Stripe processing
 * Called by webhook or client after successful payment
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, paymentId } = body

    if (!paymentIntentId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Update payment status in database
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'succeeded',
          stripeChargeId: paymentIntent.charges.data[0]?.id || null,
          paidAt: new Date(),
        },
        include: { booking: true },
      })

      // Update booking status if full payment
      if (payment.paymentType === 'full') {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'confirmed' },
        })
      }

      return NextResponse.json({
        success: true,
        payment,
        message: 'Payment confirmed successfully',
      })
    } else if (paymentIntent.status === 'processing') {
      return NextResponse.json({
        success: false,
        message: 'Payment is still processing',
      })
    } else {
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
