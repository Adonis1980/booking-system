import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { bookingId, amount, paymentType = 'deposit' } = body

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount' },
        { status: 400 }
      )
    }

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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        bookingId,
        paymentType,
        customerEmail: booking.customerEmail,
        serviceName: booking.service.name,
      },
      description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment for ${booking.service.name} - ${booking.customerName}`,
    })

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

export async function PUT(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { paymentIntentId, paymentId } = body

    if (!paymentIntentId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'succeeded',
          stripeChargeId: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
          paidAt: new Date(),
        },
        include: { booking: true },
      })

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
