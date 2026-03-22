import { isSubscriptionActive } from '../../lib/subscriptionAccess';
import { monthlyFeeFromPlan } from '../../lib/subscriptionHelpers';

function formatRenewal(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function SubscriptionStatusCard({ subscription, user }) {
  const active = isSubscriptionActive(subscription, user);
  const fee = monthlyFeeFromPlan(subscription.plan);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Subscription lottery
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Your access
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This is a subscription-based draw: your numbers compete against each published draw; prizes are split by tier;
            charity gets a cut of your subscription share.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <dl className="grid gap-3 sm:grid-cols-3 mb-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
          <dt className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Status</dt>
          <dd className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {active ? 'Active' : 'Inactive'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
          <dt className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Plan</dt>
          <dd className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
            {subscription.plan || '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
          <dt className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Renewal</dt>
          <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatRenewal(subscription.renewal_date)}
          </dd>
        </div>
      </dl>

      {/* Footer note */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 text-slate-400 dark:text-slate-500">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Estimated subscription amount (pool math):{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">${fee.toFixed(2)} / month</span>
        </p>
      </div>

    </section>
  );
}