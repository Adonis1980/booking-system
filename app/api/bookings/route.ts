/**
 * POST /api/bookings
 * 
 * Creates a new booking in the system
 * 
 * Request body:
 * - serviceId: string (ID of the service)
 * - customerName: string
 * - customerEmail: string
 * - customerPhone: string
 * - customerAddress: string
 * - budget?: number (optional customer budget)
 * - notes?: string (optional additional notes)
 * 
 * Response:
 * - Returns the created booking object with ID and timestamps
 * - Status 201 on success
 * - Status 400 on validation error
 * - Status 500 on server error
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate required fields
    const { serviceId, customerName, customerEmail, customerPhone, customerAddress, budget, notes } = body

    if (!serviceId || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 400 }
      )
    }

    // Create booking with default status of "pending"
    // The booking will be confirmed once the team reviews and schedules it
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
        // Schedule for 7 days from now as default (team will adjust)
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        service: true,
      },
    })

    // TODO: Send confirmation email to customer
    // TODO: Send notification to team members
    // TODO: Integrate with Zapier for additional automation

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings
 * 
 * Retrieves all bookings (admin endpoint)
 * TODO: Add authentication to restrict access
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // For now, this is open - should be protected in production

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
