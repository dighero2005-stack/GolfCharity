export default function ThemeToggle({ mode, onToggle }) {
  const isDark = mode === 'dark';

  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 
        ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
    >
      {/* Track icons */}
      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px]">
        🌞
      </span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px]">
        🌙
      </span>

      {/* Knob */}
      <div
        className={` absolute top-0.5 left-0.5 w-5 h-5 rounded-full active:scale-95 bg-white shadow-md 
        transition-all duration-300 
        ${isDark ? 'translate-x-5 bg-slate-900' : ''}`}
      />
    </button>
  );
}