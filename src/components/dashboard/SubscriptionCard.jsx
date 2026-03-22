export default function SubscriptionCard({ status, plan, onSubscribeMonthly, onSubscribeYearly, loading }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Subscription</h2>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        Status: <strong>{status === 'active' ? 'Active' : 'Inactive'}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        Plan: <strong>{plan || 'Not selected'}</strong>
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/60 dark:bg-emerald-900/20">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Monthly Plan</h3>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">$5 / month</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <li>Full access to score submissions</li>
            <li>Participate in every draw</li>
            <li>Flexible month-to-month billing</li>
          </ul>
          <button
            type="button"
            onClick={onSubscribeMonthly}
            disabled={loading}
            className="mt-3 rounded bg-emerald-600 px-3 py-2 cursor-pointer text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Choose Monthly'}
          </button>
        </article>

        <article className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/60 dark:bg-indigo-900/20">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Yearly Plan</h3>
          <p className="mt-1 text-lg font-bold text-indigo-700 dark:text-indigo-400">$40 / year</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <li>Best value over monthly billing</li>
            <li>Priority access to draw updates</li>
            <li>Long-term uninterrupted access</li>
          </ul>
          <button
            type="button"
            onClick={onSubscribeYearly}
            disabled={loading}
            className="mt-3 rounded bg-indigo-600 px-3 py-2 cursor-pointer text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Choose Yearly'}
          </button>
        </article>
      </div>
    </section>
  );
}

