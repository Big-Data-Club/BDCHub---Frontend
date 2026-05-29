'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

// Global singleton cache to persist Worker and Canvas reference across Next.js client-side route transitions.
// This prevents 'DOMException: Cannot transfer control to offscreen twice' when Next.js Router Cache
// reuses the previously rendered layout and canvas DOM node upon navigating back.
let globalWorker: Worker | null = null;
let globalCanvas: HTMLCanvasElement | null = null;

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isDark = resolvedTheme === 'dark';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;

    // Check if we can reuse the existing worker and canvas element
    if (!globalWorker || globalCanvas !== canvas) {
      // If there was an old worker running on a different canvas, terminate it first
      if (globalWorker) {
        globalWorker.terminate();
      }

      // 1. Initialize fresh Worker
      const worker = new Worker(new URL('./background.worker.ts', import.meta.url));
      globalWorker = worker;
      globalCanvas = canvas;
      workerRef.current = worker;

      // 2. Transfer control to OffscreenCanvas
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
        console.warn('OffscreenCanvas not supported or already transferred, falling back.', e);
      }
    } else {
      // Reuse the existing worker and canvas
      workerRef.current = globalWorker;

      // Sync size, DPR, and theme so the existing background fits perfectly
      globalWorker.postMessage({
        type: 'resize',
        data: {
          width: window.innerWidth,
          height: window.innerHeight,
          dpr
        }
      });
      globalWorker.postMessage({
        type: 'theme',
        data: { isDark }
      });
    }

    const worker = workerRef.current;

    // 3. Event Handlers
    const onPointerMove = (e: PointerEvent) => {
      worker?.postMessage({
        type: 'mouse',
        data: { x: e.clientX, y: e.clientY }
      });
    };

    const onPointerLeave = () => {
      worker?.postMessage({
        type: 'mouse',
        data: { x: 0, y: 0 }
      });
    };

    const onResize = () => {
      worker?.postMessage({
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
      // DO NOT terminate the worker here. We keep it alive in the global variable so that
      // when the layout mounts again, the canvas is immediately active and rendering.
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
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

