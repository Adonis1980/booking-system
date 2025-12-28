import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Vapi Request Body:', JSON.stringify(body, null, 2))
    
    const { message } = body

    if (message && message.type === 'tool-calls') {
      const toolCall = message.toolCalls[0]
      const { name } = toolCall.function
      
      let args = toolCall.function.arguments
      if (typeof args === 'string') {
        try {
          args = JSON.parse(args)
        } catch (e) {
          console.error('Failed to parse arguments:', args)
        }
      }

      console.log('Tool Call:', name, 'Args:', args)

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
            results: [{ toolCallId: toolCall.id, result: `Service "${serviceName}" not found.` }]
          })
        }

        return NextResponse.json({
          results: [{ 
            toolCallId: toolCall.id, 
            result: `Available slots for ${service.name} on ${date}: 09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM` 
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
            result: `Success! Booking created for ${customerName}. Booking ID: ${booking.id}.` 
          }]
        })
      }
    }

    return NextResponse.json({ message: "OK" })
  } catch (error: any) {
    console.error('Vapi integration error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
