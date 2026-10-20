import { haversineKm } from '../lib/geo';
/**
 * Curated Pune catalogue for Pune Explorer.
 *
 * Hours and fees are as commonly published; leave a field empty when unsure (the app shows
 * "Check locally"). Nearest hospital is computed from HOSPITALS at seed time and can be refreshed
 * from live OpenStreetMap data with `npm run refresh:hospitals` (uses the safety service).
 */

export type CatalogueCategory = 'Heritage' | 'Temple' | 'Fort' | 'Museum' | 'Nature' | 'Food';

export type CataloguePlace = {
  name: string;
  name_mr: string;
  category: CatalogueCategory;
  /** Sub-type used by Deccan chips: Wada, Hill, Food lane, Cave temple… */
  kind?: string;
  area: string;
  lat: number;
  lng: number;
  description: string;
  description_mr?: string;
  /** "8:00 AM - 6:30 PM", "Sunrise - sunset", "" when unknown */
  hours: string;
  /** Minutes after midnight, for "Open now" */
  opensAt?: number;
  closesAt?: number;
  entryFee: string;
  free: boolean;
  visitMinutes: number;
  accessible?: boolean;
  weakSignal?: boolean;
  xp: number;
  estYear?: string;
  popularity: number;
};

const h = (hh: number, mm = 0) => hh * 60 + mm;

