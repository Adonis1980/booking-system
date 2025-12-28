import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (message.type === 'tool-calls') {
      const toolCall = message.toolCalls[0]
      const { name } = toolCall.function
      
      // Vapi sends arguments as a JSON string
      const args = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments

      if (name === 'checkAvailability') {
        const { serviceName, date } = args
        
        const service = await prisma.service.findFirst({
          where: { 
            name: {
              equals: serviceName,
              mode: 'insensitive'
            }
          }
        })

        if (!service) {
          return NextResponse.json({
            results: [{ toolCallId: toolCall.id, result: `Service "${serviceName}" not found. Available services are: Roofing, Plumbing, HVAC, General Maintenance.` }]
          })
        }

        const slots = [
          { time: "09:00 AM", available: true },
          { time: "11:00 AM", available: true },
          { time: "02:00 PM", available: true },
          { time: "04:00 PM", available: true }
        ]

        return NextResponse.json({
          results: [{ 
            toolCallId: toolCall.id, 
            result: `Available slots for ${service.name} on ${date}: ${slots.map(s => s.time).join(', ')}` 
          }]
        })
      }

      if (name === 'createBooking') {
        const { serviceName, customerName, customerEmail, customerPhone, customerAddress } = args

        const service = await prisma.service.findFirst({
          where: { 
            name: {
              equals: serviceName,
              mode: 'insensitive'
            }
          }
        })

        if (!service) {
          return NextResponse.json({
            results: [{ toolCallId: toolCall.id, result: `Error: Service "${serviceName}" not found.` }]
          })
        }

        const booking = await prisma.booking.create({
          data: {
            serviceId: service.id,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            status: 'pending',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalAmount: service.price,
            depositAmount: Number(service.price) * 0.5,
          }
        })

        return NextResponse.json({
          results: [{ 
            toolCallId: toolCall.id, 
            result: `Success! Booking created for ${customerName} for ${service.name}. Booking ID: ${booking.id}.` 
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
