import axios from 'axios';

export type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

// Worldwide public mirrors. They are shared and often busy, so this client is for batch imports
// only (never per user request). Production can point OVERPASS_ENDPOINTS at a self-hosted instance.
const DEFAULT_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const mirrors = () => {
  const fromEnv = (process.env.OVERPASS_ENDPOINTS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return fromEnv.length ? fromEnv : DEFAULT_MIRRORS;
};

/** Run an Overpass QL query, trying each mirror in turn. Throws if every mirror fails. */
export async function overpass(query: string, timeoutMs = 200_000): Promise<OsmElement[]> {
  const errors: string[] = [];
  for (const url of mirrors()) {
    try {
      const { data } = await axios.post(url, new URLSearchParams({ data: query }).toString(), {
        timeout: timeoutMs,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'PuneExplorer/2.0 (help-points import)',
        },
      });
      if (!Array.isArray(data?.elements)) throw new Error('no elements in response');
      if (data.remark && /runtime error|timed out/i.test(data.remark)) throw new Error(data.remark);
      return data.elements as OsmElement[];
    } catch (err) {
      errors.push(`${new URL(url).host}: ${(err as Error).message}`);
    }
  }
  throw new Error(`All Overpass mirrors failed:\n  ${errors.join('\n  ')}`);
}
