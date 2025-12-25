/**
 * Root Layout
 * 
 * This is the main layout component that wraps all pages.
 * It includes:
 * - Metadata for SEO
 * - Global styles
 * - Theme provider
 * - Toast notifications
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Home Services Booking System',
  description: 'Book professional home services online - Roofing, Plumbing, HVAC, and more',
  keywords: ['home services', 'booking', 'roofing', 'plumbing', 'hvac'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://homeservices-booking.com',
    siteName: 'Home Services Booking',
    title: 'Home Services Booking System',
    description: 'Book professional home services online',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
