#!/usr/bin/env node
/**
 * Load test for the read paths most people hit at once (TECH_DESIGN §12): Explore near me,
 * a place's detail, Help nearby, and the health check. Reports p50 / p97.5 / p99 latency.
 *
 *   node scripts/load-test.mjs                        # against http://localhost:3001
 *   BASE=https://staging.example.com CONNECTIONS=100 DURATION=60 node scripts/load-test.mjs
 *
 * Each request uses a different spot around Pune, so the Redis cache sees a realistic mix of
 * hits and misses instead of one hot key.
 *
 * Production limits every IP to 600 API requests a minute (many phones share one carrier IP),
 * so one load-generating machine against production mostly measures the rate limiter (429s).
 * Run it against staging with NODE_ENV=development, or from several machines.
 */
import autocannon from 'autocannon';

const BASE = (process.env.BASE ?? 'http://localhost:3001').replace(/\/$/, '');
const CONNECTIONS = Number(process.env.CONNECTIONS ?? 50);
const DURATION = Number(process.env.DURATION ?? 20);
// p97.5 latency budget for a pass (ms)
const BUDGET = Number(process.env.P97_BUDGET_MS ?? 500);

// Real Pune neighbourhoods, jittered by up to ~1.5 km
const AREAS = [
  [18.5195, 73.8553], // Shaniwar Wada
  [18.5314, 73.8446], // Shivajinagar
  [18.5089, 73.8259], // Kothrud
  [18.5590, 73.7868], // Aundh
  [18.5679, 73.9143], // Viman Nagar
  [18.4529, 73.8652], // Katraj
  [18.5362, 73.8940], // Koregaon Park
  [18.5018, 73.8636], // Swargate
];
const spot = () => {
  const [lat, lng] = AREAS[Math.floor(Math.random() * AREAS.length)];
  const j = () => (Math.random() - 0.5) * 0.028;
  return `${(lat + j()).toFixed(4)},${(lng + j()).toFixed(4)}`;
};

async function firstPlaceIds() {
  const r = await fetch(`${BASE}/api/v1/places?near=18.5195,73.8553&limit=20`);
  if (!r.ok) throw new Error(`GET /places failed: ${r.status}. Is the API running at ${BASE}?`);
  const ids = (await r.json()).data.map((p) => p.id);
  if (!ids.length) throw new Error('No places in the database: load the place data first.');
  return ids;
}

function run(title, requestFor) {
  return new Promise((resolve, reject) => {
    const inst = autocannon(
      {
        url: BASE,
        connections: CONNECTIONS,
        duration: DURATION,
        requests: [{ setupRequest: (req) => ({ ...req, method: 'GET', path: requestFor() }) }],
      },
      (err, res) => (err ? reject(err) : resolve({ title, res }))
    );
    autocannon.track(inst, { renderProgressBar: false, renderResultsTable: false, renderLatencyTable: false });
  });
}

const ids = await firstPlaceIds();
const scenarios = [
  ['Explore: places near me', () => `/api/v1/places?near=${spot()}&radiusKm=5&limit=20`],
  ['Place detail', () => `/api/v1/places/${ids[Math.floor(Math.random() * ids.length)]}`],
  ['Help nearby (hospitals, police)', () => `/api/v1/help?near=${spot()}&radiusKm=5`],
  ['Health check', () => '/api/v1/health/ready'],
];

console.log(`Load test: ${BASE} · ${CONNECTIONS} connections · ${DURATION}s per scenario · p97.5 budget ${BUDGET} ms\n`);
const rows = [];
for (const [title, fn] of scenarios) {
  const { res } = await run(title, fn);
  const non2xx = res.non2xx;
  const limited = res.statusCodeStats?.['429']?.count ?? 0;
  rows.push({
    scenario: title,
    'req/s': Math.round(res.requests.average),
    'p50 ms': res.latency.p50,
    // autocannon reports p97.5 rather than p95 (stricter)
    'p97.5 ms': res.latency.p97_5,
    'p99 ms': res.latency.p99,
    errors: res.errors + res.timeouts,
    'non-2xx': non2xx,
    'rate-limited': limited,
  });
}
console.table(rows);

const failed = rows.filter((r) => r['p97.5 ms'] > BUDGET || r.errors > 0 || r['non-2xx'] - r['rate-limited'] > 0);
if (failed.length) {
  console.error(`\nFAIL: ${failed.map((r) => r.scenario).join(', ')}`);
  process.exit(1);
}
console.log('\nPASS');
