import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const itinerary = await prisma.itineraryDay.findMany({
      where: { userId },
      include: {
        stops: {
          orderBy: { order: 'asc' }
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

export const toggleStopStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { done } = req.body;
    const userId = req.user.id;

    // Enforce ownership: make sure the stop belongs to an itinerary day owned by the user
    const stop = await prisma.itineraryStop.findUnique({
      where: { id: Number(id) },
      include: { itineraryDay: true }
    });

    if (!stop || stop.itineraryDay.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this stop' });
    }

    const justCompleted = Boolean(done) && !stop.done;

    const updatedStop = await prisma.itineraryStop.update({
      where: { id: Number(id) },
      data: { done: Boolean(done) }
    });

    // Gamification persistence: award +50 XP if stop was completed
    if (justCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 50 } }
      });
      console.log(`[XP] User ${userId} gained +50 XP for completing stop: ${stop.name}`);
    }

    res.json(updatedStop);
  } catch (error) {
    console.error("Failed to update stop status:", error);
    res.status(500).json({ error: 'Failed to update stop status' });
  }
};

export const addStopToItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itineraryDayId, name, name_mr, time, desc, desc_mr, dotColor, tags } = req.body;
    const userId = req.user.id;

    // Ensure ownership of the itinerary day
    const day = await prisma.itineraryDay.findUnique({
      where: { id: Number(itineraryDayId) }
    });

    if (!day || day.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to add stops to this day' });
    }

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

export const deleteStopFromItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Ensure ownership of the stop
    const stop = await prisma.itineraryStop.findUnique({
      where: { id: Number(id) },
      include: { itineraryDay: true }
    });

    if (!stop || stop.itineraryDay.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this stop' });
    }

    await prisma.itineraryStop.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true, message: "Stop deleted successfully" });
  } catch (error) {
    console.error("Failed to delete stop:", error);
    res.status(500).json({ error: 'Failed to delete stop' });
  }
};

export const optimizeItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itineraryDayId, mode } = req.body;
    const userId = req.user.id;

    // 1. Verify day ownership
    const day = await prisma.itineraryDay.findFirst({
      where: { id: Number(itineraryDayId), userId }
    });

    if (!day) {
      return res.status(403).json({ error: 'Unauthorized or day not found' });
    }

    // 2. Fetch stops for this day
    const stops = await prisma.itineraryStop.findMany({
      where: { itineraryDayId: Number(itineraryDayId) }
    });

    if (stops.length < 3) {
      return res.json(stops);
    }

    // 3. Find matching coordinates for each stop
    const placeNames = stops.map(s => s.name.toLowerCase());
    const places = await prisma.place.findMany({
      where: {
        name: {
          in: placeNames,
          mode: 'insensitive'
        }
      }
    });

    // Map stops to their coordinates
    const stopsWithCoords = stops.map((stop, index) => {
      const matchedPlace = places.find(p => p.name.toLowerCase() === stop.name.toLowerCase());
      return {
        stop,
        index,
        lat: matchedPlace?.latitude,
        lng: matchedPlace?.longitude
      };
    }).filter(s => s.lat !== null && s.lng !== null && s.lat !== undefined && s.lng !== undefined);

    if (stopsWithCoords.length < 3) {
      return res.json(stops);
    }

    // 4. Query OSRM Trip API
    const profile = mode === 'Walking' ? 'foot' : 'driving';
    const coordsStr = stopsWithCoords.map(s => `${s.lng},${s.lat}`).join(';');
    
    // OSRM Trip API starting at the first coordinate
    const url = `https://router.project-osrm.org/trip/v1/${profile}/${coordsStr}?source=first&destination=any&roundtrip=false`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.code === 'Ok' && data.waypoints) {
      // Sort waypoints by trips_index to get optimized sequence
      const sortedWaypoints = [...data.waypoints].sort((a: any, b: any) => a.trips_index - b.trips_index);
      
      // Update stop orders
      for (let i = 0; i < sortedWaypoints.length; i++) {
        const wp = sortedWaypoints[i];
        const stopItem = stopsWithCoords[wp.waypoint_index];
        
        await prisma.itineraryStop.update({
          where: { id: stopItem.stop.id },
          data: { order: i }
        });
      }
      
      // Fetch optimized stops sorted by new order
      const optimizedStops = await prisma.itineraryStop.findMany({
        where: { itineraryDayId: Number(itineraryDayId) },
        orderBy: { order: 'asc' }
      });
      
      return res.json(optimizedStops);
    } else {
      console.warn('[OSRM] Optimization failed. Code:', data.code);
      return res.status(400).json({ error: 'Trip optimization failed' });
    }
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize itinerary' });
  }
};
