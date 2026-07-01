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

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { days, categories, pace, accessibleOnly, userLanguage } = req.body;
    const userId = req.user.id;

    const daysCount = Number(days) || 1;
    const selectedCategories = Array.isArray(categories) ? categories : ['Heritage'];
    const selectedPace = pace || 'Relaxed';
    const isAccessibleOnly = Boolean(accessibleOnly);
    const lang = userLanguage || 'English';

    // 1. Query candidate places from database
    const places = await prisma.place.findMany({
      where: {
        category: {
          in: selectedCategories
        },
        ...(isAccessibleOnly ? { accessible: true } : {})
      }
    });

    if (places.length === 0) {
      return res.status(404).json({ error: 'No matching places found to generate an itinerary' });
    }

    // Determine number of stops per day
    const stopsPerDay = selectedPace === 'Relaxed' ? 3 : 5;
    const totalStopsNeeded = daysCount * stopsPerDay;

    let selectedStops: { placeId: number; aiReason: string }[] = [];

    // 2. Select places using Gemini or Fallback Selector
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `
You are Punekar AI, an expert local travel guide assistant for Pune, Maharashtra.
Generate a cohesive travel itinerary based on the user's preferences:
- Duration: ${daysCount} Days
- Categories: ${selectedCategories.join(', ')}
- Accessibility needed: ${isAccessibleOnly ? 'Yes (Wheelchair accessible only)' : 'No'}
- Pace: ${selectedPace} (${stopsPerDay} stops per day)
- Language: ${lang}

Available places in Pune to choose from (only choose from these candidates, using their IDs):
${JSON.stringify(places.map(p => ({ id: p.id, name: p.name, category: p.category, rating: p.rating, accessible: p.accessible, description: p.description })))}

Instructions:
1. Select exactly the best places from the list. Choose a total of up to ${totalStopsNeeded} places.
2. Group them into Days (Day 1, Day 2, etc.) up to ${daysCount} Days.
3. For each selected place, generate a personalized "aiReason" in the requested language (${lang}) explaining why you chose this spot for the user.
4. Return ONLY a JSON object matching this schema:
{
  "itinerary": [
    {
      "day": number,
      "stops": [
        {
          "placeId": number,
          "aiReason": "string explanation in ${lang}"
        }
      ]
    }
  ]
}
Do not include any conversational markdown tags or prefix/suffix. Just return the raw JSON.
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(geminiUrl, {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          if (parsed && Array.isArray(parsed.itinerary)) {
            for (const d of parsed.itinerary) {
              if (Array.isArray(d.stops)) {
                for (const s of d.stops) {
                  selectedStops.push({
                    placeId: Number(s.placeId),
                    aiReason: s.aiReason
                  });
                }
              }
            }
          }
        }
      } catch (geminiError) {
        console.error("Gemini Generation failed, running fallback selector:", geminiError);
      }
    }

    // Fallback if Gemini failed or wasn't configured
    if (selectedStops.length === 0) {
      // Sort by rating desc
      const sortedPlaces = [...places].sort((a, b) => b.rating - a.rating);
      const chosenPlaces = sortedPlaces.slice(0, totalStopsNeeded);

      chosenPlaces.forEach((place, index) => {
        const dayNumber = Math.floor(index / stopsPerDay) + 1;
        if (dayNumber <= daysCount) {
          let reason = '';
          if (lang === 'Marathi') {
            reason = `आपल्या ${place.category} आवडीनुसार आणि ${place.rating?.toFixed(1) || '4.0'} रेटिंगमुळे आम्ही ${place.name_mr || place.name} निवडले आहे.`;
          } else if (lang === 'Hindi') {
            reason = `आपकी ${place.category} रुचि और ${place.rating?.toFixed(1) || '4.0'} रेटिंग के आधार पर हमने ${place.name_mr || place.name} को चुना है।`;
          } else if (lang === 'Gujarati') {
            reason = `તમારી ${place.category} પસંદગી અને ${place.rating?.toFixed(1) || '4.0'} રેટિંગ મુજબ અમે ${place.name} પસંદ કર્યું છે.`;
          } else {
            reason = `We selected ${place.name} for you because it matches your interest in ${place.category} with a rating of ${place.rating?.toFixed(1) || '4.0'}.`;
          }

          selectedStops.push({
            placeId: place.id,
            aiReason: reason
          });
        }
      });
    }

    // 3. Clear existing itinerary days and stops for the user
    await prisma.itineraryDay.deleteMany({
      where: { userId }
    });

    // 4. Create ItineraryDays and ItineraryStops with OSRM optimization
    const createdItinerary = [];

    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const dayLabel = lang === 'Marathi' ? `दिवस ${dayNum}` : lang === 'Hindi' ? `दिन ${dayNum}` : lang === 'Gujarati' ? `દિવસ ${dayNum}` : `Day ${dayNum}`;
      
      // Create the day record
      const itDay = await prisma.itineraryDay.create({
        data: {
          day: dayNum,
          label: dayLabel,
          userId
        }
      });

      // Filter selected stops for this day
      const dayStopsInfo = selectedStops.slice((dayNum - 1) * stopsPerDay, dayNum * stopsPerDay);
      const dayStopsData: any[] = [];

      for (const info of dayStopsInfo) {
        const place = places.find(p => p.id === info.placeId);
        if (place) {
          dayStopsData.push({
            place,
            aiReason: info.aiReason
          });
        }
      }

      // If we have stops, optimize order using OSRM Trip API (or simple distance sorting fallback)
      if (dayStopsData.length > 0) {
        let sortedStopsData = [...dayStopsData];

        if (dayStopsData.length >= 2) {
          try {
            const coordsStr = dayStopsData.map(s => `${s.place.longitude},${s.place.latitude}`).join(';');
            const url = `https://router.project-osrm.org/trip/v1/driving/${coordsStr}?source=first&destination=any&roundtrip=false`;
            const response = await axios.get(url);
            if (response.data?.code === 'Ok' && response.data?.waypoints) {
              const sortedWaypoints = [...response.data.waypoints].sort((a: any, b: any) => a.trips_index - b.trips_index);
              sortedStopsData = sortedWaypoints.map((wp: any) => dayStopsData[wp.waypoint_index]);
            }
          } catch (osrmError) {
            console.error("OSRM Trip Optimization failed for generated day:", osrmError);
          }
        }

        // Save stops to DB
        for (let i = 0; i < sortedStopsData.length; i++) {
          const item = sortedStopsData[i];
          const timeLabel = `${9 + i * 2}:00 ${9 + i * 2 >= 12 ? 'PM' : 'AM'}`;
          
          await prisma.itineraryStop.create({
            data: {
              itineraryDayId: itDay.id,
              time: timeLabel,
              name: item.place.name,
              name_mr: item.place.name_mr,
              desc: item.place.description,
              desc_mr: item.place.description_mr,
              dotColor: getCategoryColor(item.place.category),
              order: i,
              tags: [
                { label: item.place.category, type: item.place.category.toLowerCase() },
                { label: "AI Recommended", type: "ai", reason: item.aiReason }
              ]
            }
          });
        }
      }

      // Retrieve full created day details to return
      const finalDay = await prisma.itineraryDay.findUnique({
        where: { id: itDay.id },
        include: {
          stops: {
            orderBy: { order: 'asc' }
          }
        }
      });
      createdItinerary.push(finalDay);
    }

    res.json(createdItinerary);
  } catch (error) {
    console.error("Failed to generate itinerary:", error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Heritage": return "#8B3A2A";
    case "Temple": return "#B87318";
    case "Nature": return "#2E593A";
    case "Food": return "#8F4F24";
    case "Wellness": return "#4A6E82";
    default: return "#6B5B52";
  }
};
