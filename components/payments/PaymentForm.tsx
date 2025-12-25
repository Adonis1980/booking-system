/**
 * Payment Form Component
 * 
 * Handles Stripe payment processing using Stripe Elements
 * Displays payment form and processes payment intents
 */

'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PaymentFormProps {
  bookingId: string
  amount: number
  paymentType: 'deposit' | 'full'
  onSuccess?: () => void
}

/**
 * Inner payment form component
 * Uses Stripe hooks for payment processing
 */
function PaymentFormContent({ bookingId, amount, paymentType, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  /**
   * Handle form submission
   * Creates payment intent and processes payment
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error('Stripe not loaded')
      return
    }

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Create payment intent on backend
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret, paymentId } = await paymentResponse.json()

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      })

      if (result.error) {
        toast.error(result.error.message || 'Payment failed')
        return
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Step 3: Confirm payment on backend
        const confirmResponse = await fetch('/api/payments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            paymentId,
          }),
        })

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm payment')
        }

        toast.success('Payment successful! Your booking is confirmed.')
        onSuccess?.()
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          {paymentType === 'deposit' ? 'Deposit Payment' : 'Full Payment'} - ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <Label>Card Details</Label>
            <div className="border rounded-lg p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Amount to Pay:</span>
              <span className="text-2xl font-bold text-slate-900">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-slate-500 text-center">
            🔒 Your payment is secure and encrypted by Stripe
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Payment Form Wrapper
 * Provides Stripe Elements context
 */
export function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}
