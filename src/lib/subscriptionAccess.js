/** Demo account that always has dashboard access (password verified at login). */
export const DEMO_SUBSCRIBER_EMAIL = 'sample1@gmail.com';

export const ADMIN_EMAIL = 'admin@example.com';

export function hasDashboardAccessByEmail(user) {
  if (!user?.email) return false;
  return user.email === DEMO_SUBSCRIBER_EMAIL || user.email === ADMIN_EMAIL;
}

/** Active paid access (renewal_date end-of-day compared in local time). */
export function isSubscriptionActive(subscription, user) {
  if (!user?.email) return false;
  if (user.email === DEMO_SUBSCRIBER_EMAIL) return true;
  if (!subscription || subscription.status !== 'active') return false;
  if (!subscription.renewal_date) return true;
  const end = new Date(subscription.renewal_date);
  if (Number.isNaN(end.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end >= today;
}

export function canAccessDashboard(user, subscription) {
  if (!user) return false;
  if (hasDashboardAccessByEmail(user)) return true;
  return isSubscriptionActive(subscription, user);
}
