import type { ReactNode } from "react";

interface CompleteScreenProps {
  title: string;
  bpAmount?: number;
  children?: ReactNode;
}

// Shared full-page celebratory screen shown in place of an activity's normal
// content once it's finished -- used by Tingxie's Learn/Apply/Practice and
// Read a Story, so "finishing something" always looks (and sounds, via
// Sound.applause() at each call site's completion effect) the same across
// every mode in the app.
export function CompleteScreen({ title, bpAmount, children }: CompleteScreenProps) {
  return (
    <div className="complete-screen">
      <div className="complete-emoji">🎉</div>
      <h2>{title}</h2>
      {bpAmount != null && <p className="bp-pop">+{bpAmount} BP</p>}
      {children}
    </div>
  );
}
