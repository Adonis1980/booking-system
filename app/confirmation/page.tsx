/**
 * Confirmation Page
 * 
 * Displays after successful payment
 * Shows booking confirmation details
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Payment Confirmed</h1>
          <p className="text-slate-600 mt-2">Your booking is confirmed</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-12 pb-12">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-slate-600">
                Your booking has been confirmed and payment has been processed.
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-slate-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">What's Next?</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold">✓</span>
                  <span>A confirmation email has been sent to your email address</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold">✓</span>
                  <span>Our team will contact you within 24 hours to confirm the appointment time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold">✓</span>
                  <span>You'll receive a reminder email 48 hours before your appointment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 font-bold">✓</span>
                  <span>You'll receive an SMS reminder 1 hour before the appointment</span>
                </li>
              </ul>
            </div>

            {/* Booking ID */}
            {bookingId && (
              <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Booking Reference Number</p>
                <p className="text-lg font-mono font-bold text-blue-600">{bookingId}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  Book Another Service
                </Button>
              </Link>
              <Link href="/admin">
                <Button>
                  View My Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              If you have any questions about your booking or payment, please contact us:
            </p>
            <div className="space-y-2 text-slate-600">
              <p>📧 Email: support@homeservices.com</p>
              <p>📞 Phone: (555) 123-4567</p>
              <p>🕐 Hours: Monday-Friday, 9am-5pm</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
