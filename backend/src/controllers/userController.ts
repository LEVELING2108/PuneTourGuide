import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const savedCount = await prisma.place.count({ where: { isSaved: true } });
    const discoveredCount = await prisma.place.count({ where: { NOT: { osmId: null } } });
    const completedStops = await prisma.itineraryStop.count({ where: { done: true } });

    // Points calculation logic
    const totalPoints = (savedCount * 10) + (completedStops * 50) + (discoveredCount * 100);

    res.json({
      savedCount,
      discoveredCount,
      completedStops,
      totalPoints
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate user stats' });
  }
};
