import { useEffect, useRef } from "react";

// Decorative confetti layer behind the dashboard cards -- canvas-based (not
// one DOM node per sprinkle) so a few dozen particles with real repel physics
// stay cheap. Pointer-events are left off the canvas itself (see the CSS)
// so clicks/hovers always reach the real cards sitting above it; mouse
// position is tracked at the window level instead purely to compute the
// repel force.
const COLORS = ["#ff5a36", "#ffb300", "#7c4dff", "#ff2d92", "#22c55e", "#ff9100", "#a389ff"];
const REPEL_RADIUS = 110;
const REPEL_STRENGTH = 0.9;
const SPRING = 0.02;
const DAMPING = 0.9;

interface Particle {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  shape: 0 | 1 | 2; // square / circle / triangle
}

function makeParticle(width: number, height: number): Particle {
  const ox = Math.random() * width;
  const oy = Math.random() * height;
  return {
    ox,
    oy,
    x: ox,
    y: oy,
    vx: 0,
    vy: 0,
    size: 6 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
    shape: Math.floor(Math.random() * 3) as 0 | 1 | 2
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = 0.55;
  const s = p.size;
  if (p.shape === 1) {
    ctx.beginPath();
    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 2) {
    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(s / 2, s / 2);
    ctx.lineTo(-s / 2, s / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(-s / 2, -s / 2, s, s);
  }
  ctx.restore();
}

export function ConfettiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    // A static (non-repelling, non-drifting) scatter for reduced-motion --
    // still decorative, just never animates.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function seed() {
      // Density-based count (not a flat number) so a tall page on desktop
      // gets more sprinkles than a short one on mobile, capped both ways.
      // (3x an earlier, too-sparse-looking density.)
      const count = Math.max(54, Math.min(Math.round((width * height) / 8700), 210));
      particles = Array.from({ length: count }, () => makeParticle(width, height));
    }

    function resize() {
      width = parent!.clientWidth;
      height = parent!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) drawParticle(ctx!, p);
    }

    let raf = 0;
    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      for (const p of particles) {
        // Spring back toward the particle's original scattered position...
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        // ...unless the cursor is close enough to shove it away first.
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        drawParticle(ctx!, p);
      }
      raf = requestAnimationFrame(tick);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function handleMouseLeave() {
      mouseRef.current = null;
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      drawStatic();
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
