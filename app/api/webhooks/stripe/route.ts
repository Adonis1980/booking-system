import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

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

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId
    const paymentType = paymentIntent.metadata.paymentType

    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { booking: true },
    })

    if (!payment) {
      console.log(`Payment not found for intent: ${paymentIntent.id}`)
      return
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        stripeChargeId: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
        paidAt: new Date(),
      },
    })

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

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId

    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (!payment) {
      console.log(`Payment not found for intent: ${paymentIntent.id}`)
      return
    }

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

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { stripeChargeId: charge.id },
    })

    if (!payment) {
      console.log(`Payment not found for charge: ${charge.id}`)
      return
    }

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
