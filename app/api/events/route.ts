import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('Fetching events...');
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build the where clause based on filters
    const where: any = {};

    if (genre && genre !== 'all') {
      // genre filter removed because column does not exist
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { artist: { contains: search } }
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    // Only show future concerts and today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.date = { gte: today };

    console.log('Prisma query where clause:', where);

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        date: 'asc'
      },
      include: {
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });

    console.log('Found events:', events);

    // Add available seats to each event
    const eventsWithAvailability = events.map(event => ({
      ...event,
      availableSeats: event.totalSeats - (event as any)._count?.tickets || 0,
      soldOut: event.totalSeats <= ((event as any)._count?.tickets || 0)
    }));

    console.log('Events with availability:', eventsWithAvailability);

    return NextResponse.json(eventsWithAvailability);
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, description, location, date, artist, price, totalSeats, image } = body;

    if (!title || !description || !location || !date || !artist || !price || !totalSeats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        artist,
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats),
        image: image || undefined,
        availableSeats: parseInt(totalSeats),
        soldOut: false
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}