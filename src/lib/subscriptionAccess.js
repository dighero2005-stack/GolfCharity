/** Demo account that always has dashboard access (password verified at login). */
export const DEMO_SUBSCRIBER_EMAIL = 'sample1@gmail.com';

export const ADMIN_EMAIL = 'admin@example.com';

export function hasDashboardAccessByEmail(user) {
  if (!user?.email) return false;
  return user.email === DEMO_SUBSCRIBER_EMAIL || user.email === ADMIN_EMAIL;
}

export function canAccessDashboard(user, subscription) {
  if (!user) return false;
  if (hasDashboardAccessByEmail(user)) return true;
  return subscription?.status === 'active';
}
