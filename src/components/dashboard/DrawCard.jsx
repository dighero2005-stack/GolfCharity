export default function DrawCard({ latestDraw, matchCount, resultMessage, isAdmin, onRunDraw, runningDraw }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Latest Draw</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={onRunDraw}
            disabled={runningDraw}
            className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {runningDraw ? 'Running...' : 'Run Draw'}
          </button>
        )}
      </div>
      {latestDraw?.numbers?.length ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {latestDraw.numbers.map((n) => (
              <span
                key={n}
                className="rounded bg-slate-100 px-2 py-1 text-sm font-medium dark:bg-slate-700 dark:text-slate-100"
              >
                {n}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
            You matched <strong>{matchCount ?? 0}</strong> numbers - <strong>{resultMessage}</strong>
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">No draw yet.</p>
      )}
    </section>
  );
}

