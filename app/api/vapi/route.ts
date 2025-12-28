/**
 * Vapi AI Integration Endpoint
 * 
 * This endpoint handles tool calls from your Vapi voice assistant.
 * It allows the AI to:
 * 1. Check available time slots for a service
 * 2. Create a booking directly from a phone call
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    // Vapi sends a "tool_calls" message when the AI wants to use a function
    if (message.type === 'tool-calls') {
      const toolCall = message.toolCalls[0]
      const { name, args } = toolCall.function

      // Handle "checkAvailability" function
      if (name === 'checkAvailability') {
        const { serviceName, date } = args
        
        // Find the service
        const service = await prisma.service.findUnique({
          where: { name: serviceName }
        })

        if (!service) {
          return NextResponse.json({
            results: [{ toolCallId: toolCall.id, result: "Service not found." }]
          })
        }

        // Get availability for that service
        // For simplicity, we'll just return a few slots. 
        // In a real app, you'd check the database for existing bookings.
        const slots = [
          { time: "09:00 AM", available: true },
          { time: "11:00 AM", available: true },
          { time: "02:00 PM", available: true },
          { time: "04:00 PM", available: true }
        ]

        return NextResponse.json({
          results: [{ 
            toolCallId: toolCall.id, 
            result: `Available slots for ${serviceName} on ${date}: ${slots.map(s => s.time).join(', ')}` 
          }]
        })
      }

      // Handle "createBooking" function
      if (name === 'createBooking') {
        const { serviceName, customerName, customerEmail, customerPhone, customerAddress, time } = args

        const service = await prisma.service.findUnique({
          where: { name: serviceName }
        })

        if (!service) {
          return NextResponse.json({
            results: [{ toolCallId: toolCall.id, result: "Error: Service not found." }]
          })
        }

        // Create the booking in the database
        const booking = await prisma.booking.create({
          data: {
            serviceId: service.id,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            status: 'pending',
            scheduledDate: new Date(), // In a real app, parse the 'time' and 'date' args
          }
        })

        return NextResponse.json({
          results: [{ 
            toolCallId: toolCall.id, 
            result: `Success! Booking created for ${customerName}. Booking ID: ${booking.id}.` 
          }]
        })
      }
    }

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error('Vapi integration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
