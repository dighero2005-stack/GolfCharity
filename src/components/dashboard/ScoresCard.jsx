export default function ScoresCard({ scores, scoreInput, onScoreInputChange, onAddScore, loading }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Scores</h2>
      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddScore();
        }}
      >
        <input
          type="number"
          min="1"
          max="45"
          value={scoreInput}
          onChange={(e) => onScoreInputChange(e.target.value)}
          className="w-28 rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          placeholder="1-45"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Score'}
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
              <strong>{s.score}</strong> - {new Date(s.created_at).toLocaleString()}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

