/** Subscription lottery: draw numbers, match tiers, pool split (mirrors SQL where possible). */

export const TIER_SPLIT = { 5: 0.4, 4: 0.35, 3: 0.25 };

/** Intersection size between draw numbers and user's score values (unique). */
export function matchCountFromScores(scores, drawNumbers) {
  const draw = drawNumbers ?? [];
  if (!draw.length) return null;
  const userSet = new Set((scores ?? []).map((s) => s.score));
  let n = 0;
  for (const d of draw) {
    if (userSet.has(d)) n += 1;
  }
  return n;
}

export function tierFromMatchCount(count) {
  if (count === 5) return 5;
  if (count === 4) return 4;
  if (count === 3) return 3;
  return 0;
}

export function tierLabel(tier) {
  if (tier === 5) return 'Jackpot (5 matches)';
  if (tier === 4) return 'Tier 2 (4 matches)';
  if (tier === 3) return 'Tier 3 (3 matches)';
  return '—';
}

export function resultMessageFromMatch(count) {
  if (count === 5) return 'Jackpot';
  if (count === 4) return 'Tier 2';
  if (count === 3) return 'Tier 3';
  if (count == null) return 'Waiting for draw';
  return 'No prize tier';
}

export function generateDrawRandom() {
  const set = new Set();
  while (set.size < 5) set.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(set).sort((a, b) => a - b);
}

/** Deterministic pseudo-random draw for "algorithmic" mode (same month → same seed). */
export function generateDrawAlgorithmic(seedBase) {
  let s = Math.abs(seedBase) || 1;
  const set = new Set();
  while (set.size < 5) {
    s = (s * 1103515245 + 12345) % 2147483647;
    set.add((s % 45) + 1);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function currentDrawMonthLabel(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
