/**
 * Database Seed Script
 */

const { PrismaClient } = require('@prisma/client')

// Create Prisma client - it will use DATABASE_URL from environment
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create services
    const services = await Promise.all([
      prisma.service.upsert({
        where: { name: 'Roofing' },
        update: {},
        create: {
          name: 'Roofing',
          description: 'Professional roof repair, replacement, and maintenance',
          duration: 120,
          price: 150.00,
        },
      }),
      prisma.service.upsert({
        where: { name: 'Plumbing' },
        update: {},
        create: {
          name: 'Plumbing',
          description: 'Plumbing repairs, installations, and maintenance',
          duration: 90,
          price: 120.00,
        },
      }),
      prisma.service.upsert({
        where: { name: 'HVAC' },
        update: {},
        create: {
          name: 'HVAC',
          description: 'Heating, ventilation, and air conditioning services',
          duration: 120,
          price: 140.00,
        },
      }),
      prisma.service.upsert({
        where: { name: 'General Maintenance' },
        update: {},
        create: {
          name: 'General Maintenance',
          description: 'General home maintenance and repairs',
          duration: 60,
          price: 100.00,
        },
      }),
    ])

    console.log(`✅ Created ${services.length} services`)

    // Create availability slots for each service
    for (const service of services) {
      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
        // Morning slot
        await prisma.availability.upsert({
          where: {
            serviceId_dayOfWeek_startTime: {
              serviceId: service.id,
              dayOfWeek,
              startTime: '09:00',
            },
          },
          update: {},
          create: {
            serviceId: service.id,
            dayOfWeek,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true,
          },
        })

        // Afternoon slot
        await prisma.availability.upsert({
          where: {
            serviceId_dayOfWeek_startTime: {
              serviceId: service.id,
              dayOfWeek,
              startTime: '13:00',
            },
          },
          update: {},
          create: {
            serviceId: service.id,
            dayOfWeek,
            startTime: '13:00',
            endTime: '17:00',
            isAvailable: true,
          },
        })
      }
    }

    console.log('✅ Created availability slots for all services')

    // Create sample team members
    const teamMembers = await Promise.all([
      prisma.teamMember.upsert({
        where: { email: 'john@homeservices.com' },
        update: {},
        create: {
          name: 'John Smith',
          email: 'john@homeservices.com',
          phone: '(555) 123-4567',
          role: 'technician',
          isActive: true,
        },
      }),
      prisma.teamMember.upsert({
        where: { email: 'sarah@homeservices.com' },
        update: {},
        create: {
          name: 'Sarah Johnson',
          email: 'sarah@homeservices.com',
          phone: '(555) 234-5678',
          role: 'manager',
          isActive: true,
        },
      }),
      prisma.teamMember.upsert({
        where: { email: 'mike@homeservices.com' },
        update: {},
        create: {
          name: 'Mike Davis',
          email: 'mike@homeservices.com',
          phone: '(555) 345-6789',
          role: 'technician',
          isActive: true,
        },
      }),
    ])

    console.log(`✅ Created ${teamMembers.length} team members`)
    console.log('🎉 Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
