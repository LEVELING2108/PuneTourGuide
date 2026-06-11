import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where = category && category !== 'All' ? { category: String(category) } : {};
    
    const places = await prisma.place.findMany({
      where,
      orderBy: { rating: 'desc' }
    });
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

export const getPlaceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const place = await prisma.place.findUnique({
      where: { id: Number(id) }
    });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    res.json(place);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch place' });
  }
};
