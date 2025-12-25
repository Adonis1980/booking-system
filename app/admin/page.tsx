/**
 * Admin Dashboard - Booking Management
 * 
 * This page allows the team to:
 * 1. View all bookings in a table
 * 2. Filter by status (pending, confirmed, completed, cancelled)
 * 3. Update booking status
 * 4. View booking details
 * 5. Send reminders to customers
 * 
 * TODO: Add authentication to restrict access to team members only
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  status: string
  scheduledDate: string
  budget: number | null
  notes: string | null
  createdAt: string
  service: {
    name: string
    duration: number
  }
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  /**
   * Fetch all bookings from the API
   */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings')
        if (!response.ok) throw new Error('Failed to fetch bookings')
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  /**
   * Filter bookings by status
   */
  const filteredBookings = selectedStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === selectedStatus)

  /**
   * Get badge color based on booking status
   */
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    }
    return variants[status] || 'default'
  }

  /**
   * Calculate statistics for dashboard
   */
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage home service bookings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>View and manage all customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status Filter Tabs */}
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No bookings found</p>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{booking.customerName}</h3>
                        <p className="text-sm text-slate-600">{booking.service.name}</p>
                      </div>
                      <Badge variant={getStatusBadge(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-600">Email</p>
                        <p className="text-slate-900">{booking.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Phone</p>
                        <p className="text-slate-900">{booking.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Address</p>
                        <p className="text-slate-900">{booking.customerAddress}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Scheduled Date</p>
                        <p className="text-slate-900">
                          {format(new Date(booking.scheduledDate), 'MMM dd, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>

                    {booking.budget && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-600">Budget</p>
                        <p className="text-slate-900 font-medium">${booking.budget.toFixed(2)}</p>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="mb-3 p-3 bg-slate-100 rounded text-sm">
                        <p className="text-slate-600 font-medium mb-1">Notes</p>
                        <p className="text-slate-900">{booking.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Send Reminder
                      </Button>
                      <Button size="sm" variant="outline">
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
