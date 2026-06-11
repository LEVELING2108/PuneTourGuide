import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getItinerary = async (req: Request, res: Response) => {
  try {
    const itinerary = await prisma.itineraryDay.findMany({
      include: {
        stops: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { day: 'asc' }
    });
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
};