export const PLACES: CataloguePlace[] = [
  // ── Heritage / wadas ───────────────────────────────────────
  {
    name: 'Shaniwar Wada', name_mr: 'शनिवार वाडा', category: 'Heritage', kind: 'Wada', area: 'Kasba Peth',
    lat: 18.5195, lng: 73.8553, estYear: '1732',
    description: 'Seat of the Peshwas of the Maratha Empire. The fortified palace walls and the Delhi Darwaza still stand; the evening light and sound show tells its story.',
    description_mr: 'मराठा साम्राज्यातील पेशव्यांचे निवासस्थान. दिल्ली दरवाजा आणि तटबंदी आजही उभी आहे.',
    hours: '8:00 AM - 6:30 PM', opensAt: h(8), closesAt: h(18, 30), entryFee: '₹25', free: false,
    visitMinutes: 90, accessible: true, xp: 40, popularity: 100,
  },
  {
    name: 'Lal Mahal', name_mr: 'लाल महाल', category: 'Heritage', kind: 'Wada', area: 'Kasba Peth',
    lat: 18.5187, lng: 73.8567, estYear: '1630',
    description: 'Reconstructed red palace where young Shivaji Maharaj grew up with Jijabai. Paintings inside retell the Shaista Khan episode.',
    description_mr: 'शिवाजी महाराजांचे बालपण गेलेला लाल महाल.',
    hours: '9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM', entryFee: '', free: false, visitMinutes: 40, xp: 30, popularity: 70,
  },
  {
    name: 'Vishrambaug Wada', name_mr: 'विश्रामबाग वाडा', category: 'Heritage', kind: 'Wada', area: 'Sadashiv Peth',
    lat: 18.51385, lng: 73.85343, estYear: '1807',
    description: 'Elegant wada of Peshwa Bajirao II with carved teak balconies and a small museum of old Pune.',
    hours: '10:00 AM - 7:00 PM, closed Monday', entryFee: '₹5', free: false, visitMinutes: 45, xp: 30, popularity: 55,
  },
  {
    name: 'Aga Khan Palace', name_mr: 'आगा खान पॅलेस', category: 'Heritage', area: 'Kalyani Nagar',
    lat: 18.5523, lng: 73.9015, estYear: '1892',
    description: "Built in 1892, the palace held Mahatma Gandhi and Kasturba Gandhi during the Quit India movement. Kasturba's memorial stands in the gardens.",
    description_mr: 'भारत छोडो आंदोलनात महात्मा गांधी आणि कस्तुरबा येथे स्थानबद्ध होते.',
    hours: '9:00 AM - 5:30 PM', opensAt: h(9), closesAt: h(17, 30), entryFee: '₹25', free: false,
    visitMinutes: 90, accessible: true, xp: 40, popularity: 90,
  },
  {
    name: 'Nana Wada', name_mr: 'नाना वाडा', category: 'Heritage', kind: 'Wada', area: 'Budhwar Peth',
    lat: 18.5181, lng: 73.8589, estYear: '1780',
    description: 'Mansion of Nana Phadnavis, minister of the Peshwas, later one of the first schools in Pune.',
    hours: '', entryFee: '', free: true, visitMinutes: 30, xp: 30, popularity: 35,
  },

  // ── Temples ───────────────────────────────────────────────
  {
    name: 'Dagdusheth Halwai Ganpati', name_mr: 'दगडूशेठ हलवाई गणपती', category: 'Temple', area: 'Budhwar Peth',
    lat: 18.5164, lng: 73.856, estYear: '1893',
    description: "Pune's most celebrated Ganpati temple, glowing with gold. Expect crowds on Tuesdays and during Ganeshotsav.",
    description_mr: 'पुण्यातील सर्वात प्रसिद्ध गणपती मंदिर.',
    hours: '6:00 AM - 11:00 PM', opensAt: h(6), closesAt: h(23), entryFee: 'Free', free: true,
    visitMinutes: 45, accessible: true, xp: 30, popularity: 98,
  },
  {
    name: 'Kasba Ganpati', name_mr: 'कसबा गणपती', category: 'Temple', area: 'Kasba Peth',
    lat: 18.5193, lng: 73.8578, estYear: '1639',
    description: "Pune's presiding deity, the first among the city's five honoured Ganpatis, installed in Jijabai's time.",
    description_mr: 'पुण्याचे ग्रामदैवत, मानाचा पहिला गणपती.',
    hours: '6:00 AM - 9:30 PM', opensAt: h(6), closesAt: h(21, 30), entryFee: 'Free', free: true,
    visitMinutes: 30, xp: 30, popularity: 75,
  },
  {
    name: 'Pataleshwar Cave Temple', name_mr: 'पाताळेश्वर लेणी', category: 'Temple', kind: 'Cave temple', area: 'Shivajinagar',
    lat: 18.5265, lng: 73.8504, estYear: '8th century',
    description: 'Rock-cut Shiva temple carved from a single basalt outcrop, with a round Nandi mandapa in the courtyard.',
    description_mr: 'एकाच दगडात कोरलेले आठव्या शतकातील शिव मंदिर.',
    hours: '6:00 AM - 9:30 PM', opensAt: h(6), closesAt: h(21, 30), entryFee: 'Free', free: true,
    visitMinutes: 45, xp: 30, popularity: 80,
  },
  {
    name: 'Chaturshringi Temple', name_mr: 'चतुःशृंगी मंदिर', category: 'Temple', area: 'Senapati Bapat Road',
    lat: 18.5393, lng: 73.8292,
    description: 'Hilltop temple of Goddess Chaturshringi, reached by about a hundred steps; a big Navratri fair.',
    hours: '6:00 AM - 9:00 PM', opensAt: h(6), closesAt: h(21), entryFee: 'Free', free: true,
    visitMinutes: 45, xp: 30, popularity: 60,
  },
  {
    name: 'Sarasbaug Ganpati', name_mr: 'सारसबाग गणपती', category: 'Temple', area: 'Sadashiv Peth',
    lat: 18.5006, lng: 73.8521,
    description: 'Talyatla Ganpati temple on an island in a lake garden laid out by the Peshwas; lovely in the evening.',
    hours: '6:00 AM - 9:00 PM', opensAt: h(6), closesAt: h(21), entryFee: 'Free', free: true,
    visitMinutes: 40, accessible: true, xp: 30, popularity: 65,
  },
  {
    name: 'Parvati Hill', name_mr: 'पर्वती टेकडी', category: 'Nature', kind: 'Hill', area: 'Parvati',
    lat: 18.497, lng: 73.847,
    description: '103 stone steps up to the Peshwa-era temple complex with the best sunset view over the city.',
    description_mr: 'पेशवेकालीन मंदिरे आणि शहराचे सुंदर दृश्य.',
    hours: '5:00 AM - 8:00 PM', opensAt: h(5), closesAt: h(20), entryFee: 'Free', free: true,
    visitMinutes: 60, xp: 30, popularity: 70,
  },

  // ── Museums ───────────────────────────────────────────────
  {
    name: 'Raja Dinkar Kelkar Museum', name_mr: 'राजा दिनकर केळकर संग्रहालय', category: 'Museum', area: 'Shukrawar Peth',
    lat: 18.5108, lng: 73.8542, estYear: '1962',
    description: "One man's collection of 20,000 everyday objects: lamps, musical instruments, locks and a rebuilt Mastani Mahal.",
    hours: '10:00 AM - 5:30 PM', opensAt: h(10), closesAt: h(17, 30), entryFee: '₹100', free: false,
    visitMinutes: 120, accessible: true, xp: 40, popularity: 65,
  },
  {
    name: 'Mahatma Phule Museum', name_mr: 'महात्मा फुले संग्रहालय', category: 'Museum', area: 'Shivajinagar',
    lat: 18.52363, lng: 73.84521, estYear: '1890',
    description: 'One of the oldest museums in Maharashtra, with galleries on industry, geology and natural history.',
    hours: '9:00 AM - 5:00 PM', opensAt: h(9), closesAt: h(17), entryFee: '', free: false, visitMinutes: 60, xp: 30, popularity: 30,
  },

  // ── Forts ─────────────────────────────────────────────────
  {
    name: 'Sinhagad Fort', name_mr: 'सिंहगड', category: 'Fort', area: 'Sahyadri',
    lat: 18.3663, lng: 73.7559,
    description: 'Hill fort of Tanaji Malusare. Trek up or drive to the top for kanda bhaji, pithla bhakri and views of Khadakwasla.',
    description_mr: 'तानाजी मालुसरे यांचा पराक्रम सांगणारा किल्ला.',
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18, 30), entryFee: 'Free', free: true,
    visitMinutes: 240, weakSignal: true, xp: 80, popularity: 85,
  },
  {
    name: 'Rajgad Fort', name_mr: 'राजगड', category: 'Fort', area: 'Sahyadri',
    lat: 18.2465, lng: 73.6823,
    description: "Shivaji Maharaj's capital for over two decades. A full-day trek with Padmavati machi and Balekilla.",
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18, 30), entryFee: 'Free', free: true,
    visitMinutes: 420, weakSignal: true, xp: 120, popularity: 60,
  },
  {
    name: 'Torna Fort', name_mr: 'तोरणा', category: 'Fort', area: 'Velhe',
    lat: 18.276, lng: 73.623,
    description: 'The first fort Shivaji Maharaj captured, at 16. Steep in places; go with a group.',
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18, 30), entryFee: 'Free', free: true,
    visitMinutes: 360, weakSignal: true, xp: 100, popularity: 45,
  },
  {
    name: 'Lohagad Fort', name_mr: 'लोहगड', category: 'Fort', area: 'Malavli',
    lat: 18.709, lng: 73.477,
    description: 'Easy monsoon favourite near Lonavala with the Vinchu Kata (scorpion tail) ridge.',
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18), entryFee: '', free: false,
    visitMinutes: 240, weakSignal: true, xp: 80, popularity: 55,
  },

  // ── Nature ────────────────────────────────────────────────
  {
    name: 'Pashan Lake', name_mr: 'पाषाण तलाव', category: 'Nature', kind: 'Lake', area: 'Pashan',
    lat: 18.53211, lng: 73.78265,
    description: 'Quiet lake with migratory birds in winter; best early in the morning.',
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18, 30), entryFee: 'Free', free: true,
    visitMinutes: 60, xp: 20, popularity: 30,
  },
  {
    name: 'Empress Botanical Garden', name_mr: 'एम्प्रेस गार्डन', category: 'Nature', kind: 'Garden', area: 'Camp',
    lat: 18.51306, lng: 73.89809,
    description: 'Shady 39-acre botanical garden with old trees and flower shows in January.',
    hours: '9:00 AM - 5:30 PM', opensAt: h(9), closesAt: h(17, 30), entryFee: '₹20', free: false, visitMinutes: 60, accessible: true, xp: 20, popularity: 35,
  },
  {
    name: 'Vetal Tekdi', name_mr: 'वेताळ टेकडी', category: 'Nature', kind: 'Hill', area: 'Kothrud',
    lat: 18.52556, lng: 73.81534,
    description: "The city's green lung: forest trails used by morning walkers, with views from the top.",
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(18, 30), entryFee: 'Free', free: true,
    visitMinutes: 90, xp: 30, popularity: 40,
  },
  {
    name: 'Khadakwasla Dam', name_mr: 'खडकवासला धरण', category: 'Nature', kind: 'Lake', area: 'Khadakwasla',
    lat: 18.442, lng: 73.768,
    description: 'Wide reservoir on the way to Sinhagad. Roadside corn and chai at sunset; no swimming.',
    hours: 'Sunrise - sunset', opensAt: h(6), closesAt: h(19), entryFee: 'Free', free: true,
    visitMinutes: 60, xp: 20, popularity: 50,
  },

  // ── Food lanes ────────────────────────────────────────────
  {
    name: 'Laxmi Road food lane', name_mr: 'लक्ष्मी रोड खाऊगल्ली', category: 'Food', kind: 'Food lane', area: 'Budhwar Peth',
    lat: 18.5155, lng: 73.8565,
    description: 'Old market street around Tulshibaug: misal, vada pav, sweets and festival shopping.',
    hours: '10:00 AM - 10:00 PM', opensAt: h(10), closesAt: h(22), entryFee: 'Free', free: true,
    visitMinutes: 60, xp: 20, popularity: 60,
  },
  {
    name: 'FC Road food lane', name_mr: 'एफसी रोड', category: 'Food', kind: 'Food lane', area: 'Deccan',
    lat: 18.523, lng: 73.841,
    description: 'Student favourite: Vaishali, Roopali and street stalls all along Fergusson College Road.',
    hours: '8:00 AM - 11:00 PM', opensAt: h(8), closesAt: h(23), entryFee: 'Free', free: true,
    visitMinutes: 60, accessible: true, xp: 20, popularity: 70,
  },
  {
    name: 'Vaishali Restaurant', name_mr: 'वैशाली', category: 'Food', area: 'FC Road',
    lat: 18.52085, lng: 73.84122, estYear: '1951',
    description: 'Iconic South Indian restaurant; try the SPDP and filter coffee. Queues on weekends.',
    hours: '7:00 AM - 11:00 PM', opensAt: h(7), closesAt: h(23), entryFee: '—', free: true,
    visitMinutes: 60, accessible: true, xp: 20, popularity: 75,
  },
  {
    name: 'Bedekar Misal', name_mr: 'बेडेकर मिसळ', category: 'Food', area: 'Narayan Peth',
    lat: 18.5132, lng: 73.8503, estYear: '1948',
    description: 'Spicy Puneri misal served the old way. Closes early in the afternoon.',
    hours: '7:30 AM - 6:00 PM, closed Monday', entryFee: '—', free: true, visitMinutes: 40, xp: 20, popularity: 55,
  },
  {
    name: 'Goodluck Cafe', name_mr: 'गुडलक कॅफे', category: 'Food', area: 'Deccan Gymkhana',
    lat: 18.5173, lng: 73.84146, estYear: '1935',
    description: 'Irani cafe classic: bun maska, chai and keema pav.',
    hours: '7:30 AM - 11:30 PM', opensAt: h(7, 30), closesAt: h(23, 30), entryFee: '—', free: true,
    visitMinutes: 45, xp: 20, popularity: 60,
  },
];

