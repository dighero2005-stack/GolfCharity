import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/dashboard/AdminPanel';
import CharityCard from '../components/dashboard/CharityCard';
import DrawCard from '../components/dashboard/DrawCard';
import Navbar from '../components/dashboard/Navbar';
import ScoresCard from '../components/dashboard/ScoresCard';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_EMAIL, DEMO_SUBSCRIBER_EMAIL } from '../lib/subscriptionAccess';
import { setSubscription } from '../store/slices/subscriptionSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { setUser } from '../store/slices/userSlice';

const getResultMessage = (count) =>
  count === 5 ? 'Jackpot' : count === 4 ? 'Great' : count === 3 ? 'Good' : count == null ? 'Waiting for draw' : 'Try again';

const generateDraw = () => {
  const set = new Set();
  while (set.size < 5) set.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(set).sort((a, b) => a - b);
};

const checkMatches = (scores, drawNumbers) => {
  const userSet = new Set((scores ?? []).map((s) => s.score));
  const drawSet = new Set(drawNumbers ?? []);
  let count = 0;
  for (const n of userSet) if (drawSet.has(n)) count += 1;
  return count;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, signOut } = useAuth();
  const themeMode = useSelector((state) => state.theme.mode);
  const subscription = useSelector((state) => state.subscription);

  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [scores, setScores] = useState([]);
  const [scoreInput, setScoreInput] = useState('');
  const [addingScore, setAddingScore] = useState(false);
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [currentPreference, setCurrentPreference] = useState(null);
  const [savingPreference, setSavingPreference] = useState(false);
  const [latestDraw, setLatestDraw] = useState(null);
  const [runningDraw, setRunningDraw] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [totalDraws, setTotalDraws] = useState(0);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isSubscriber = subscription.status === 'active' || user?.email === DEMO_SUBSCRIBER_EMAIL;
  const role = isAdmin ? 'admin' : isSubscriber ? 'subscriber' : 'public';

  const matchCount = useMemo(
    () => (latestDraw?.numbers?.length ? checkMatches(scores, latestDraw.numbers) : null),
    [scores, latestDraw]
  );
  const resultMessage = getResultMessage(matchCount);
  const currentCharityName = currentPreference
    ? charities.find((c) => String(c.id) === String(currentPreference.charity_id))?.name
    : null;

  useEffect(() => {
    dispatch(setUser({ email: user?.email ?? null }));
  }, [dispatch, user?.email]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [{ data: subData }, { data: scoresData }, { data: charitiesData }, { data: prefData }, { data: drawData }, { count: drawCount }] =
          await Promise.all([
            supabase.from('user_subscription').select('status, plan').eq('user_id', user.id).maybeSingle(),
            supabase.from('scores').select('id, score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('charities').select('id, name, description').order('name', { ascending: true }),
            supabase.from('user_charity').select('user_id, charity_id, percentage').eq('user_id', user.id).maybeSingle(),
            supabase.from('draws').select('id, numbers, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('draws').select('*', { count: 'exact', head: true }),
          ]);
        dispatch(setSubscription({ status: subData?.status ?? 'inactive', plan: subData?.plan ?? '' }));
        setScores(scoresData ?? []);
        setCharities(charitiesData ?? []);
        setCurrentPreference(prefData ?? null);
        setSelectedCharityId(
          prefData?.charity_id ? String(prefData.charity_id) : charitiesData?.length ? String(charitiesData[0].id) : ''
        );
        setPercentage(Number(prefData?.percentage) || 10);
        setLatestDraw(drawData ?? null);
        setTotalDraws(drawCount ?? 0);
      } catch {
        setError('Could not load dashboard data.');
      }
    })();
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setUsersLoading(true);
      try {
        const { data } = await supabase.from('profiles').select('email').not('email', 'is', null).order('email', { ascending: true });
        setUsers(data ?? []);
      } catch {
        setError('Could not load users list. Ensure `profiles.email` exists.');
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [isAdmin]);

  const handleAddScore = async () => {
    if (!isSubscriber && !isAdmin) return;
    const scoreValue = Number(scoreInput);
    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) return setError('Score must be an integer between 1 and 45.');
    setAddingScore(true);
    setError('');
    try {
      const { data } = await supabase.from('scores').select('id').eq('user_id', user.id).order('created_at', { ascending: false });
      if ((data?.length ?? 0) >= 5) {
        const { data: oldest } = await supabase.from('scores').select('id').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).single();
        if (oldest?.id) await supabase.from('scores').delete().eq('id', oldest.id);
      }
      await supabase.from('scores').insert({ user_id: user.id, score: scoreValue });
      const { data: refreshed } = await supabase.from('scores').select('id, score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      setScores(refreshed ?? []);
      setScoreInput('');
    } catch {
      setError('Could not add score.');
    } finally {
      setAddingScore(false);
    }
  };

  const handleSavePreference = async () => {
    if (!isSubscriber && !isAdmin) return;
    const percent = Number(percentage);
    if (!selectedCharityId) return setError('Please select a charity.');
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) return setError('Percentage must be between 1 and 100.');
    setSavingPreference(true);
    setError('');
    try {
      await supabase.from('user_charity').upsert({ user_id: user.id, charity_id: String(selectedCharityId), percentage: percent }, { onConflict: 'user_id' });
      const { data } = await supabase.from('user_charity').select('user_id, charity_id, percentage').eq('user_id', user.id).maybeSingle();
      setCurrentPreference(data ?? null);
    } catch {
      setError('Could not save charity preference.');
    } finally {
      setSavingPreference(false);
    }
  };

  const handleRunDraw = async () => {
    if (!isAdmin) return;
    setRunningDraw(true);
    setError('');
    try {
      await supabase.from('draws').insert({ numbers: generateDraw() });
      const { data } = await supabase.from('draws').select('id, numbers, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();
      setLatestDraw(data ?? null);
      setTotalDraws((t) => t + 1);
    } catch {
      setError('Could not run draw.');
    } finally {
      setRunningDraw(false);
    }
  };

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

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M14 8a6 6 0 0 0-6-6" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 p-5 lg:p-6">

        {/* Navbar */}
        <Navbar
          email={user?.email}
          themeMode={themeMode}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-400/30 dark:bg-red-500/10">
            <svg className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-auto cursor-pointer text-red-400 hover:text-red-600 dark:hover:text-red-300 transition shrink-0"
              aria-label="Dismiss"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── Role: public ── */}
        {role === 'public' && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-slate-400 dark:text-slate-500">
                <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">No active subscription</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upgrade to access scores, draws, and charity features.</p>
          </div>
        )}

        {/* ── Role: subscriber ── */}
        {role === 'subscriber' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <SubscriptionCard
              status={subscription.status}
              plan={subscription.plan}
              onSubscribeMonthly={() => navigate('/service-unavailable')}
              onSubscribeYearly={() => navigate('/service-unavailable')}
              loading={false}
            />
            <ScoresCard
              scores={scores}
              scoreInput={scoreInput}
              onScoreInputChange={setScoreInput}
              onAddScore={handleAddScore}
              loading={addingScore}
            />
            <CharityCard
              charities={charities}
              selectedCharityId={selectedCharityId}
              percentage={percentage}
              currentCharityName={currentCharityName}
              onCharityChange={setSelectedCharityId}
              onPercentageChange={setPercentage}
              onSave={handleSavePreference}
              loading={savingPreference}
            />
            <DrawCard
              latestDraw={latestDraw}
              matchCount={matchCount}
              resultMessage={resultMessage}
              isAdmin={false}
              onRunDraw={handleRunDraw}
              runningDraw={runningDraw}
            />
          </div>
        )}

        {/* ── Role: admin ── */}
        {role === 'admin' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <DrawCard
              latestDraw={latestDraw}
              matchCount={matchCount}
              resultMessage={resultMessage}
              isAdmin
              onRunDraw={handleRunDraw}
              runningDraw={runningDraw}
            />
            <AdminPanel
              users={users}
              loading={usersLoading}
              onRunDraw={handleRunDraw}
              runningDraw={runningDraw}
              latestDraw={latestDraw}
              totalDraws={totalDraws}
            />
          </div>
        )}

      </div>
    </div>
  );
}