import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, customerName, customerEmail, customerPhone, customerAddress, budget, notes } = body

    if (!serviceId || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        budget: budget ? parseFloat(budget) : null,
        notes: notes || null,
        status: 'pending',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalAmount: service.price,
        depositAmount: Number(service.price) * 0.5,
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    )
  }
}
