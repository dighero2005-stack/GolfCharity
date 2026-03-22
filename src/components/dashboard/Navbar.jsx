import ThemeToggle from './ThemeToggle';

export default function Navbar({ email, themeMode, onToggleTheme, onLogout, loggingOut }) {
  const initial = email?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

      {/* ── Left: wordmark ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 2h7l3 3v9H3V2z" stroke="#f8fafc" strokeWidth="1.3" strokeLinejoin="round" className="dark:stroke-slate-900"/>
            <path d="M10 2v3h3" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-slate-900"/>
            <line x1="5" y1="8" x2="11" y2="8" stroke="#f8fafc" strokeWidth="1.1" strokeLinecap="round" className="dark:stroke-slate-900"/>
            <line x1="5" y1="11" x2="9" y2="11" stroke="#f8fafc" strokeWidth="1.1" strokeLinecap="round" className="dark:stroke-slate-900"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Golf Charity
        </span>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <div className="cursor-pointer">
          <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User avatar + email */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{initial}</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 max-w-[140px] truncate hidden sm:block">
            {email}
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loggingOut ? (
            <>
              <svg className="animate-spin shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Logging out…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M10 11l3-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="13" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Logout
            </>
          )}
        </button>

      </div>
    </nav>
  );
}