import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AuthProvider, { useAuth } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import SubscribedRoute from './components/SubscribedRoute';
import BrandBackdrop from './components/BrandBackdrop';
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
          navigate('/subscription', { replace: true });
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate, dispatch]);

  if (loading || resolving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M14 8a6 6 0 0 0-6-6" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  return null;
}

const PAGES_WITHOUT_NAVBAR = ['/login', '/signup'];

function BrandTopBar() {
  const location = useLocation();
  const showBar = PAGES_WITHOUT_NAVBAR.some((p) => location.pathname.startsWith(p));
  if (!showBar) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center gap-2.5 border-b border-slate-200 bg-white/80 px-5 py-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M3 2h7l3 3v9H3V2z" stroke="#f8fafc" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M10 2v3h3" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="5" y1="8" x2="11" y2="8" stroke="#f8fafc" strokeWidth="1.1" strokeLinecap="round"/>
          <line x1="5" y1="11" x2="9" y2="11" stroke="#f8fafc" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">Golf Charity</span>
      <span className="hidden sm:block text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-600 ml-1">
        Subscription lottery
      </span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <BrowserRouter>
          {/* Top bar — only on login/signup */}
          <BrandTopBar />

          {/* Page content — grows to fill all available space */}
          <div className="flex flex-1 flex-col">
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
          </div>

          {/* Watermark footer — natural flow, at the bottom of every page */}
          <BrandBackdrop />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}