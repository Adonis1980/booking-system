const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')
  try {
    const services = await Promise.all([
      prisma.service.upsert({
        where: { name: 'Roofing' },
        update: {},
        create: { name: 'Roofing', description: 'Roof repair and installation', duration: 120, price: 150.00 }
      }),
      prisma.service.upsert({
        where: { name: 'Plumbing' },
        update: {},
        create: { name: 'Plumbing', description: 'Plumbing repairs', duration: 90, price: 120.00 }
      }),
      prisma.service.upsert({
        where: { name: 'HVAC' },
        update: {},
        create: { name: 'HVAC', description: 'Heating and cooling', duration: 120, price: 140.00 }
      }),
      prisma.service.upsert({
        where: { name: 'General Maintenance' },
        update: {},
        create: { name: 'General Maintenance', description: 'General home repairs', duration: 60, price: 100.00 }
      })
    ])
    console.log('✅ Database seeded successfully!')
  } catch (e) {
    console.error('❌ Seed failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
