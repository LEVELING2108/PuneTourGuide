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

/**
 * Strict Negative Filtering:
 * Automatically excludes non-tourist locations such as:
 * - Housing Societies / Apartments / Villas / Residencies / Towers / Colonies
 * - Banks / ATMs / Offices / IT Parks / Industrial sites / Companies / Warehouses
 * - Nursing Homes / Clinics / Hospitals / Diagnostic Labs / Pharmacies
 * - Schools / Colleges / Institutes / Classes / Coaching
 * - Generic Shops / Malls / Supermarkets / Repair Garages (unless food/wellness)
 */
export const isNonTouristLocation = (tags: any = {}): boolean => {
  if (!tags) return true;

  const name = (tags.name || '').toLowerCase().trim();
  if (!name) return true;

  // 1. Structural Tag-based negative filtering
  if (
    tags.residential ||
    tags.industrial ||
    tags.office ||
    tags.landuse === 'residential' ||
    tags.landuse === 'industrial' ||
    tags.landuse === 'commercial' ||
    tags.landuse === 'construction' ||
    tags.building === 'apartments' ||
    tags.building === 'residential' ||
    tags.building === 'house' ||
    tags.building === 'commercial' ||
    tags.building === 'industrial' ||
    tags.building === 'office' ||
    tags.building === 'hospital' ||
    tags.building === 'school' ||
    tags.building === 'college' ||
    tags.building === 'dormitory'
  ) {
    return true;
  }

  // Amenity exclusions (banks, atms, hospitals, schools, government, fuel, parking, etc.)
  const excludedAmenities = [
    'bank', 'atm', 'hospital', 'clinic', 'doctors', 'dentist', 'pharmacy',
    'nursing_home', 'veterinary', 'school', 'college', 'university', 'kindergarten',
    'childcare', 'language_school', 'music_school', 'driving_school',
    'police', 'post_office', 'fire_station', 'courthouse', 'townhall',
    'prison', 'fuel', 'charging_station', 'parking', 'car_wash', 'car_repair',
    'waste_disposal', 'recycling', 'telephone', 'vending_machine', 'social_facility'
  ];
  if (tags.amenity && excludedAmenities.includes(tags.amenity.toLowerCase())) {
    return true;
  }

  // Shop exclusions (generic shops, electronics, hardware, marts unless food/wellness)
  const allowedFoodShops = ['bakery', 'confectionery', 'deli', 'ice_cream', 'tea', 'coffee', 'pastry'];
  if (tags.shop && !allowedFoodShops.includes(tags.shop.toLowerCase())) {
    return true;
  }

  // 2. Keyword-based negative filtering (English, Marathi, and Hinglish transliterations)
  const nonTouristKeywords = [
    // Housing / Residential
    'society', 'apartment', 'apartments', 'villa', 'villas', 'residency', 'enclave',
    'heights', 'towers', 'tower', 'niwas', 'sadan', 'chawl', 'colony',
    'housing', 'co-op', 'cooperative', 'hostel', 'pg', 'dormitory', 'bldg', 'wing',
    'vihar', 'greens', 'county', 'meadows', 'paradise', 'palms',

    // Financial / Corporate / Industrial
    'bank', 'atm', 'office', 'company', 'business', 'corporate', 'industries', 'industrial',
    'enterprise', 'enterprises', 'associates', 'consultancy', 'solutions', 'technologies',
    'infotech', 'software', 'pvt ltd', 'limited', 'warehouse', 'godown', 'depot',
    'motors', 'garage', 'tyres', 'hardware', 'stationery', 'tailor', 'laundry', 'dry cleaner',

    // Healthcare
    'nursing', 'clinic', 'hospital', 'rugnalaya', 'dispensary', 'maternity', 'diagnostic',
    'pathology', 'laboratory', 'lab', 'dental', 'chemist', 'medical', 'healthcare',

    // Education
    'school', 'college', 'institute', 'academy', 'vidyalaya', 'prashala', 'vidyapeeth',
    'shikshan', 'polytechnic', 'classes', 'coaching', 'tuition', 'study center',

    // Generic Commercial / Malls / Retail
    'stores', 'store', 'shop', 'service', 'center', 'centre', 'supermarket', 'mart',
    'kirana', 'provision', 'bazaar', 'mall'
  ];

  for (const kw of nonTouristKeywords) {
    if (name.includes(kw)) {
      return true;
    }
  }

  return false;
};

