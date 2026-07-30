"use client";

import { useEffect, useRef } from "react";

export function useSmoothScroll() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initLenis = async () => {
      try {
        // lenis may not have types in this project; ignore TypeScript module-not-found for dynamic import
        // @ts-ignore
        const { default: Lenis } = (await import("lenis")) as any;
        const lenis = new Lenis({
          duration: 1.8,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 1,
        });

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
      } catch {
        // Lenis not available, smooth scroll via CSS
      }
    };

    initLenis();
  }, []);
}
