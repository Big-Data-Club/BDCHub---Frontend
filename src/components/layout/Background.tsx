'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Initialize Worker
    const worker = new Worker(new URL('./background.worker.ts', import.meta.url));
    workerRef.current = worker;

    const isDark = resolvedTheme === 'dark';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;

    // 2. Transfer control if supported
    let offscreen: OffscreenCanvas | null = null;
    try {
      offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({
        type: 'init',
        data: {
          canvas: offscreen,
          width: window.innerWidth,
          height: window.innerHeight,
          isDark,
          prefersReducedMotion,
          dpr
        }
      }, [offscreen]);
    } catch (e) {
      console.warn('OffscreenCanvas not supported, background disabled or falling back.');
      // Fallback logic could go here if needed, but modern browsers support this.
    }

    // 3. Event Handlers
    const onPointerMove = (e: PointerEvent) => {
      worker.postMessage({
        type: 'mouse',
        data: { x: e.clientX, y: e.clientY }
      });
    };

    const onPointerLeave = () => {
      worker.postMessage({
        type: 'mouse',
        data: { x: 0, y: 0 }
      });
    };

    const onResize = () => {
      worker.postMessage({
        type: 'resize',
        data: {
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio || 1
        }
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      worker.terminate();
    };
  }, []);

  // Update theme in worker when it changes
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'theme',
        data: { isDark: resolvedTheme === 'dark' }
      });
    }
  }, [resolvedTheme]);

  return (
    <motion.div 
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      <canvas
        ref={canvasRef}
        id="bg-canvas"
        className="absolute inset-0 h-full w-full opacity-100"
      />
    </motion.div>
  );
};

export default Background;
