'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

/* ─── Star ──────────────────────────────────────────────────────────── */
class Star {
  x: number;
  y: number;
  z: number; // depth layer 0-1
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.z = Math.random();
    this.size = 0.4 + this.z * 2;
    this.baseAlpha = 0.2 + this.z * 0.6;
    this.twinkleSpeed = 0.3 + Math.random() * 1.5;
    this.twinklePhase = Math.random() * Math.PI * 2;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, isDark: boolean) {
    const twinkle = Math.sin(time * this.twinkleSpeed + this.twinklePhase);
    const alpha = this.baseAlpha * (0.5 + 0.5 * twinkle) * (isDark ? 1 : 0.25);
    if (alpha < 0.02) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (isDark) {
      const hue = 200 + this.z * 30; // blue → cyan
      ctx.fillStyle = `hsla(${hue}, 70%, 80%, ${alpha})`;
    } else {
      ctx.fillStyle = `hsla(215, 50%, 60%, ${alpha * 0.6})`;
    }
    ctx.fill();
  }
}

/* ─── Nebula Blob ───────────────────────────────────────────────────── */
class Nebula {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  hue: number;
  driftX: number;
  driftY: number;
  phase: number;
  speed: number;

  constructor(w: number, h: number) {
    this.cx = Math.random() * w;
    this.cy = Math.random() * h;
    this.rx = 100 + Math.random() * 250;
    this.ry = 80 + Math.random() * 200;
    this.hue = [210, 230, 270][Math.floor(Math.random() * 3)]; // blue, indigo, violet
    this.driftX = (Math.random() - 0.5) * 0.15;
    this.driftY = (Math.random() - 0.5) * 0.1;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.1 + Math.random() * 0.2;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, w: number, h: number, isDark: boolean) {
    const x = this.cx + Math.sin(time * this.speed + this.phase) * 40;
    const y = this.cy + Math.cos(time * this.speed * 0.7 + this.phase) * 30;

    // Wrap around
    const wx = ((x % w) + w) % w;
    const wy = ((y % h) + h) % h;

    const alpha = isDark ? 0.06 : 0.02;
    const grad = ctx.createRadialGradient(wx, wy, 0, wx, wy, Math.max(this.rx, this.ry));
    grad.addColorStop(0, `hsla(${this.hue}, 60%, 50%, ${alpha})`);
    grad.addColorStop(0.5, `hsla(${this.hue}, 50%, 40%, ${alpha * 0.4})`);
    grad.addColorStop(1, `hsla(${this.hue}, 40%, 30%, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(wx, wy, this.rx, this.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.cx += this.driftX;
    this.cy += this.driftY;
  }
}

/* ─── Shooting Star ─────────────────────────────────────────────────── */
class ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  active: boolean;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.length = 0;
    this.active = false;
  }

  spawn(w: number, h: number) {
    this.x = Math.random() * w * 0.8;
    this.y = Math.random() * h * 0.4;
    const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
    const speed = 4 + Math.random() * 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.maxLife = 40 + Math.random() * 40;
    this.life = this.maxLife;
    this.length = 30 + Math.random() * 50;
    this.active = true;
  }

  update() {
    if (!this.active) return;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.active = false;
  }

  draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
    if (!this.active) return;
    const alpha = (this.life / this.maxLife) * (isDark ? 0.6 : 0.15);
    const tailX = this.x - (this.vx / Math.sqrt(this.vx ** 2 + this.vy ** 2)) * this.length;
    const tailY = this.y - (this.vy / Math.sqrt(this.vx ** 2 + this.vy ** 2)) * this.length;

    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, `hsla(200, 80%, 80%, 0)`);
    grad.addColorStop(1, `hsla(200, 80%, 80%, ${alpha})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  }
}

/* ─── Main Component ────────────────────────────────────────────────── */
const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const rafRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;

    function setSize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = Math.max(window.innerWidth, 300);
      const h = Math.max(window.innerHeight, 300);
      width = w;
      height = h;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initEntities() {
      const area = width * height;
      // Stars — denser than old particles for depth
      const starCount = Math.max(40, Math.round(area / 2500));
      starsRef.current = Array.from({ length: starCount }, () => new Star(width, height));

      // Nebulae — 3 max
      nebulaeRef.current = Array.from({ length: 3 }, () => new Nebula(width, height));

      // Shooting stars pool
      shootingRef.current = Array.from({ length: 3 }, () => new ShootingStar());
    }

    let lastShoot = 0;

    function animate(time: number) {
      if (!ctx) return;
      const t = time * 0.001; // seconds
      const isDark = resolvedTheme === 'dark';

      ctx.clearRect(0, 0, width, height);

      // Parallax offset from mouse (very subtle)
      const mx = (mouseRef.current.x / width - 0.5) * 6;
      const my = (mouseRef.current.y / height - 0.5) * 4;

      // Draw nebulae
      ctx.save();
      ctx.translate(mx * 0.3, my * 0.3);
      for (const neb of nebulaeRef.current) {
        neb.update();
        neb.draw(ctx, t, width, height, isDark);
      }
      ctx.restore();

      // Draw stars with parallax by depth
      for (const star of starsRef.current) {
        ctx.save();
        ctx.translate(mx * star.z, my * star.z);
        star.draw(ctx, t, isDark);
        ctx.restore();
      }

      // Shooting stars
      if (isDark && t - lastShoot > 4 + Math.random() * 6) {
        const idle = shootingRef.current.find(s => !s.active);
        if (idle) {
          idle.spawn(width, height);
          lastShoot = t;
        }
      }
      for (const ss of shootingRef.current) {
        ss.update();
        ss.draw(ctx, isDark);
      }

      // Mouse-connected constellation (nearest stars)
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const grabDist = 120;
        ctx.lineWidth = 1;
        for (const star of starsRef.current) {
          const dx = star.x + mx * star.z - mouseRef.current.x;
          const dy = star.y + my * star.z - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < grabDist) {
            const alpha = (1 - dist / grabDist) * (isDark ? 0.3 : 0.08);
            ctx.strokeStyle = isDark
              ? `hsla(200, 70%, 70%, ${alpha})`
              : `hsla(215, 50%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(star.x + mx * star.z, star.y + my * star.z);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    function onPointerMove(e: PointerEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }
    function onPointerLeave() {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    }

    function onResize() {
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        setSize();
        initEntities();
      }, 120);
    }

    setSize();
    initEntities();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-transparent"
      aria-hidden
    />
  );
};

export default Background;
