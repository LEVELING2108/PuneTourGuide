import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const { category, q, isSaved } = req.query;
    let where: any = {};
    
    if (category && category !== 'All') {
      where.category = String(category);
    }
    
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } }
      ];
    }
    
    if (isSaved === 'true') {
      where.isSaved = true;
    }
    
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

export const toggleSavePlace = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isSaved } = req.body;
    const updatedPlace = await prisma.place.update({
      where: { id: Number(id) },
      data: { isSaved: Boolean(isSaved) }
    });
    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle save status' });
  }
};
