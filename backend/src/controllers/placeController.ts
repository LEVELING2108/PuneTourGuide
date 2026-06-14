import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { searchOSMPlaces } from '../services/overpassService';
import { getCachedData, setCachedData, invalidateCache } from '../services/cacheService';

const prisma = new PrismaClient();

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const { category, q, isSaved, isDiscovered } = req.query;
    
    // Generate a unique cache key based on query parameters
    const cacheKey = `places:v2:${category || 'all'}:${q || 'none'}:${isSaved || 'any'}:${isDiscovered || 'any'}`;
    
    // Check cache first
    const cachedPlaces = await getCachedData<any[]>(cacheKey);
    if (cachedPlaces) {
      console.log('Serving from Redis cache:', cacheKey);
      return res.json(cachedPlaces);
    }

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

    if (isDiscovered === 'true') {
      where.NOT = { osmId: null };
    }
    
    let places = await prisma.place.findMany({
      where,
      orderBy: { rating: 'desc' }
    });

    // Auto-Discovery Logic
    if (q && places.length < 3 && !isSaved) {
      const discoveredPlaces = await searchOSMPlaces(String(q));
      
      if (discoveredPlaces.length > 0) {
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
              SET "location" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
              WHERE id = ${upserted.id}
            `;
          }
        }
        
        // Invalidate cache if new data was added
        await invalidateCache('places:*');

        places = await prisma.place.findMany({
          where,
          orderBy: { rating: 'desc' }
        });
      }
    }

    // Nearby search enhancement: If user coordinates are provided, sort by real physical distance using PostGIS
    const { lat, lng } = req.query;
    if (lat && lng && places.length > 0) {
      // Use raw SQL to get places sorted by PostGIS distance
      const nearbyPlaces: any[] = await prisma.$queryRaw`
        SELECT *, ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}), 4326)) as "dist"
        FROM "Place"
        WHERE "category" = ${category && category !== 'All' ? category : "Heritage"} -- example filter logic
        ORDER BY "dist" ASC
        LIMIT 10
      `;
      // Note: This is a specialized nearby query. For now, we'll keep the standard return
      // but the database is now ready for high-perf nearby searches.
    }

    // Save to cache for 1 hour
    await setCachedData(cacheKey, places, 3600);

    res.json(places);
  } catch (error) {
    console.error('Error in getAllPlaces:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

export const getPlaceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `place:detail:${id}`;

    const cachedPlace = await getCachedData<any>(cacheKey);
    if (cachedPlace) return res.json(cachedPlace);

    const place = await prisma.place.findUnique({
      where: { id: Number(id) }
    });
    if (!place) return res.status(404).json({ error: 'Place not found' });

    await setCachedData(cacheKey, place, 3600);
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

    // Invalidate relevant caches
    await invalidateCache('places:*');
    await invalidateCache(`place:detail:${id}`);

    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle save status' });
  }
};
