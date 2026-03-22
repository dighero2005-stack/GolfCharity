import { tierLabel } from '../../lib/lottery';

function statusStyle(s) {
  if (s === 'paid') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
  if (s === 'approved') return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
  if (s === 'rejected') return 'bg-red-500/15 text-red-700 dark:text-red-400';
  return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
}

export default function WinningsCard({ rows, loading }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Winnings</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Totals from published draws (3 / 4 / 5 matches). Status tracks payout.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No winnings yet.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
            Total:{' '}
            <strong>
              $
              {rows.reduce((a, r) => a + Number(r.amount || 0), 0).toFixed(2)}
            </strong>
          </p>
          <ul className="mt-3 max-h-56 space-y-2 overflow-auto">
            {rows.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/50"
              >
                <span className="text-slate-700 dark:text-slate-200">{w.draw_month ?? '—'}</span>
                <span className="text-slate-600 dark:text-slate-400">{tierLabel(w.tier)}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">${Number(w.amount).toFixed(2)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyle(w.status)}`}>
                  {w.status}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
