/**
 * GET /api/bookings/[id]
 * 
 * Retrieves a specific booking by ID
 * 
 * Response:
 * - Returns booking details with service information
 * - Status 200 on success
 * - Status 404 if booking not found
 * - Status 500 on server error
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch booking with service details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        payments: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve booking' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookings/[id]
 * 
 * Updates a booking
 * 
 * Request body:
 * - status: string (optional)
 * - notes: string (optional)
 * - scheduledDate: string (optional)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: body,
      include: { service: true },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
