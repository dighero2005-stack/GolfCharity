import { supabase } from './supabaseClient';

/**
 * Prefer `profiles.email`. If empty (common when profile rows were never created),
 * fall back to `user_subscription.user_id` so admin still sees participants.
 */
export async function fetchUsersForAdmin() {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email')
    .not('email', 'is', null)
    .order('email', { ascending: true });

  if (!profilesError && profiles?.length) {
    return { users: profiles, source: 'profiles' };
  }

  const { data: subs, error: subsError } = await supabase.from('user_subscription').select('user_id');

  if (!subsError && subs?.length) {
    const seen = new Set();
    const list = [];
    for (const s of subs) {
      const id = s.user_id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push({ email: `user ${String(id).slice(0, 8)}…` });
    }
    return { users: list, source: 'user_subscription' };
  }

  return { users: [], source: 'none' };
}
