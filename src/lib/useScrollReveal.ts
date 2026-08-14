import { useEffect, useRef, useState } from "react";

// Fades/slides a section in once it scrolls into view -- IntersectionObserver
// based (not a scroll listener) so it costs nothing while nothing is
// intersecting. Fires once and unobserves itself: a dashboard section
// re-hiding when scrolled back past feels like a bug, not a feature, on a
// page this short. Starts already-visible under prefers-reduced-motion,
// decided synchronously in the initializer so a reduced-motion visitor never
// renders the hidden frame at all (an effect flipping it a tick later would
// still fire the opacity/transform transition once, which is exactly the
// kind of motion this is meant to skip).
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible };
}
