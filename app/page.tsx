/**
 * Home Services Booking System - Main Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Wrench, Home, Zap, Droplet } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  price: number
}

const ICON_MAP: Record<string, any> = {
  'Roofing': Home,
  'Plumbing': Droplet,
  'HVAC': Zap,
  'General Maintenance': Wrench,
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (!response.ok) throw new Error('Failed to fetch services')
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error('Error loading services:', error)
        toast.error('Failed to load services. Please refresh.')
      }
    }
    fetchServices()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
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

      if (!response.ok) throw new Error('Failed to create booking')

      const booking = await response.json()
      toast.success('Booking created! Redirecting to payment...')
      
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
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Home Services Booking</h1>
          <p className="text-slate-600 mt-2">Book professional home services in minutes</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select a Service</h2>
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-slate-500">Loading services...</p>
              ) : (
                services.map(service => {
                  const Icon = ICON_MAP[service.name] || Wrench
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
                })
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  {selectedService
                    ? `Booking for ${services.find(s => s.id === selectedService)?.name}`
                    : 'Select a service to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Input id="address" name="address" placeholder="123 Main St, City, State 12345" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <Input id="budget" name="budget" type="number" placeholder="$0.00" value={formData.budget} onChange={handleInputChange} step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea id="notes" name="notes" placeholder="Tell us more about your project..." value={formData.notes} onChange={handleInputChange} rows={4} />
                  </div>
                  <Button type="submit" disabled={!selectedService || isLoading} className="w-full" size="lg">
                    {isLoading ? 'Creating Booking...' : 'Request Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
