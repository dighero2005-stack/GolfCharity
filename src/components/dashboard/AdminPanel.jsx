export default function AdminPanel({
  users,
  usersListSource = 'profiles',
  loading,
  onRunDraw,
  runningDraw,
  latestDraw,
  totalDraws,
  drawType = 'random',
  onDrawTypeChange,
  jackpotAmount = null,
}) {
  const hasLatestDraw = Boolean(latestDraw?.numbers?.length);
  const matchSummaryText = hasLatestDraw
    ? 'Latest draw is available for participant match checks.'
    : 'No draw yet. Run a draw to generate activity.';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Draw engine, pool tiers (5/4/3), jackpot rollover — publish when ready
          </p>
        </div>
        {/* Total draws badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-slate-400 dark:text-slate-500">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total draws</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{totalDraws}</span>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Draw Control ── */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Draw engine</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              hasLatestDraw
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasLatestDraw ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {hasLatestDraw ? 'Draw active' : 'No draw yet'}
            </span>
          </div>
          <div className="mb-3">
            <label htmlFor="draw-type" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Draw type
            </label>
            <select
              id="draw-type"
              value={drawType}
              onChange={(e) => onDrawTypeChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="random">Random (uniform)</option>
              <option value="algorithmic">Algorithmic (seeded by month)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onRunDraw}
            disabled={runningDraw}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {runningDraw ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Running…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <polygon points="4,2 13,8 4,14" fill="currentColor"/>
                </svg>
                Run Draw
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            After publish, the system runs match logic (5/4/3), splits tier pools, and rolls the 5-tier share into jackpot
            if no jackpot winner. Requires DB migration <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">001_lottery_mvp.sql</code>.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jackpot rollover</h3>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {jackpotAmount != null ? `$${Number(jackpotAmount).toFixed(2)}` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Accumulates when no 5-match winner in a draw.</p>
        </div>

        {/* ── Latest Draw ── */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Latest Draw</h3>
          {hasLatestDraw ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {latestDraw.numbers.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {matchSummaryText}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-400 dark:text-slate-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5"/>
              </svg>
              {matchSummaryText}
            </div>
          )}
        </div>

        {/* ── Users List ── */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          {usersListSource === 'user_subscription' && (
            <p className="mb-3 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
              No rows in <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">profiles</code> with email. Showing
              subscriber user IDs from <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">user_subscription</code>.
              Add profile rows (or a signup trigger) to see emails here.
            </p>
          )}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Users</h3>
            {!loading && users.length > 0 && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {users.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-400 dark:text-slate-500">
              <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-400 dark:text-slate-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              No users found.
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto space-y-1">
              {users.map((u, idx) => (
                <li
                  key={`${u.email}-${idx}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                >
                  {/* Avatar initial */}
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {u.email?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Winner verification</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Future: user proof upload → admin approve/reject → mark paid. Table <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">win_claims</code>{' '}
            is reserved in the migration.
          </p>
        </div>

      </div>
    </section>
  );
}