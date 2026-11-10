/**
 * Day-order optimiser (TECH_DESIGN §9.3): the first stop stays fixed, nearest-neighbour builds
 * an order, then 2-opt improves it. `m[i][j]` is travel time from stop i to j (may be asymmetric).
 * Open path: the day ends at the last stop, there is no return leg.
 */
export const pathCost = (order: number[], m: number[][]) => {
  let total = 0;
  for (let i = 1; i < order.length; i++) total += m[order[i - 1]][order[i]];
  return total;
};

export function nearestNeighbour(m: number[][], start = 0): number[] {
  const order = [start];
  const left = new Set(m.map((_, i) => i).filter((i) => i !== start));
  while (left.size) {
    const from = order[order.length - 1];
    let best = -1;
    for (const j of left) if (best < 0 || m[from][j] < m[from][best]) best = j;
    order.push(best);
    left.delete(best);
  }
  return order;
}

/** 2-opt on an open path with a fixed first element. Full re-costing handles asymmetric matrices. */
export function twoOpt(order: number[], m: number[][]): number[] {
  let best = order.slice();
  let bestCost = pathCost(best, m);
  let improved = true;
  for (let pass = 0; improved && pass < 50; pass++) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const cand = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)];
        const c = pathCost(cand, m);
        if (c < bestCost - 1e-9) {
          best = cand;
          bestCost = c;
          improved = true;
        }
      }
    }
  }
  return best;
}

/** Best order found, never worse than the current one (the identity order). */
export function optimiseOrder(m: number[][]): number[] {
  const identity = m.map((_, i) => i);
  const cand = twoOpt(nearestNeighbour(m, 0), m);
  return pathCost(cand, m) < pathCost(identity, m) ? cand : identity;
}
