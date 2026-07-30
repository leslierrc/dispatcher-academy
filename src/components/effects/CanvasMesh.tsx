"use client";

import { useRef, useEffect, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
}

export default function CanvasMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spacing = Math.max(60, Math.min(100, w / 12));
    const cols = Math.floor(w / spacing) + 2;
    const rows = Math.floor(h / spacing) + 2;
    const pts: Point[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = c * spacing + (r % 2) * (spacing / 2);
        const by = r * spacing;
        pts.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          vx: 0,
          vy: 0,
        });
      }
    }
    pointsRef.current = pts;
  }, []);

  useEffect(() => {
    init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    const animate = () => {
      const w = innerWidth;
      const h = innerHeight;
      ctx.clearRect(0, 0, w, h);

      const pts = pointsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        p.vx += dx * 0.003 + (Math.random() - 0.5) * 0.04;
        p.vy += dy * 0.003 + (Math.random() - 0.5) * 0.04;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        const mdx = mx - p.x;
        const mdy = my - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 200) {
          const force = ((200 - mdist) / 200) * 0.5;
          p.x -= (mdx / mdist) * force;
          p.y -= (mdy / mdist) * force;
        }
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.strokeStyle = `rgba(168,114,122,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const mdx = mx - p.x;
        const mdy = my - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const glow = mdist < 150 ? (1 - mdist / 150) * 0.8 : 0.2;
        ctx.fillStyle = `rgba(168,114,122,${glow})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, mdist < 150 ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4, zIndex: 0 }}
    />
  );
}
