import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/AuthProvider';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const infoMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between px-12 py-14 bg-gradient-to-br from-slate-900 to-emerald-900 relative overflow-hidden">

        {/* subtle shapes (not too perfect) */}
        <div className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-slate-800 rounded-[90px] opacity-30 rotate-6" />
        <div className="absolute bottom-[-30px] left-[-30px] w-52 h-52 bg-slate-800 rounded-[60px] opacity-20 -rotate-6" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white text-slate-900 flex items-center justify-center text-sm">
            ⛳
          </div>
          <span className="text-slate-100 text-sm font-medium">
            Fairway Fund
          </span>
        </div>

        {/* content */}
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-wide text-emerald-300 mb-4">
            play • track • maybe win
          </p>

          <h2 className="text-[28px] font-semibold text-slate-100 leading-snug mb-5">
            Your golf scores…<br />
            but with a reason to care.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed mb-7">
            Log your last few rounds, get into the monthly draw,
            and a part of your subscription goes somewhere useful.
          </p>

          {/* stats (less “perfect”) */}
          <div className="flex gap-8">
            <div>
              <p className="text-xl font-semibold text-slate-100">₹2L+</p>
              <p className="text-xs text-slate-400">donated so far</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-100">~1k</p>
              <p className="text-xs text-slate-400">people playing</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-100">every month</p>
              <p className="text-xs text-slate-400">new winners</p>
            </div>
          </div>

          {/* testimonial */}
          <div className="mt-9 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              “Didn’t expect much when I signed up. Ended up winning a small prize
              and my money didn’t feel wasted for once.”
            </p>
            <p className="text-xs text-slate-500 mt-3">— Amit, weekend golfer</p>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Fairway Fund
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          {/* mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-slate-900 text-white flex items-center justify-center rounded">
              ⛳
            </div>
            <span className="text-sm font-medium">Fairway Fund</span>
          </div>

          {/* heading */}
          <div className="mb-7">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Sign in
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              pick up where you left off
            </p>
          </div>

          {/* alerts */}
          {infoMessage && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            <input
              type="email"
              placeholder="email"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                className="w-full border rounded-md px-3 py-2 pr-10 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500"
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white rounded-md py-2 text-sm hover:bg-slate-700 transition"
            >
              {submitting ? 'signing in...' : 'go to dashboard'}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-3 text-center">
            nothing fancy — just your scores and a bit of luck
          </p>

          <p className="text-center text-sm text-slate-500 mt-6">
            new here?{' '}
            <Link to="/signup" className="text-indigo-600">
              create an account
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}