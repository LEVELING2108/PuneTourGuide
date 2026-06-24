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
    console.error("Failed to fetch itinerary:", error);
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
    console.error("Failed to update stop status:", error);
    res.status(500).json({ error: 'Failed to update stop status' });
  }
};

export const addStopToItinerary = async (req: Request, res: Response) => {
  try {
    const { itineraryDayId, name, name_mr, time, desc, desc_mr, dotColor, tags } = req.body;
    const newStop = await prisma.itineraryStop.create({
      data: {
        name,
        name_mr,
        time,
        desc,
        desc_mr,
        dotColor,
        itineraryDayId: Number(itineraryDayId),
        tags: tags || []
      }
    });
    res.json(newStop);
  } catch (error) {
    console.error("Failed to add stop to itinerary:", error);
    res.status(500).json({ error: 'Failed to add stop' });
  }
};

export const deleteStopFromItinerary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.itineraryStop.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true, message: "Stop deleted successfully" });
  } catch (error) {
    console.error("Failed to delete stop:", error);
    res.status(500).json({ error: 'Failed to delete stop' });
  }
};
