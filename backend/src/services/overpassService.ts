import axios from 'axios';
import redis from './cacheService';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Bounding box for Pune (approx)
// south, west, north, east
const PUNE_BBOX = '18.41,73.71,18.65,74.01';

export interface OSMPlace {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    tourism?: string;
    historic?: string;
    description?: string;
    website?: string;
    phone?: string;
    'opening_hours'?: string;
    addr?: string;
    'addr:street'?: string;
    'addr:city'?: string;
  };
}

const mapCategory = (tags: any): string => {
  const name = (tags.name || '').toLowerCase();
  
  // Strict tourist filtering: ignore non-tourist establishments
  const skipKeywords = [
    'society', 'apartment', 'villa', 'building', 'bank', 'atm', 'nursing', 'clinic', 'hospital', 
    'school', 'college', 'institute', 'academy', 'business', 'office', 'company', 'industrial', 
    'residential', 'hostel', 'pg', 'stores', 'shop', 'service', 'center', 'centre', 'mall'
  ];
  
  if (skipKeywords.some(kw => name.includes(kw))) return 'Skip';
  if (tags.residential || tags.industrial || tags.office || tags.landuse === 'residential' || tags.amenity === 'bank') return 'Skip';

  // Heritage sites in Pune
  if (tags.historic || tags.tourism === 'museum' || tags.tourism === 'artwork' || name.includes('fort') || name.includes('wada') || name.includes('palace')) return 'Heritage';
  
  // Temples and religious sites
  if (tags.amenity === 'place_of_worship' || tags.building === 'temple' || name.includes('temple') || name.includes('mandir') || name.includes('gurudwara') || name.includes('mosque')) return 'Temple';
  
  // Nature and Parks
  if (tags.tourism === 'zoo' || tags.leisure === 'park' || tags.leisure === 'nature_reserve' || tags.tourism === 'viewpoint' || name.includes('garden') || name.includes('lake') || name.includes('hill') || name.includes('tekdi')) return 'Nature';
  
  // Famous Food spots
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') return 'Food';
  
  // Wellness
  if (name.includes('spa') || name.includes('wellness') || tags.amenity === 'spa' || tags.leisure === 'resort') return 'Wellness';
  
  // If it's a generic tourist attraction, put it in Heritage or Nature depending on keywords
  if (tags.tourism === 'attraction') {
    if (name.includes('garden') || name.includes('park')) return 'Nature';
    return 'Heritage'; // Default for attractions in Pune
  }
  
  return 'Skip';
};

const mapEmoji = (category: string): string => {
  switch (category) {
    case 'Heritage': return '🏰';
    case 'Temple': return '⛩️';
    case 'Nature': return '🌿';
    case 'Food': return '🍽️';
    case 'Wellness': return '🧘';
    default: return '📍';
  }
};

export const searchOSMPlaces = async (query: string): Promise<any[]> => {
  const cooldownKey = `places:discovery:cooldown:search:${query.toLowerCase().trim()}`;
  try {
    const isCooldownActive = await redis.get(cooldownKey);
    if (isCooldownActive) {
      console.log(`[OSM] Discovery cooldown active for search query: ${query}. Skipping query.`);
      return [];
    }
    await redis.set(cooldownKey, 'true', 'EX', 300); // 5 min cooldown
  } catch (err) {
    console.error('Redis error checking search cooldown:', err);
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["name"~"${query}",i]["tourism"](${PUNE_BBOX});
      node["name"~"${query}",i]["historic"](${PUNE_BBOX});
      node["name"~"${query}",i]["amenity"~"restaurant|cafe|place_of_worship"](${PUNE_BBOX});
      way["name"~"${query}",i]["tourism"](${PUNE_BBOX});
      way["name"~"${query}",i]["historic"](${PUNE_BBOX});
      way["name"~"${query}",i]["amenity"~"restaurant|cafe|place_of_worship"](${PUNE_BBOX});
    );
    out center;
  `;

  return executeOverpassQuery(overpassQuery);
};

export const fetchOSMPlacesByCategory = async (category: string): Promise<any[]> => {
  const cooldownKey = `places:discovery:cooldown:cat:${category.toLowerCase()}`;
  try {
    const isCooldownActive = await redis.get(cooldownKey);
    if (isCooldownActive) {
      console.log(`[OSM] Discovery cooldown active for category ${category}. Skipping query.`);
      return [];
    }
    await redis.set(cooldownKey, 'true', 'EX', 300); // 5 min cooldown
  } catch (err) {
    console.error('Redis error checking discovery category cooldown:', err);
  }

  let categoryFilter = '';
  switch (category) {
    case 'Heritage':
      categoryFilter = 'node["historic"]; way["historic"]; node["tourism"="museum"]; way["tourism"="museum"];';
      break;
    case 'Temple':
      categoryFilter = 'node["amenity"="place_of_worship"]; way["amenity"="place_of_worship"];';
      break;
    case 'Nature':
      categoryFilter = 'node["leisure"~"park|nature_reserve"]; way["leisure"~"park|nature_reserve"]; node["tourism"~"zoo|viewpoint"]; way["tourism"~"zoo|viewpoint"];';
      break;
    case 'Food':
      categoryFilter = 'node["amenity"~"restaurant|cafe"]; way["amenity"~"restaurant|cafe"];';
      break;
    case 'Wellness':
      categoryFilter = 'node["amenity"="spa"]; way["amenity"="spa"]; node["leisure"="resort"]; way["leisure"="resort"]; node["name"~"Spa|Wellness",i]; way["name"~"Spa|Wellness",i];';
      break;
    default:
      categoryFilter = 'node["tourism"="attraction"]; way["tourism"="attraction"];';
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${categoryFilter.split(';').filter(f => f.trim()).map(f => `${f.trim()}(${PUNE_BBOX});`).join('\n      ')}
    );
    out center 20;
  `;

  return executeOverpassQuery(overpassQuery);
};

const executeOverpassQuery = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'PuneTourGuideApp/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const elements = response.data.elements || [];

    return elements.map((el: any) => {
      const category = mapCategory(el.tags);
      if (category === 'Skip') return null;

      return {
        osmId: String(el.id),
        name: el.tags.name,
        emoji: mapEmoji(category),
        category: category,
        rating: Number((4.0 + Math.random() * 0.8).toFixed(2)),
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        distance: "Calculating...",
        entryFee: "Check locally",
        estYear: el.tags.start_date || "—",
        visitTime: "1-2h",
        hours: el.tags.opening_hours || "Contact for hours",
        phone: el.tags.phone || el.tags['contact:phone'] || "—",
        address: el.tags['addr:street'] ? `${el.tags['addr:street']}, Pune` : "Pune",
        accessible: el.tags.wheelchair === 'yes',
        guidedTours: false,
        tag: "New Discovery",
        tagColor: "indigo",
        bgColor: "#ECEAF8",
        description: el.tags.description || `A discovered location: ${el.tags.name} in Pune.`
      };
    }).filter((p: any) => p !== null && p.name);
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
};
