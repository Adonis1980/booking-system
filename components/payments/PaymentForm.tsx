/**
 * Payment Form Component
 * 
 * Handles Stripe payment processing using Stripe Elements
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
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

interface PaymentFormProps {
  bookingId: string
  amount: number
  paymentType: 'deposit' | 'full'
  onSuccess?: () => void
}

/**
 * Inner payment form component
 * This component MUST be wrapped in <Elements> to use Stripe hooks
 */
function PaymentFormContent({ bookingId, amount, paymentType, onSuccess }: PaymentFormProps) {
  // These hooks will throw if not inside <Elements>
  const stripe = useStripe()
  const elements = useElements()
  
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount, paymentType }),
      })

      if (!response.ok) throw new Error('Failed to create payment')
      const { clientSecret, paymentId } = await response.json()

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      })

      if (result.error) {
        toast.error(result.error.message)
        return
      }

      if (result.paymentIntent?.status === 'succeeded') {
        await fetch('/api/payments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id, paymentId }),
        })
        toast.success('Payment successful!')
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          {paymentType === 'deposit' ? 'Deposit' : 'Full'} Payment — ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Card Details</Label>
            <div className="border rounded-lg p-3 bg-white">
              <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
          </div>
          <Button type="submit" disabled={!stripe || isLoading} className="w-full" size="lg">
            {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Main PaymentForm component
 * Handles the case where Stripe is not configured
 */
export function PaymentForm(props: PaymentFormProps) {
  if (!stripeKey) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Stripe Not Configured</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment variables.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}
