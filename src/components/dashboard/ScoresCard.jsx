export default function ScoresCard({
  scores,
  scoreInput,
  scoreDate,
  onScoreInputChange,
  onScoreDateChange,
  onAddScore,
  loading,
  canEdit,
  blockReason,
}) {
  const disabled = !canEdit || loading;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your line (last 5)</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Enter up to five numbers (1–45). When you add a sixth, the oldest is removed. Duplicate values are allowed as
        separate picks; matches use unique values against the draw.
      </p>
      {!canEdit && blockReason && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {blockReason}
        </p>
      )}
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          onAddScore();
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Value (1–45)</label>
          <input
            type="number"
            min="1"
            max="45"
            value={scoreInput}
            onChange={(e) => onScoreInputChange(e.target.value)}
            disabled={disabled}
            className="w-28 rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            placeholder="1-45"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date</label>
          <input
            type="date"
            value={scoreDate}
            onChange={(e) => onScoreDateChange(e.target.value)}
            disabled={disabled}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:mb-0"
        >
          {loading ? 'Adding...' : 'Add score'}
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {scores.length === 0 ? (
          <li className="text-sm text-slate-500 dark:text-slate-400">No scores yet.</li>
        ) : (
          scores.map((s) => (
            <li
              key={s.id}
              className="rounded border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <strong>{s.score}</strong>
              <span className="text-slate-500 dark:text-slate-400">
                {' '}
                — {s.score_date ? new Date(s.score_date).toLocaleDateString() : new Date(s.created_at).toLocaleDateString()}{' '}
                <span className="text-xs">({new Date(s.created_at).toLocaleString()})</span>
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
