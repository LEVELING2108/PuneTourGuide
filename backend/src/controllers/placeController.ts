import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { searchOSMPlaces } from '../services/overpassService';

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
    
    let places = await prisma.place.findMany({
      where,
      orderBy: { rating: 'desc' }
    });

    // Auto-Discovery Logic: If few results found locally and we have a search query
    if (q && places.length < 3 && !isSaved) {
      const discoveredPlaces = await searchOSMPlaces(String(q));
      
      if (discoveredPlaces.length > 0) {
        // Ingest newly discovered places
        const ingestionPromises = discoveredPlaces.map(p => 
          prisma.place.upsert({
            where: { osmId: p.osmId },
            update: {}, // Don't overwrite if it exists
            create: p
          })
        );
        
        await Promise.all(ingestionPromises);

        // Re-fetch to get the newly ingested places combined with local ones
        places = await prisma.place.findMany({
          where,
          orderBy: { rating: 'desc' }
        });
      }
    }

    res.json(places);
  } catch (error) {
    console.error('Error in getAllPlaces:', error);
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