/**
 * Strict Tourist Category Mapping:
 * Maps eligible locations exclusively to: Heritage, Temple, Nature, Food, Wellness.
 * Returns 'Skip' for any non-tourist location.
 */
export const mapCategory = (tags: any = {}): string => {
  if (isNonTouristLocation(tags)) {
    return 'Skip';
  }

  const name = (tags.name || '').toLowerCase();

  // 1. Heritage sites in Pune (forts, wadas, museums, palaces, memorials)
  if (
    tags.historic ||
    tags.tourism === 'museum' ||
    tags.tourism === 'artwork' ||
    name.includes('fort') ||
    name.includes('wada') ||
    name.includes('palace') ||
    name.includes('caves') ||
    name.includes('monument') ||
    name.includes('memorial') ||
    name.includes('heritage')
  ) {
    return 'Heritage';
  }

  // 2. Temples and religious shrines
  if (
    tags.amenity === 'place_of_worship' ||
    tags.building === 'temple' ||
    name.includes('temple') ||
    name.includes('mandir') ||
    name.includes('ganpati') ||
    name.includes('shrine') ||
    name.includes('gurudwara') ||
    name.includes('mosque') ||
    name.includes('dargah') ||
    name.includes('church') ||
    name.includes('cathedral') ||
    name.includes('devasthan')
  ) {
    return 'Temple';
  }

  // 3. Nature, Parks, Hills, Viewpoints, Lakes
  if (
    tags.leisure === 'park' ||
    tags.leisure === 'nature_reserve' ||
    tags.leisure === 'garden' ||
    tags.tourism === 'zoo' ||
    tags.tourism === 'viewpoint' ||
    tags.natural === 'peak' ||
    tags.natural === 'water' ||
    name.includes('garden') ||
    name.includes('park') ||
    name.includes('lake') ||
    name.includes('talav') ||
    name.includes('hill') ||
    name.includes('tekdi') ||
    name.includes('ghat') ||
    name.includes('waterfall') ||
    name.includes('falls') ||
    name.includes('sanctuary') ||
    name.includes('forest')
  ) {
    return 'Nature';
  }

  // 4. Food (Restaurants, Cafes, Bakeries)
  if (
    tags.amenity === 'restaurant' ||
    tags.amenity === 'cafe' ||
    tags.shop === 'bakery' ||
    tags.shop === 'ice_cream' ||
    name.includes('bhojanalay') ||
    name.includes('bhojnalaya') ||
    name.includes('misal') ||
    name.includes('baker') ||
    name.includes('bakery') ||
    name.includes('thali') ||
    name.includes('cafe') ||
    name.includes('coffee')
  ) {
    return 'Food';
  }

  // 5. Wellness (Spas, Resorts, Yoga, Meditation Retreats)
  if (
    tags.amenity === 'spa' ||
    tags.leisure === 'resort' ||
    name.includes('spa') ||
    name.includes('wellness') ||
    name.includes('resort') ||
    name.includes('yoga') ||
    name.includes('meditation') ||
    name.includes('ayurveda') ||
    name.includes('naturopathy')
  ) {
    return 'Wellness';
  }

  // Generic attractions with matched keywords
  if (tags.tourism === 'attraction') {
    if (name.includes('garden') || name.includes('lake') || name.includes('hill') || name.includes('view')) {
      return 'Nature';
    }
    if (name.includes('fort') || name.includes('wada') || name.includes('palace') || name.includes('museum')) {
      return 'Heritage';
    }
  }

  return 'Skip';
};

