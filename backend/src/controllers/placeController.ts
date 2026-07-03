import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { searchOSMPlaces, fetchOSMPlacesByCategory } from '../services/overpassService';
import { getCachedData, setCachedData, invalidateCache } from '../services/cacheService';

const prisma = new PrismaClient();

const saveDiscoveredPlaces = async (discoveredPlaces: any[]) => {
  if (discoveredPlaces.length === 0) return;
  
  for (const p of discoveredPlaces) {
    const { latitude, longitude, ...rest } = p;
    
    // 1. Upsert basic data
    const upserted = await prisma.place.upsert({
      where: { osmId: p.osmId },
      update: { latitude, longitude }, 
      create: { ...rest, latitude, longitude }
    });

    // 2. Populate PostGIS geometry column using raw SQL
    if (latitude && longitude) {
      await prisma.$executeRaw`
        UPDATE "Place" 
        SET "location" = ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
        WHERE id = ${upserted.id}
      `;
    }
  }
  
  // Invalidate cache if new data was added
  await invalidateCache('places:*');
};

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const { category, q, isSaved, isDiscovered } = req.query;
    const userId = (req as AuthRequest).user?.id;
    
    // Generate a unique cache key based on query parameters (excluding user-specific states)
    const cacheKey = `places:v5:${category || 'all'}:${q || 'none'}:${isDiscovered || 'any'}`;
    
    // Check cache first
    let places = await getCachedData<any[]>(cacheKey);
    if (!places) {
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

      if (isDiscovered === 'true') {
        where.NOT = { osmId: null };
      }
      
      places = await prisma.place.findMany({
        where,
        orderBy: { rating: 'desc' }
      });

      // Save to cache for 1 hour
      await setCachedData(cacheKey, places, 3600);
    }

    // Auto-Discovery Logic: If search query provided and few results - run in background
    if (q && places.length < 5 && isSaved !== 'true') {
      searchOSMPlaces(String(q))
        .then(discovered => saveDiscoveredPlaces(discovered))
        .catch(err => console.error('Background search discovery error:', err));
    }

    // Category Population Logic: Ensure at least 10 places in a category - run in background
    if (category && category !== 'All' && places.length < 10 && !q && isSaved !== 'true') {
      console.log(`Low count for category ${category} (${places.length}). Hydrating in background...`);
      fetchOSMPlacesByCategory(String(category))
        .then(discovered => saveDiscoveredPlaces(discovered))
        .catch(err => console.error('Background category discovery error:', err));
    }

    // Fetch user saved place IDs for dynamic hydration
    let savedIdsSet = new Set<number>();
    if (userId) {
      const savedRelation = await prisma.savedPlace.findMany({
        where: { userId },
        select: { placeId: true }
      });
      savedRelation.forEach(r => savedIdsSet.add(r.placeId));
    }

    // Hydrate the isSaved status dynamically
    let hydratedPlaces = places.map(p => ({
      ...p,
      isSaved: savedIdsSet.has(p.id)
    }));

    // Filter by saved state if requested
    if (isSaved === 'true') {
      hydratedPlaces = hydratedPlaces.filter(p => p.isSaved);
    }

    res.json(hydratedPlaces);
  } catch (error) {
    console.error('Error in getAllPlaces:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

export const getPlaceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `place:detail:${id}`;

    let place = await getCachedData<any>(cacheKey);
    if (!place) {
      place = await prisma.place.findUnique({
        where: { id: Number(id) }
      });
      if (!place) return res.status(404).json({ error: 'Place not found' });
      await setCachedData(cacheKey, place, 3600);
    }

    // Hydrate user-specific saved state dynamically
    const userId = (req as AuthRequest).user?.id;
    let isSaved = false;
    if (userId) {
      const savedRelation = await prisma.savedPlace.findUnique({
        where: {
          userId_placeId: {
            userId,
            placeId: Number(id)
          }
        }
      });
      isSaved = !!savedRelation;
    }

    res.json({ ...place, isSaved });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch place' });
  }
};

export const toggleSavePlace = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { isSaved } = req.body;
    const userId = req.user.id;

    // Check place existence
    const place = await prisma.place.findUnique({
      where: { id: Number(id) }
    });

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Check if relation already exists for this specific user
    const existingSave = await prisma.savedPlace.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId: Number(id)
        }
      }
    });

    const justSaved = Boolean(isSaved) && !existingSave;

    if (Boolean(isSaved)) {
      if (!existingSave) {
        await prisma.savedPlace.create({
          data: {
            userId,
            placeId: Number(id)
          }
        });
      }
    } else {
      if (existingSave) {
        await prisma.savedPlace.delete({
          where: {
            userId_placeId: {
              userId,
              placeId: Number(id)
            }
          }
        });
      }
    }

    if (justSaved) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 10 } }
      });
      console.log(`[XP] User ${userId} gained +10 XP for saving place: ${place.name}`);
    }

    // Invalidate details cache
    await invalidateCache(`place:detail:${id}`);

    res.json({ ...place, isSaved: Boolean(isSaved) });
  } catch (error) {
    console.error('Failed to toggle save status:', error);
    res.status(500).json({ error: 'Failed to toggle save status' });
  }
};
