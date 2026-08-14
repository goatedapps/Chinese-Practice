import type { ReactNode } from "react";
import { useScrollReveal } from "../../lib/useScrollReveal";

// Thin wrapper that fades/slides its children in as they scroll into view --
// see lib/useScrollReveal.ts. `delay` (ms) staggers a group of siblings so
// they don't all pop in at once when several land in the viewport together
// (e.g. Home's above-the-fold cards on first paint).
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={"scroll-reveal" + (visible ? " scroll-reveal-visible" : "")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
