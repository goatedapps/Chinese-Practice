// Shared inline-SVG icon set for the "garden" redesign -- only for glyphs
// with no matching illustrated PNG asset under public/icons/ (those are
// used directly as <img> instead, see TopNav.tsx/TodayMission.tsx/etc.).
// Mounted once in App.tsx, same pattern as CursorGlow/OwlFlyover; every
// consumer just renders <svg><use href="#i-name"/></svg>.
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path d="M4 11.5 12 4l8 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10.5V20h4.5v-5.5h3V20H18v-9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-paw" viewBox="0 0 24 24">
          <circle cx="8" cy="7.5" r="2" fill="currentColor" />
          <circle cx="16" cy="7.5" r="2" fill="currentColor" />
          <circle cx="5.3" cy="12.5" r="1.8" fill="currentColor" />
          <circle cx="18.7" cy="12.5" r="1.8" fill="currentColor" />
          <path d="M12 12.3c-3.2 0-5.6 2.1-5.6 4.8 0 2.2 2 3.4 5.6 3.4s5.6-1.2 5.6-3.4c0-2.7-2.4-4.8-5.6-4.8z" fill="currentColor" />
        </symbol>
        <symbol id="i-wheel" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3v9l6.5 3.7M12 12 5.5 8.3M12 12l-2 8.6M12 12l2 8.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </symbol>
        <symbol id="i-target" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
        </symbol>
        <symbol id="i-trophy" viewBox="0 0 24 24">
          <path d="M7 4h10v4.2a5 5 0 0 1-10 0V4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 5.3H4.3a3 3 0 0 0 3.1 3.9M17 5.3h2.7a3 3 0 0 1-3.1 3.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 13.2v3.1M9 20h6M9.6 16.9h4.8v3.1H9.6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-printer" viewBox="0 0 24 24">
          <path d="M6.5 9V4.3h11V9" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3.8" y="9" width="16.4" height="7" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M6.5 15.6h11v4.1h-11z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path d="M12 2.5 14.7 9l7.1.6-5.4 4.6 1.7 6.9L12 17.4 5.9 21.1l1.7-6.9L2.2 9.6 9.3 9z" fill="currentColor" />
        </symbol>
        <symbol id="i-chevron" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-heart" viewBox="0 0 24 24">
          <path d="M12 20.2s-7.2-4.4-9.6-8.7C.6 8 2 4.3 5.6 3.8c2.1-.3 3.9.8 4.7 2.4.9-1.6 2.6-2.7 4.7-2.4 3.6.5 5 4.2 3.2 7.7-2.4 4.3-9.6 8.7-9.6 8.7z" fill="currentColor" />
        </symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24">
          <path d="M12 3l1.4 6.6L20 11l-6.6 1.4L12 19l-1.4-6.6L4 11l6.6-1.4z" fill="currentColor" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
