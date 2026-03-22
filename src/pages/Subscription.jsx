import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { canAccessDashboard, hasDashboardAccessByEmail } from '../lib/subscriptionAccess';
import { setSubscription } from '../store/slices/subscriptionSlice';
import { toggleTheme } from '../store/slices/themeSlice';

export default function Subscription() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, signOut } = useAuth();
  const themeMode = useSelector((state) => state.theme.mode);
  const subscription = useSelector((state) => state.subscription);

  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (hasDashboardAccessByEmail(user)) {
      navigate('/dashboard', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from('user_subscription').select('*').eq('user_id', user.id).maybeSingle();
        if (cancelled) return;
        const sub = {
          status: data?.status ?? 'inactive',
          plan: data?.plan ?? '',
          renewal_date: data?.renewal_date ?? null,
        };
        dispatch(setSubscription(sub));
        if (canAccessDashboard(user, sub)) {
          navigate('/dashboard', { replace: true });
        } else {
          setPageReady(true);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load subscription status.');
          setPageReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, dispatch, navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setError('');
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setError('Logout failed.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-200">Loading...</p>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-200">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Navbar
          email={user?.email}
          themeMode={themeMode}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subscription lottery — what you get</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            You are subscribing to a monthly draw system: your last five numbers are checked against published draws;
            prizes split by 3 / 4 / 5 matches; a share of pool funds goes to your chosen charity.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
              <strong className="text-slate-900 dark:text-slate-100">Five-number line</strong>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Your entry line (1–45, dated). Oldest drops when you add a sixth — duplicates allowed as separate picks.
              </p>
            </li>
            <li className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
              <strong className="text-slate-900 dark:text-slate-100">Draws & tiers</strong>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Admin publishes five numbers; 3 / 4 / 5 matches win tier pools; jackpot can roll over if no 5-match winner.
              </p>
            </li>
            <li className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
              <strong className="text-slate-900 dark:text-slate-100">Charity %</strong>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Choose a charity and percentage of your subscription share (allocation rules apply to the pool).
              </p>
            </li>
            <li className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
              <strong className="text-slate-900 dark:text-slate-100">Winnings</strong>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Track pending and paid wins from published draws once payouts are enabled.
              </p>
            </li>
          </ul>
        </section>

        <SubscriptionCard
          status={subscription.status}
          plan={subscription.plan}
          onSubscribeMonthly={() => navigate('/service-unavailable')}
          onSubscribeYearly={() => navigate('/service-unavailable')}
          loading={false}
        />
      </div>
    </div>
  );
}
