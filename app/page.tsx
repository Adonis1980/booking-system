/**
 * Home Services Booking System - Main Page
 * 
 * This is the landing page where customers can:
 * 1. Select a service (Roofing, Plumbing, HVAC, etc.)
 * 2. Fill out their information (name, email, phone, address)
 * 3. Provide budget and notes
 * 4. Submit booking request
 * 
 * The page uses shadcn/ui components for a professional, accessible interface.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Wrench, Home, Zap, Droplet } from 'lucide-react'

// Service options available for booking
const SERVICES = [
  { id: 'roofing', name: 'Roofing', icon: Home, description: 'Roof repair and installation' },
  { id: 'plumbing', name: 'Plumbing', icon: Droplet, description: 'Plumbing repairs and installation' },
  { id: 'hvac', name: 'HVAC', icon: Zap, description: 'Heating and cooling systems' },
  { id: 'general', name: 'General Maintenance', icon: Wrench, description: 'General home maintenance' },
]

export default function BookingPage() {
  // Form state management
  const [selectedService, setSelectedService] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    budget: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle form input changes
   * Updates the formData state as user types
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handle form submission
   * Validates input, sends booking request to API, and shows confirmation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: ensure all required fields are filled
    if (!selectedService || !formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Send booking request to API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const booking = await response.json()

      // Show success message and redirect to payment
      toast.success('Booking created! Redirecting to payment...')
      
      // Redirect to payment page
      setTimeout(() => {
        window.location.href = `/payment?bookingId=${booking.id}`
      }, 1500)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Home Services Booking</h1>
          <p className="text-slate-600 mt-2">Book professional home services in minutes</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Service Selection Column */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select a Service</h2>
            <div className="space-y-3">
              {SERVICES.map(service => {
                const Icon = service.icon
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{service.name}</p>
                        <p className="text-sm text-slate-500">{service.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Booking Form Column */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  {selectedService
                    ? `Booking for ${SERVICES.find(s => s.id === selectedService)?.name}`
                    : 'Select a service to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Address Field */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St, City, State 12345"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Budget Field (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="$0.00"
                      value={formData.budget}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Notes Field (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Tell us more about your project..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!selectedService || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Creating Booking...' : 'Request Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Our team responds to booking requests within 24 hours with availability and pricing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Choose from available time slots that work best for your schedule.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Licensed and insured professionals ready to help with your home service needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
