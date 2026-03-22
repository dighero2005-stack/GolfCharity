import { isSubscriptionActive } from './subscriptionAccess';

/** Monthly fee for pool / charity estimate (MVP constants). */
export function monthlyFeeFromPlan(plan) {
  if (!plan) return 5;
  const p = String(plan).toLowerCase();
  if (p.includes('year')) return 40 / 12;
  return 5;
}

export function canEnterScores(subscription, user, isAdmin) {
  if (isAdmin) return true;
  return isSubscriptionActive(subscription, user);
}

/** Draw participation requires active subscription AND exactly 5 scores. */
export function canParticipateInDraw(subscription, user, scoresCount, isAdmin) {
  if (isAdmin) return true;
  if (!isSubscriptionActive(subscription, user)) return false;
  return scoresCount >= 5;
}
