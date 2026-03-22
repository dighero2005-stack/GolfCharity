import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/dashboard/AdminPanel';
import CharityCard from '../components/dashboard/CharityCard';
import DrawCard from '../components/dashboard/DrawCard';
import Navbar from '../components/dashboard/Navbar';
import ScoresCard from '../components/dashboard/ScoresCard';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import SubscriptionStatusCard from '../components/dashboard/SubscriptionStatusCard';
import WinningsCard from '../components/dashboard/WinningsCard';
import { useAuth } from '../components/AuthProvider';
import {
  currentDrawMonthLabel,
  generateDrawAlgorithmic,
  generateDrawRandom,
  matchCountFromScores,
} from '../lib/lottery';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_EMAIL, isSubscriptionActive } from '../lib/subscriptionAccess';
import { canEnterScores, canParticipateInDraw, monthlyFeeFromPlan } from '../lib/subscriptionHelpers';
import { setSubscription } from '../store/slices/subscriptionSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { setUser } from '../store/slices/userSlice';
import { fetchUsersForAdmin } from '../lib/adminUsers';

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

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
  const [scoreDate, setScoreDate] = useState(todayISO);
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
  const [drawType, setDrawType] = useState('random');
  const [winnings, setWinnings] = useState([]);
  const [winningsLoading, setWinningsLoading] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(null);
  const [adminUsersSource, setAdminUsersSource] = useState('profiles');

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isSubscriber = isSubscriptionActive(subscription, user);
  const role = isAdmin ? 'admin' : isSubscriber ? 'subscriber' : 'public';

  const drawMonthLabel = currentDrawMonthLabel(new Date());

  const participate = canParticipateInDraw(subscription, user, scores.length, isAdmin);
  const scoreBlockReason = !canEnterScores(subscription, user, isAdmin)
    ? 'Subscription inactive or expired. Renew to add or change scores.'
    : null;

  const participationMessage = useMemo(() => {
    if (participate || isAdmin) return null;
    if (!isSubscriptionActive(subscription, user)) return 'Renew subscription to participate in draws.';
    if (scores.length < 5) {
      const n = 5 - scores.length;
      return `Need ${n} more score${n === 1 ? '' : 's'} before this draw counts.`;
    }
    return null;
  }, [participate, isAdmin, subscription, user, scores.length]);

  const matchCount = useMemo(() => {
    if (!latestDraw?.numbers?.length || !participate) return null;
    return matchCountFromScores(scores, latestDraw.numbers);
  }, [scores, latestDraw, participate]);

  const currentCharityName = currentPreference
    ? charities.find((c) => String(c.id) === String(currentPreference.charity_id))?.name
    : null;

  const monthlyFee = monthlyFeeFromPlan(subscription.plan);

  useEffect(() => {
    dispatch(setUser({ email: user?.email ?? null }));
  }, [dispatch, user?.email]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        // Use select('*') so missing optional columns (draw_month, score_date, renewal_date) do not break PostgREST.
        const [
          subRes,
          scoresRes,
          charitiesRes,
          prefRes,
          drawRes,
          drawCountRes,
        ] = await Promise.all([
          supabase.from('user_subscription').select('*').eq('user_id', user.id).maybeSingle(),
          supabase
            .from('scores')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('charities').select('id, name, description').order('name', { ascending: true }),
          supabase.from('user_charity').select('user_id, charity_id, percentage').eq('user_id', user.id).maybeSingle(),
          supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('draws').select('*', { count: 'exact', head: true }),
        ]);

        const subData = subRes.data;
        if (subRes.error) {
          setError((prev) => prev || `Subscription: ${subRes.error.message}`);
        }
        dispatch(
          setSubscription({
            status: subData?.status ?? 'inactive',
            plan: subData?.plan ?? '',
            renewal_date: subData?.renewal_date ?? null,
          })
        );

        setScores(scoresRes.error ? [] : scoresRes.data ?? []);
        if (scoresRes.error) {
          setError((prev) => prev || `Scores: ${scoresRes.error.message}`);
        }

        const charitiesData = charitiesRes.error ? [] : charitiesRes.data ?? [];
        setCharities(charitiesData);
        const prefData = prefRes.error ? null : prefRes.data;
        setCurrentPreference(prefData ?? null);
        setSelectedCharityId(
          prefData?.charity_id ? String(prefData.charity_id) : charitiesData?.length ? String(charitiesData[0].id) : ''
        );
        setPercentage(Number(prefData?.percentage) || 10);
        setLatestDraw(drawRes.error ? null : drawRes.data ?? null);
        setTotalDraws(drawCountRes.count ?? 0);
      } catch (e) {
        setError(e?.message || 'Could not load dashboard data.');
      }
    })();
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setWinningsLoading(true);
      try {
        const { data, error } = await supabase
          .from('winnings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!cancelled) setWinnings(error ? [] : data ?? []);
      } catch {
        if (!cancelled) setWinnings([]);
      } finally {
        if (!cancelled) setWinningsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const { data } = await supabase.from('jackpot_pool').select('amount').eq('id', 1).maybeSingle();
        setJackpotAmount(data?.amount != null ? Number(data.amount) : 0);
      } catch {
        setJackpotAmount(null);
      }
    })();
  }, [isAdmin, latestDraw?.id]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setUsersLoading(true);
      try {
        const { users, source } = await fetchUsersForAdmin();
        setUsers(users);
        setAdminUsersSource(source);
      } catch {
        setError('Could not load users list.');
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [isAdmin]);

  const refreshAfterDraw = async () => {
    if (!user?.id) return;
    const { data: drawData } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatestDraw(drawData ?? null);
    const { count } = await supabase.from('draws').select('*', { count: 'exact', head: true });
    setTotalDraws(count ?? 0);
    const { data: winData } = await supabase
      .from('winnings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setWinnings(winData ?? []);
    if (isAdmin) {
      const { data: jp } = await supabase.from('jackpot_pool').select('amount').eq('id', 1).maybeSingle();
      setJackpotAmount(jp?.amount != null ? Number(jp.amount) : 0);
    }
  };

  const handleAddScore = async () => {
    if (!canEnterScores(subscription, user, isAdmin)) return;
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
      const insert = { user_id: user.id, score: scoreValue, score_date: scoreDate || todayISO() };
      const { error: insErr } = await supabase.from('scores').insert(insert);
      if (insErr) {
        const { error: ins2 } = await supabase.from('scores').insert({ user_id: user.id, score: scoreValue });
        if (ins2) throw ins2;
      }
      const { data: refreshed } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setScores(refreshed ?? []);
      setScoreInput('');
    } catch {
      setError('Could not add score.');
    } finally {
      setAddingScore(false);
    }
  };

  const handleSavePreference = async () => {
    if (!canEnterScores(subscription, user, isAdmin)) return;
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
      const month = currentDrawMonthLabel(new Date());
      const seed = new Date().getFullYear() * 12 + new Date().getMonth();
      const numbers = drawType === 'algorithmic' ? generateDrawAlgorithmic(seed) : generateDrawRandom();
      let inserted = null;
      const fullInsert = {
        numbers,
        draw_month: month,
        draw_type: drawType,
        status: 'published',
      };
      const { data: rowFull, error: fullErr } = await supabase.from('draws').insert(fullInsert).select('id').single();
      if (fullErr) {
        const { data: rowMin, error: minErr } = await supabase.from('draws').insert({ numbers }).select('id').single();
        if (minErr) throw minErr;
        inserted = rowMin;
        setError(
          (prev) =>
            prev ||
            'Draw saved (numbers only). Add columns draw_month, draw_type, status or run supabase/migrations/001_lottery_mvp.sql for full lottery features.'
        );
      } else {
        inserted = rowFull;
      }
      const { error: rpcErr } = await supabase.rpc('calculate_draw_winners', { p_draw_id: inserted.id });
      if (rpcErr) {
        setError(
          `Draw published. Payouts were not calculated: ${rpcErr.message}. Apply supabase/migrations/001_lottery_mvp.sql in Supabase.`
        );
      }
      await refreshAfterDraw();
    } catch (e) {
      setError(e?.message || 'Could not run draw.');
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
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
        <Navbar
          email={user?.email}
          themeMode={themeMode}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-400/30 dark:bg-red-500/10">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button type="button" onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600" aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {role === 'public' && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">No active subscription</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Subscribe to access draw entry, scores, and charity allocation.</p>
          </div>
        )}

        {role === 'subscriber' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <SubscriptionStatusCard subscription={subscription} user={user} />
            </div>
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
              scoreDate={scoreDate}
              onScoreInputChange={setScoreInput}
              onScoreDateChange={setScoreDate}
              onAddScore={handleAddScore}
              loading={addingScore}
              canEdit={canEnterScores(subscription, user, isAdmin)}
              blockReason={scoreBlockReason}
            />
            <WinningsCard rows={winnings} loading={winningsLoading} />
            <CharityCard
              charities={charities}
              selectedCharityId={selectedCharityId}
              percentage={percentage}
              currentCharityName={currentCharityName}
              onCharityChange={setSelectedCharityId}
              onPercentageChange={setPercentage}
              onSave={handleSavePreference}
              loading={savingPreference}
              monthlyFeeEstimate={monthlyFee}
            />
            <DrawCard
              latestDraw={latestDraw}
              matchCount={matchCount}
              drawMonthLabel={drawMonthLabel}
              participationEligible={participate}
              participationMessage={participationMessage}
            />
          </div>
        )}

        {role === 'admin' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <DrawCard
              latestDraw={latestDraw}
              matchCount={matchCount}
              drawMonthLabel={drawMonthLabel}
              participationEligible={participate}
              participationMessage={participationMessage}
            />
            <AdminPanel
              users={users}
              usersListSource={adminUsersSource}
              loading={usersLoading}
              onRunDraw={handleRunDraw}
              runningDraw={runningDraw}
              latestDraw={latestDraw}
              totalDraws={totalDraws}
              drawType={drawType}
              onDrawTypeChange={setDrawType}
              jackpotAmount={jackpotAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
