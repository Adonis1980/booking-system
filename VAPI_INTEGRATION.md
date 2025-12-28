# Vapi AI Voice Integration Guide

This guide explains how to connect your Vapi voice assistant to your booking system.

## 🎯 What this does
Your Vapi AI assistant will be able to:
1. **Check Availability**: "What times do you have open for Roofing next Tuesday?"
2. **Create Bookings**: "Great, book me for 11 AM. My name is John..."

## 🔧 Step 1: Configure your Vapi Assistant

1. Log in to your [Vapi Dashboard](https://dashboard.vapi.ai).
2. Go to **Assistants** and select your assistant.
3. Go to the **Functions** tab.
4. Add the following two functions:

### Function 1: checkAvailability
- **Name**: `checkAvailability`
- **Description**: Checks available time slots for a specific service.
- **Parameters**:
  - `serviceName` (string): The name of the service (e.g., "Roofing", "Plumbing").
  - `date` (string): The date to check.

### Function 2: createBooking
- **Name**: `createBooking`
- **Description**: Creates a new booking in the system.
- **Parameters**:
  - `serviceName` (string): The name of the service.
  - `customerName` (string): Full name of the customer.
  - `customerEmail` (string): Email address.
  - `customerPhone` (string): Phone number.
  - `customerAddress` (string): Service address.
  - `time` (string): The selected time slot.

## 🔗 Step 2: Set the Webhook URL

1. In your Vapi Assistant settings, go to **Advanced**.
2. Find the **Server URL** or **Webhook URL** field.
3. Enter your live website URL followed by `/api/vapi`:
   `https://your-app.vercel.app/api/vapi`

## 🧪 Step 3: Test it!

Call your Vapi number and try saying:
- "What services do you offer?"
- "Do you have any openings for Roofing tomorrow?"
- "I'd like to book a plumbing repair for next Monday at 10 AM."

## 📝 Note on Security
In production, you should add an API key check to the `app/api/vapi/route.ts` file to ensure only Vapi can call your endpoint.
