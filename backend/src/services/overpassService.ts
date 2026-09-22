import axios from 'axios';
import redis from './cacheService';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];

// Expanded Bounding box for Pune metropolitan area (south, west, north, east)
const PUNE_BBOX = '18.30,73.65,18.75,74.15';

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

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
    // Word-boundary check: ensures 'mart' doesn't match inside 'Samarth', 'atm' doesn't match inside 'Mahatma', etc.
    const escapedKw = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escapedKw}([^a-zA-Z0-9]|$)`, 'i');
    if (regex.test(name)) {
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

export const fetchOSMPlacesByCategory = async (category: string, customBbox?: string): Promise<any[]> => {
  const targetBbox = customBbox || PUNE_BBOX;
  const cooldownKey = `places:discovery:cooldown:cat:${category.toLowerCase()}:${targetBbox}`;
  try {
    const isCooldownActive = await redis.get(cooldownKey);
    if (isCooldownActive) {
      console.log(`[OSM] Discovery cooldown active for category ${category}. Skipping query.`);
      return [];
    }
    await redis.set(cooldownKey, 'true', 'EX', 120); // 2 min cooldown
  } catch (err) {
    console.error('Redis error checking discovery category cooldown:', err);
  }

  let categoryFilter = '';
  switch (category) {
    case 'Heritage':
      categoryFilter = `
        node["historic"](${targetBbox});
        way["historic"](${targetBbox});
        node["tourism"="museum"](${targetBbox});
        way["tourism"="museum"](${targetBbox});
      `;
      break;
    case 'Temple':
      categoryFilter = `
        node["amenity"="place_of_worship"](${targetBbox});
        way["amenity"="place_of_worship"](${targetBbox});
      `;
      break;
    case 'Nature':
      categoryFilter = `
        node["leisure"~"park|nature_reserve|garden"](${targetBbox});
        way["leisure"~"park|nature_reserve|garden"](${targetBbox});
        node["tourism"~"zoo|viewpoint"](${targetBbox});
        way["tourism"~"zoo|viewpoint"](${targetBbox});
      `;
      break;
    case 'Food':
      categoryFilter = `
        node["amenity"~"restaurant|cafe"](${targetBbox});
        way["amenity"~"restaurant|cafe"](${targetBbox});
      `;
      break;
    case 'Wellness':
      categoryFilter = `
        node["amenity"="spa"](${targetBbox});
        way["amenity"="spa"](${targetBbox});
        node["leisure"="resort"](${targetBbox});
        way["leisure"="resort"](${targetBbox});
        node["name"~"Spa|Wellness|Yoga|Ayurveda|Meditation",i](${targetBbox});
        way["name"~"Spa|Wellness|Yoga|Ayurveda|Meditation",i](${targetBbox});
      `;
      break;
    default:
      categoryFilter = `
        node["tourism"="attraction"](${targetBbox});
        way["tourism"="attraction"](${targetBbox});
      `;
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${categoryFilter.trim()}
    );
    out center 30;
  `;

  return executeOverpassQuery(overpassQuery);
};

/**
 * Live Map Viewport Retrieval:
 * Fetches real tourist spots within the user's visible map bounding box.
 */
export const fetchOSMPlacesInBounds = async (bbox: BoundingBox, category?: string): Promise<any[]> => {
  // Validate and clamp coordinates to Pune metropolitan region
  const south = Math.max(18.20, Math.min(bbox.south, bbox.north));
  const north = Math.min(18.90, Math.max(bbox.south, bbox.north));
  const west = Math.max(73.50, Math.min(bbox.west, bbox.east));
  const east = Math.min(74.25, Math.max(bbox.west, bbox.east));

  const bboxStr = `${south},${west},${north},${east}`;

  let categoryFilter = '';
  switch (category) {
    case 'Heritage':
      categoryFilter = `
        node["historic"](${bboxStr});
        way["historic"](${bboxStr});
        node["tourism"="museum"](${bboxStr});
        way["tourism"="museum"](${bboxStr});
      `;
      break;
    case 'Temple':
      categoryFilter = `
        node["amenity"="place_of_worship"](${bboxStr});
        way["amenity"="place_of_worship"](${bboxStr});
      `;
      break;
    case 'Nature':
      categoryFilter = `
        node["leisure"~"park|nature_reserve|garden"](${bboxStr});
        way["leisure"~"park|nature_reserve|garden"](${bboxStr});
        node["tourism"~"zoo|viewpoint"](${bboxStr});
        way["tourism"~"zoo|viewpoint"](${bboxStr});
        node["natural"~"water|peak"](${bboxStr});
        way["natural"~"water|peak"](${bboxStr});
      `;
      break;
    case 'Food':
      categoryFilter = `
        node["amenity"~"restaurant|cafe"](${bboxStr});
        way["amenity"~"restaurant|cafe"](${bboxStr});
        node["shop"~"bakery|ice_cream"](${bboxStr});
        way["shop"~"bakery|ice_cream"](${bboxStr});
      `;
      break;
    case 'Wellness':
      categoryFilter = `
        node["amenity"="spa"](${bboxStr});
        way["amenity"="spa"](${bboxStr});
        node["leisure"="resort"](${bboxStr});
        way["leisure"="resort"](${bboxStr});
        node["name"~"Spa|Wellness|Yoga|Ayurveda|Meditation",i](${bboxStr});
        way["name"~"Spa|Wellness|Yoga|Ayurveda|Meditation",i](${bboxStr});
      `;
      break;
    default:
      // Live map scan across all 5 high-quality tourist categories
      categoryFilter = `
        node["historic"](${bboxStr});
        way["historic"](${bboxStr});
        node["tourism"~"attraction|museum|viewpoint|zoo"](${bboxStr});
        way["tourism"~"attraction|museum|viewpoint|zoo"](${bboxStr});
        node["amenity"="place_of_worship"](${bboxStr});
        way["amenity"="place_of_worship"](${bboxStr});
        node["leisure"~"park|nature_reserve|garden|resort"](${bboxStr});
        way["leisure"~"park|nature_reserve|garden|resort"](${bboxStr});
        node["amenity"~"restaurant|cafe|spa"](${bboxStr});
        way["amenity"~"restaurant|cafe|spa"](${bboxStr});
      `;
  }

  const query = `
    [out:json][timeout:25];
    (
      ${categoryFilter.trim()}
    );
    out center 40;
  `;

  return executeOverpassQuery(query);
};

export const executeOverpassQuery = async (query: string): Promise<any[]> => {
  let lastError: any = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(endpoint, `data=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'PuneTourGuideApp/1.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      });
      const elements = response.data?.elements || [];

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

          // Bounding check for Pune Region (expanded to encompass Sinhagad, Khadakwasla, PCMC)
          if (latitude < 18.20 || latitude > 18.90 || longitude < 73.50 || longitude > 74.25) {
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
            tag: "Live Discovery",
            tagColor: "indigo",
            bgColor: "#ECEAF8",
            description: el.tags.description || `Discovered tourist spot in Pune: ${el.tags.name}.`
          };
        })
        .filter((p: any) => p !== null && p.name && p.latitude && p.longitude);
    } catch (error: any) {
      console.warn(`[OSM] Request failed on ${endpoint}: ${error.message}. Retrying mirror...`);
      lastError = error;
    }
  }

  console.error('[OSM] All Overpass API mirrors failed:', lastError?.message);
  return [];
};