export const mapEmoji = (category: string): string => {
  switch (category) {
    case 'Heritage': return '🏰';
    case 'Temple': return '⛩️';
    case 'Nature': return '🌿';
    case 'Food': return '🍽️';
    case 'Wellness': return '🧘';
    default: return '📍';
  }
};

/**
 * Safely escapes user search queries for interpolation into Overpass QL regular expressions.
 * Trims input, limits length to prevent ReDoS, and escapes Overpass and Regex metacharacters.
 */
export const escapeOverpassRegex = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, 80);
  return trimmed.replace(/[\\^$*+?.()|[\]{}"']/g, '\\$&');
};

export const searchOSMPlaces = async (query: string): Promise<any[]> => {
  const sanitizedQuery = escapeOverpassRegex(query);
  if (!sanitizedQuery) {
    return [];
  }

  const cooldownKey = `places:discovery:cooldown:search:${sanitizedQuery.toLowerCase()}`;
  try {
    const isCooldownActive = await redis.get(cooldownKey);
    if (isCooldownActive) {
      console.log(`[OSM] Discovery cooldown active for search query: ${sanitizedQuery}. Skipping query.`);
      return [];
    }
    await redis.set(cooldownKey, 'true', 'EX', 300); // 5 min cooldown
  } catch (err) {
    console.error('Redis error checking search cooldown:', err);
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["name"~"${sanitizedQuery}",i]["tourism"](${PUNE_BBOX});
      node["name"~"${sanitizedQuery}",i]["historic"](${PUNE_BBOX});
      node["name"~"${sanitizedQuery}",i]["amenity"~"restaurant|cafe|place_of_worship"](${PUNE_BBOX});
      way["name"~"${sanitizedQuery}",i]["tourism"](${PUNE_BBOX});
      way["name"~"${sanitizedQuery}",i]["historic"](${PUNE_BBOX});
      way["name"~"${sanitizedQuery}",i]["amenity"~"restaurant|cafe|place_of_worship"](${PUNE_BBOX});
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

    return elements
      .map((el: any) => {
        if (!el.tags || !el.tags.name) return null;

        const category = mapCategory(el.tags);
        if (category === 'Skip') return null;

        // Robust Way and Node coordinate support:
        // - 'node' provides el.lat and el.lon directly
        // - 'way' with 'out center' provides el.center.lat and el.center.lon as the centroid
        const latitude =
          el.lat != null ? Number(el.lat) : el.center?.lat != null ? Number(el.center.lat) : null;
        const longitude =
          el.lon != null ? Number(el.lon) : el.center?.lon != null ? Number(el.center.lon) : null;

        if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
          return null;
        }

        // Bounding check for Pune Region
        if (latitude < 18.25 || latitude > 18.85 || longitude < 73.55 || longitude > 74.20) {
          return null;
        }

        return {
          osmId: String(el.id),
          name: el.tags.name.trim(),
          emoji: mapEmoji(category),
          category: category,
          rating: Number((4.1 + Math.random() * 0.7).toFixed(2)),
          latitude,
          longitude,
          distance: "Calculating...",
          entryFee: "Check locally",
          estYear: el.tags.start_date || "—",
          visitTime: "1-2h",
          hours: el.tags.opening_hours || "Contact for hours",
          phone: el.tags.phone || el.tags['contact:phone'] || "—",
          address: el.tags['addr:street']
            ? `${el.tags['addr:street']}, Pune`
            : el.tags['addr:city']
            ? `${el.tags['addr:city']}, Pune`
            : "Pune, Maharashtra",
          accessible: el.tags.wheelchair === 'yes',
          guidedTours: false,
          tag: "New Discovery",
          tagColor: "indigo",
          bgColor: "#ECEAF8",
          description: el.tags.description || `Discovered tourist spot in Pune: ${el.tags.name}.`
        };
      })
      .filter((p: any) => p !== null && p.name && p.latitude && p.longitude);
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
};