/** Major hospitals with 24/7 emergency (approximate coordinates). */
export const HOSPITALS = [
  { name: 'KEM Hospital', lat: 18.5182, lng: 73.866 },
  { name: 'Sassoon General Hospital', lat: 18.5279, lng: 73.8722 },
  { name: 'Ruby Hall Clinic', lat: 18.5332, lng: 73.8768 },
  { name: 'Jehangir Hospital', lat: 18.5302, lng: 73.8764 },
  { name: 'Deenanath Mangeshkar Hospital', lat: 18.5034, lng: 73.829 },
  { name: 'Sahyadri Hospital Deccan', lat: 18.5124, lng: 73.8345 },
  { name: 'Poona Hospital', lat: 18.5092, lng: 73.8469 },
  { name: 'Bharati Hospital', lat: 18.458, lng: 73.8566 },
  { name: 'Noble Hospital', lat: 18.5048, lng: 73.9285 },
  { name: 'Rural Hospital Velhe', lat: 18.2943, lng: 73.6372 },
  { name: 'Pawana Hospital', lat: 18.7298, lng: 73.6781 },
];

export type CatalogueRoute = {
  slug: string;
  title: string;
  mode: string;
  summary: string;
  deccanTitle: string;
  deccanSummary: string;
  tone: string;
  sort: number;
  stops: { place: string; time: string }[];
};

