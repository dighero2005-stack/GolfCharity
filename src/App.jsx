import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import SubscribedRoute from './components/SubscribedRoute';
import ThemeSync from './components/ThemeSync';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ServiceUnavailable from './pages/ServiceUnavailable';
import Subscription from './pages/Subscription';
import { supabase } from './lib/supabaseClient';
import { canAccessDashboard, hasDashboardAccessByEmail } from './lib/subscriptionAccess';
import { setSubscription } from './store/slices/subscriptionSlice';

function HomeRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      setResolving(false);
      return;
    }
    if (hasDashboardAccessByEmail(user)) {
      navigate('/dashboard', { replace: true });
      setResolving(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('user_subscription')
          .select('status, plan')
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        const sub = { status: data?.status ?? 'inactive', plan: data?.plan ?? '' };
        dispatch(setSubscription(sub));
        if (canAccessDashboard(user, sub)) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/subscription', { replace: true });
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate, dispatch]);

  if (loading || resolving) {
    return <p className="p-6 text-slate-700 dark:text-slate-200">Loading...</p>;
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscribedRoute>
                    <Dashboard />
                  </SubscribedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-unavailable"
              element={
                <ProtectedRoute>
                  <ServiceUnavailable />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}
