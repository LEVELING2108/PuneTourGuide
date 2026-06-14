import axios from 'axios';

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
  if (tags.historic) return 'Heritage';
  if (tags.amenity === 'place_of_worship' || tags.building === 'temple') return 'Temple';
  if (tags.tourism === 'zoo' || tags.leisure === 'park' || tags.leisure === 'nature_reserve') return 'Nature';
  if (name.includes('spa') || name.includes('wellness') || tags.amenity === 'spa' || tags.leisure === 'resort') return 'Wellness';
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'food_court') return 'Food';
  return 'Explore';
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
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["name"~"${query}",i](${PUNE_BBOX});
      way["name"~"${query}",i](${PUNE_BBOX});
    );
    out center;
  `;

  return executeOverpassQuery(overpassQuery);
};

export const fetchOSMPlacesByCategory = async (category: string): Promise<any[]> => {
  let categoryFilter = '';
  switch (category) {
    case 'Heritage':
      categoryFilter = 'node["historic"]; way["historic"];';
      break;
    case 'Temple':
      categoryFilter = 'node["amenity"="place_of_worship"]; way["amenity"="place_of_worship"];';
      break;
    case 'Nature':
      categoryFilter = 'node["leisure"~"park|nature_reserve"]; way["leisure"~"park|nature_reserve"]; node["tourism"="zoo"]; way["tourism"="zoo"];';
      break;
    case 'Food':
      categoryFilter = 'node["amenity"~"restaurant|cafe|food_court"]; way["amenity"~"restaurant|cafe|food_court"];';
      break;
    case 'Wellness':
      categoryFilter = 'node["amenity"="spa"]; way["amenity"="spa"]; node["leisure"="resort"]; way["leisure"="resort"]; node["name"~"Spa|Wellness",i]; way["name"~"Spa|Wellness",i];';
      break;
    default:
      categoryFilter = 'node["tourism"~"attraction|museum|viewpoint"]; way["tourism"~"attraction|museum|viewpoint"];';
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
    }).filter((p: any) => p.name);
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
};
