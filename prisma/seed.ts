import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  })
  
  // Create sample events
  const events = [
    {
      title: 'Doves, `25 on Blank Canvas',
      description: 'On February 23rd, 2025, Hindia announced a surprise drop on his social media, a mixtape consisting of 16 songs. This mixtape is scheduled to be released on February 24th, 2025. \n This mixtape is a result of Hindia’s music exploration, written in a multilingual lyrics that represents a personal story, to politics; responding to a musical works from other musician, up to combining rock and electronic music arrangement.',
      location: 'Jakarta',
      date: new Date('2025-09-10T18:00:00Z'),
      artist: 'Hindia',
      price: 180000,
      totalSeats: 800,
      availableSeats: 800,
      soldOut: false,
      image: '/1748089880757-hindia1740384844352169-display.jpeg',
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log({ admin, events: events.map(e => e.title) })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 