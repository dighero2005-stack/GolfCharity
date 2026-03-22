import { resultMessageFromMatch } from '../../lib/lottery';

export default function DrawCard({
  latestDraw,
  matchCount,
  drawMonthLabel,
  participationEligible,
  participationMessage,
}) {
  const hasNumbers = Boolean(latestDraw?.numbers?.length);
  const msg = resultMessageFromMatch(matchCount);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Draw participation</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Current cycle: <strong>{drawMonthLabel}</strong>
        </p>
      </div>

      {!participationEligible && participationMessage && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {participationMessage}
        </p>
      )}

      {hasNumbers ? (
        <>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Published numbers
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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
            {participationEligible ? (
              <>
                You matched <strong>{matchCount ?? 0}</strong> — <strong>{msg}</strong>
              </>
            ) : (
              <>Match count is hidden until you are eligible (active subscription + five scores).</>
            )}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">No draw published for this cycle yet.</p>
      )}
    </section>
  );
}
