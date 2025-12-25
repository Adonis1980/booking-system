/**
 * POST /api/webhooks/stripe
 * 
 * Handles Stripe webhook events
 * Verifies webhook signature and processes payment events
 * 
 * Events handled:
 * - payment_intent.succeeded - Payment completed successfully
 * - payment_intent.payment_failed - Payment failed
 * - charge.refunded - Payment refunded
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 * Updates payment status and booking confirmation
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId
    const paymentType = paymentIntent.metadata.paymentType

    // Find payment by Stripe Payment Intent ID
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { booking: true },
    })

    if (!payment) {
      console.log(`Payment not found for intent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        stripeChargeId: paymentIntent.charges.data[0]?.id || null,
        paidAt: new Date(),
      },
    })

    // Update booking status if full payment
    if (paymentType === 'full') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' },
      })
    }

    console.log(`Payment succeeded for booking: ${bookingId}`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

/**
 * Handle failed payment
 * Updates payment status and notifies customer
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId

    // Find payment by Stripe Payment Intent ID
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (!payment) {
      console.log(`Payment not found for intent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
      },
    })

    console.log(`Payment failed for booking: ${bookingId}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

/**
 * Handle refunded charge
 * Updates payment status to refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Find payment by Stripe Charge ID
    const payment = await prisma.payment.findUnique({
      where: { stripeChargeId: charge.id },
    })

    if (!payment) {
      console.log(`Payment not found for charge: ${charge.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
      },
    })

    console.log(`Payment refunded: ${charge.id}`)
  } catch (error) {
    console.error('Error handling charge refunded:', error)
  }
}