/** Route tickets on Explore (copy from design-reference). */
export const ROUTES: CatalogueRoute[] = [
  {
    slug: 'peth-walk', title: 'Old Pune peth walk', mode: 'On foot', summary: '5 stops · help within 1.5 km',
    deccanTitle: 'Peth heritage walk', deccanSummary: 'Kasba → Budhwar → Shukrawar', tone: 'primary', sort: 1,
    stops: [
      { place: 'Shaniwar Wada', time: '9:00 AM' },
      { place: 'Lal Mahal', time: '10:45 AM' },
      { place: 'Kasba Ganpati', time: '11:30 AM' },
      { place: 'Dagdusheth Halwai Ganpati', time: '12:15 PM' },
      { place: 'Raja Dinkar Kelkar Museum', time: '2:00 PM' },
    ],
  },
  {
    slug: 'fort-day', title: 'Fort day trip', mode: 'By car', summary: '2 forts · offline pack included',
    deccanTitle: 'Two-fort monsoon trek', deccanSummary: 'Sinhagad → Rajgad · offline pack', tone: 'tile-1', sort: 2,
    stops: [
      { place: 'Sinhagad Fort', time: '7:00 AM' },
      { place: 'Rajgad Fort', time: '1:00 PM' },
    ],
  },
  {
    slug: 'temple-morning', title: 'Temple morning', mode: 'By auto', summary: '4 stops · done by noon',
    deccanTitle: 'Ganpati darshan', deccanSummary: 'Kasba → Dagdusheth → Sarasbaug', tone: 'tile-2', sort: 3,
    stops: [
      { place: 'Kasba Ganpati', time: '7:00 AM' },
      { place: 'Dagdusheth Halwai Ganpati', time: '8:00 AM' },
      { place: 'Pataleshwar Cave Temple', time: '9:30 AM' },
      { place: 'Sarasbaug Ganpati', time: '11:00 AM' },
    ],
  },
];

export { haversineKm };

export function nearestHospital(p: { lat: number; lng: number }) {
  let best = HOSPITALS[0];
  let bestKm = Infinity;
  for (const hsp of HOSPITALS) {
    const km = haversineKm(p, hsp);
    if (km < bestKm) {
      best = hsp;
      bestKm = km;
    }
  }
  return { name: best.name, km: Math.round(bestKm * 10) / 10 };
}
