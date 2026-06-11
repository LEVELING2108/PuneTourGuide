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

export const toggleStopStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { done } = req.body;
    const updatedStop = await prisma.itineraryStop.update({
      where: { id: Number(id) },
      data: { done: Boolean(done) }
    });
    res.json(updatedStop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stop status' });
  }
};

export const addStopToItinerary = async (req: Request, res: Response) => {
  try {
    const { itineraryDayId, name, time, desc, dotColor, tags } = req.body;
    const newStop = await prisma.itineraryStop.create({
      data: {
        name,
        time,
        desc,
        dotColor,
        itineraryDayId: Number(itineraryDayId),
        tags: tags || []
      }
    });
    res.json(newStop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stop' });
  }
};
