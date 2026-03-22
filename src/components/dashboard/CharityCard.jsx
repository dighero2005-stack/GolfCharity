export default function CharityCard({
  charities,
  selectedCharityId,
  percentage,
  currentCharityName,
  onCharityChange,
  onPercentageChange,
  onSave,
  loading,
  monthlyFeeEstimate = 5,
}) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const charityShare = ((Number(monthlyFeeEstimate) || 0) * pct) / 100;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-600 dark:text-emerald-400">
            <path d="M8 14S2 10.5 2 6a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.5-6 8-6 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Charity allocation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <strong className="text-slate-600 dark:text-slate-300">subscription × {pct}%</strong> of your fee is directed to
            the selected cause (pool rules apply).
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            ≈ ${charityShare.toFixed(2)} / month from your plan estimate (${Number(monthlyFeeEstimate).toFixed(2)} base).
          </p>
        </div>
      </div>

      {/* ── Current preference banner ── */}
      <div className="mb-5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Currently supporting</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {currentCharityName || 'Not set'}
          </span>
          {currentCharityName && (
            <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {pct}%
            </span>
          )}
        </div>

        {/* Allocation bar */}
        {currentCharityName && (
          <div className="mt-2.5">
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Form ── */}
      <form
        className="space-y-3"
        onSubmit={(e) => { e.preventDefault(); onSave(); }}
      >
        {/* Charity select */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Select charity
          </label>
          <div className="relative">
            <select
              value={selectedCharityId}
              onChange={(e) => onCharityChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-300 transition"
              required
            >
              {charities.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Percentage input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Allocation percentage
            </label>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{pct}%</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => onPercentageChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-300 transition"
              required
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              %
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          {loading ? (
            <>
              <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 4.5l-7 7L3 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save Preference
            </>
          )}
        </button>
      </form>

    </section>
  );
}