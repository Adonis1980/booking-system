/**
 * Payment Page
 * 
 * Allows customers to pay for their bookings
 * Displays booking details and payment form
 * Accessible via /payment?bookingId=xxx
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/components/payments/PaymentForm'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface BookingDetails {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  scheduledDate: string
  status: string
  budget: number | null
  notes: string | null
  service: {
    name: string
    price: number
    duration: number
  }
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState(0)
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit')

  useEffect(() => {
    if (!bookingId) {
      toast.error('No booking ID provided')
      setIsLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (!response.ok) {
          throw new Error('Booking not found')
        }
        const data = await response.json()
        setBooking(data)
        
        // Calculate deposit (50% of service price)
        setDepositAmount(Number(data.service.price) * 0.5)
      } catch (error) {
        console.error('Error fetching booking:', error)
        toast.error('Failed to load booking details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const handlePaymentSuccess = () => {
    // Redirect to confirmation page
    setTimeout(() => {
      window.location.href = `/confirmation?bookingId=${bookingId}`
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <p className="text-slate-600">Loading booking details...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Booking Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                The booking you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const paymentAmount = paymentType === 'deposit' ? depositAmount : Number(booking.service.price)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Payment</h1>
          <p className="text-slate-600 mt-2">Secure payment for your booking</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Service</p>
                  <p className="text-lg font-semibold text-slate-900">{booking.service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer Name</p>
                  <p className="text-lg font-semibold text-slate-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="text-slate-900">{booking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="text-slate-900">{booking.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Service Address</p>
                  <p className="text-slate-900">{booking.customerAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Scheduled Date</p>
                  <p className="text-slate-900">
                    {format(new Date(booking.scheduledDate), 'MMMM dd, yyyy h:mm a')}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600">Service Price</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${Number(booking.service.price).toFixed(2)}
                  </p>
                </div>
                {booking.notes && (
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-sm text-slate-600 font-medium mb-1">Notes</p>
                    <p className="text-slate-900">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentType"
                    value="deposit"
                    checked={paymentType === 'deposit'}
                    onChange={(e) => setPaymentType(e.target.value as 'deposit' | 'full')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Deposit Payment</p>
                    <p className="text-sm text-slate-600">
                      Pay 50% now (${depositAmount.toFixed(2)}) — Balance due at service
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentType === 'full'}
                    onChange={(e) => setPaymentType(e.target.value as 'deposit' | 'full')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Full Payment</p>
                    <p className="text-sm text-slate-600">
                      Pay in full now (${Number(booking.service.price).toFixed(2)})
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          <div>
            <PaymentForm
              bookingId={booking.id}
              amount={paymentAmount}
              paymentType={paymentType}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
