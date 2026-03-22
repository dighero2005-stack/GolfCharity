/**
 * Animated outline watermark footer — full viewport width, natural page flow.
 */
export default function BrandBackdrop() {
  return (
    <>
      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .brand-marquee {
          animation: marquee-ltr 18s linear infinite;
          will-change: transform;
        }
        .brand-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <footer className="pointer-events-none w-full select-none" aria-hidden>
        {/* Separator line */}
        <div className="mx-5 lg:mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Scrolling watermark */}
        <div className="w-full overflow-hidden py-3">
          {/* Double the text so the loop is seamless */}
          <div className="brand-marquee flex whitespace-nowrap">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="font-black tracking-tighter"
                style={{
                  fontSize: '18vw',
                  lineHeight: 1,
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(148,163,184,0.18)',
                  paddingRight: '6vw',
                  flexShrink: 0,
                }}
              >
                Golf Charity
              </span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}