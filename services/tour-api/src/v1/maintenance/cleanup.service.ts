import { cleanupRules } from './cleanup.repository';

export type CleanupResult = { name: string; rows: number | null; error?: string };

/**
 * Delete what has passed its retention period. Each table is its own step, so one failure does
 * not stop the rest; a dry run only counts. Returns counts only, never rows.
 */
export async function runCleanup({ dryRun = false, now = new Date() } = {}): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  for (const rule of cleanupRules(now)) {
    try {
      const rows = dryRun ? await rule.count() : (await rule.remove()).count;
      results.push({ name: rule.name, rows });
    } catch (err) {
      results.push({ name: rule.name, rows: null, error: (err as Error).message.split('\n')[0] });
    }
  }
  return results;
}
