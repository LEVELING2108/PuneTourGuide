import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { searchOSMPlaces, fetchOSMPlacesByCategory, fetchOSMPlacesInBounds } from '../services/overpassService';
import { getCachedData, setCachedData, invalidateCache } from '../services/cacheService';

const prisma = new PrismaClient();

const getOptionalUserId = (req: Request): number | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    return decoded.id;
  } catch {
    return null;
  }
};

const saveDiscoveredPlaces = async (discoveredPlaces: any[]): Promise<any[]> => {
  if (discoveredPlaces.length === 0) return [];
  
  const saved: any[] = [];
  for (const p of discoveredPlaces) {
    const { latitude, longitude, ...rest } = p;
    
    // 1. Upsert basic data
    const upserted = await prisma.place.upsert({
      where: { osmId: p.osmId },
      update: { latitude, longitude }, 
      create: { ...rest, latitude, longitude }
    });
    saved.push(upserted);

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
  return saved;
};

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const { category, q, isSaved, isDiscovered, bbox, live } = req.query;
    const currentUserId = getOptionalUserId(req);

    // 1. User-scoped bookmarks request: Never share or contaminate global catalog cache
    if (isSaved === 'true') {
      if (!currentUserId) {
        return res.json([]);
      }

      const userSavedRecords = await prisma.userSavedPlace.findMany({
        where: { userId: currentUserId },
        include: { place: true },
        orderBy: { createdAt: 'desc' }
      });

      const savedPlaces = userSavedRecords.map((record) => ({
        ...record.place,
        isSaved: true
      }));

      return res.json(savedPlaces);
    }
    
    // 2. Handle Live Map Viewport Bounding Box (bbox = south,west,north,east)
    if (bbox) {
      const parts = String(bbox).split(',').map(Number);
      if (parts.length === 4 && parts.every((num) => !isNaN(num))) {
        const [south, west, north, east] = parts;
        const where: any = {
          latitude: { gte: Math.min(south, north), lte: Math.max(south, north) },
          longitude: { gte: Math.min(west, east), lte: Math.max(west, east) }
        };

        if (category && category !== 'All') {
          where.category = String(category);
        }

        let places = await prisma.place.findMany({
          where,
          orderBy: { rating: 'desc' }
        });

        // If live refresh requested or few places exist in this map area, fetch directly from OpenStreetMap
        if (live === 'true' || places.length < 4) {
          console.log(`[OSM] Fetching live places in map bounds [${south}, ${west}, ${north}, ${east}] for category ${category || 'All'}...`);
          try {
            const discovered = await fetchOSMPlacesInBounds(
              { south, west, north, east },
              category && category !== 'All' ? String(category) : undefined
            );
            if (discovered.length > 0) {
              await saveDiscoveredPlaces(discovered);
              places = await prisma.place.findMany({
                where,
                orderBy: { rating: 'desc' }
              });
            }
          } catch (osmErr) {
            console.error('[OSM] Error fetching places in bounds:', osmErr);
          }
        }

        // Decorate with user bookmarks
        let userSavedPlaceIds = new Set<number>();
        if (currentUserId && places.length > 0) {
          const userSaves = await prisma.userSavedPlace.findMany({
            where: {
              userId: currentUserId,
              placeId: { in: places.map((p) => p.id) }
            },
            select: { placeId: true }
          });
          userSavedPlaceIds = new Set(userSaves.map((s) => s.placeId));
        }

        return res.json(places.map((p) => ({ ...p, isSaved: userSavedPlaceIds.has(p.id) })));
      }
    }

    // 3. Global Catalog Cache Key (independent of user bookmark mutations)
    const cacheKey = `places:v5:${category || 'all'}:${q || 'none'}:${isDiscovered || 'any'}`;
    
    // Check cache first for catalog queries unless live refresh requested
    let places = live === 'true' ? null : await getCachedData<any[]>(cacheKey);
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

      // Synchronous Category Hydration from OpenStreetMap if DB count is low (e.g. Wellness)
      if (category && category !== 'All' && places.length < 5 && !q) {
        console.log(`[OSM] Low count for category ${category} (${places.length}). Hydrating from OpenStreetMap...`);
        try {
          const discovered = await fetchOSMPlacesByCategory(String(category));
          if (discovered.length > 0) {
            await saveDiscoveredPlaces(discovered);
            places = await prisma.place.findMany({
              where,
              orderBy: { rating: 'desc' }
            });
          }
        } catch (osmErr) {
          console.error('[OSM] Error hydrating category:', osmErr);
        }
      }

      // Synchronous Search Hydration if zero or low results found
      if (q && places.length < 3) {
        console.log(`[OSM] Low search results for "${q}" (${places.length}). Searching OpenStreetMap...`);
        try {
          const discovered = await searchOSMPlaces(String(q));
          if (discovered.length > 0) {
            await saveDiscoveredPlaces(discovered);
            places = await prisma.place.findMany({
              where,
              orderBy: { rating: 'desc' }
            });
          }
        } catch (osmErr) {
          console.error('[OSM] Error searching OSM:', osmErr);
        }
      }

      // Cache raw catalog results for 1 hour
      if (places.length > 0) {
        await setCachedData(cacheKey, places, 3600);
      }
    }

    // 4. User bookmark personalization in-memory
    let userSavedPlaceIds = new Set<number>();
    if (currentUserId && places.length > 0) {
      const userSaves = await prisma.userSavedPlace.findMany({
        where: {
          userId: currentUserId,
          placeId: { in: places.map((p) => p.id) }
        },
        select: { placeId: true }
      });
      userSavedPlaceIds = new Set(userSaves.map((s) => s.placeId));
    }

    const decoratedPlaces = places.map((p) => ({
      ...p,
      isSaved: userSavedPlaceIds.has(p.id)
    }));

    res.json(decoratedPlaces);
  } catch (error) {
    console.error('Error in getAllPlaces:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

export const getPlaceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = getOptionalUserId(req);
    const cacheKey = `place:detail:${id}`;

    let place = await getCachedData<any>(cacheKey);
    if (!place) {
      place = await prisma.place.findUnique({
        where: { id: Number(id) }
      });
      if (!place) return res.status(404).json({ error: 'Place not found' });
      await setCachedData(cacheKey, place, 3600);
    }

    let isSavedForUser = false;
    if (currentUserId) {
      const userSave = await prisma.userSavedPlace.findUnique({
        where: {
          userId_placeId: {
            userId: currentUserId,
            placeId: Number(id)
          }
        }
      });
      isSavedForUser = Boolean(userSave);
    }

    res.json({
      ...place,
      isSaved: isSavedForUser
    });
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
    const placeId = Number(id);

    const place = await prisma.place.findUnique({
      where: { id: placeId }
    });

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const shouldSave = Boolean(isSaved);
    const existingSave = await prisma.userSavedPlace.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId
        }
      }
    });

    if (shouldSave && !existingSave) {
      await prisma.userSavedPlace.create({
        data: {
          userId,
          placeId
        }
      });

      // Award XP (+10 XP) for new user bookmark
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 10 } }
      });
      console.log(`[XP] User ${userId} gained +10 XP for saving place: ${place.name}`);
    } else if (!shouldSave && existingSave) {
      await prisma.userSavedPlace.delete({
        where: {
          userId_placeId: {
            userId,
            placeId
          }
        }
      });
    }

    // Invalidate single place detail cache only (never purge entire catalog cache)
    await invalidateCache(`place:detail:${placeId}`);

    res.json({
      ...place,
      isSaved: shouldSave
    });
  } catch (error) {
    console.error('Failed to toggle save status:', error);
    res.status(500).json({ error: 'Failed to toggle save status' });
  }
};
