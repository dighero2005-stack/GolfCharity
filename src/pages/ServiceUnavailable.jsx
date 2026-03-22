import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import { useAuth } from '../components/AuthProvider';
import { toggleTheme } from '../store/slices/themeSlice';

export default function ServiceUnavailable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, signOut } = useAuth();
  const themeMode = useSelector((state) => state.theme.mode);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  /* ── Loading ── */
  if (loading || !user) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 p-5 lg:p-6">

        <Navbar
          email={user?.email}
          themeMode={themeMode}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        {/* ── Card ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">

          {/* Amber top strip */}
          <div className="h-1.5 w-full bg-amber-400 dark:bg-amber-500" />

          <div className="flex flex-col items-center px-8 py-10 text-center">

            {/* Icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-500 dark:text-amber-400">
                <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Text */}
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Service unavailable
            </h1>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This feature isn't available right now. It may be under maintenance or not yet enabled for your plan.
            </p>

            {/* Divider */}
            <div className="my-7 w-full h-px bg-slate-100 dark:bg-slate-700" />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go back
              </button>
              <Link
                to="/subscription"
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                View subscription
              </Link>
            </div>

            {/* Help note */}
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-600">
              Need help?{' '}
              <a
                href="mailto:support@resumeai.com"
                className="cursor-pointer text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
              >
                Contact support
              </a>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}