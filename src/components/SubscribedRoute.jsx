import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { setSubscription } from '../store/slices/subscriptionSlice';
import { canAccessDashboard, hasDashboardAccessByEmail } from '../lib/subscriptionAccess';

export default function SubscribedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [resolved, setResolved] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setResolved(true);
      return;
    }
    if (hasDashboardAccessByEmail(user)) {
      setAllowed(true);
      setResolved(true);
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
          setAllowed(true);
        } else {
          navigate('/subscription', { replace: true });
        }
      } finally {
        if (!cancelled) setResolved(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, dispatch, navigate]);

  if (loading || !resolved) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowed) return null;

  return children;
}
