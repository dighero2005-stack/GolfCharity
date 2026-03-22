import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/AuthProvider';

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function calcStrength(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setStrength(calcStrength(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.session) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', {
          replace: true,
          state: {
            message: 'check your email to confirm your account',
          },
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between px-12 py-14 bg-gradient-to-br from-slate-900 to-emerald-900 relative overflow-hidden">

        <div className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-slate-800 rounded-[90px] opacity-30 rotate-6" />
        <div className="absolute bottom-[-30px] left-[-30px] w-52 h-52 bg-slate-800 rounded-[60px] opacity-20 -rotate-6" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-7 h-7 bg-white text-slate-900 flex items-center justify-center rounded text-sm">
            ⛳
          </div>
          <span className="text-slate-100 text-sm font-medium">
            Fairway Fund
          </span>
        </div>

        {/* content */}
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-wide text-emerald-300 mb-4">
            getting started
          </p>

          <h2 className="text-[28px] font-semibold text-slate-100 leading-snug mb-5">
            not just another golf app.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed mb-7">
            you log your scores, you get into the draw,
            and a part of what you pay goes somewhere useful.
          </p>

          {/* steps */}
          <div className="flex flex-col gap-5">
            {[
              {
                n: '01',
                title: 'create your account',
                desc: 'takes less than a minute'
              },
              {
                n: '02',
                title: 'add your recent scores',
                desc: 'we only keep the latest five'
              },
              {
                n: '03',
                title: 'you’re in the draw',
                desc: 'monthly prizes, nothing complicated'
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="text-xs text-slate-500 w-5">{n}</span>
                <div>
                  <p className="text-sm text-slate-300">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
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
              create account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              start tracking, see what happens
            </p>
          </div>

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
                onChange={handlePasswordChange}
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

            {/* strength */}
            {password.length > 0 && (
              <p className="text-xs text-slate-500">
                strength: {['', 'weak', 'okay', 'good', 'strong'][strength]}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white rounded-md py-2 text-sm hover:bg-slate-700 transition"
            >
              {submitting ? 'creating...' : 'create account'}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-3 text-center">
            no spam. no nonsense.
          </p>

          <p className="text-center text-sm text-slate-500 mt-6">
            already have an account?{' '}
            <Link to="/login" className="text-indigo-600">
              sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}