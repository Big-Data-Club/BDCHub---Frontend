'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

/* ═══════════════════════════════════════════════════════════════════════
   Star — individual twinkling star with glow halo
   ═══════════════════════════════════════════════════════════════════════ */
class Star {
  x: number;
  y: number;
  z: number;         // depth 0..1 (1 = closest/biggest)
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.z = Math.random();
    this.size = 0.5 + this.z * 1.8;
    this.baseAlpha = 0.3 + this.z * 0.7;
    this.twinkleSpeed = 0.3 + Math.random() * 1.2;
    this.twinklePhase = Math.random() * Math.PI * 2;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, isDark: boolean) {
    const twinkle = Math.sin(time * this.twinkleSpeed + this.twinklePhase);
    const alpha = this.baseAlpha * (0.5 + 0.5 * twinkle);

    // Skip nearly invisible
    if (alpha < 0.03) return;

    // === Glow halo for bright stars ===
    if (this.z > 0.5) {
      const glowRadius = this.size * (isDark ? 5 : 3.5);
      const glowAlpha = alpha * (isDark ? 0.12 : 0.06);
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `hsla(210, 60%, 90%, ${glowAlpha})`
        : `hsla(220, 60%, 55%, ${glowAlpha})`;
      ctx.fill();
    }

    // === Star core ===
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (isDark) {
      // Warm white → cool blue by depth
      const hue = 200 + this.z * 20;
      ctx.fillStyle = `hsla(${hue}, 30%, 95%, ${alpha})`;
    } else {
      // Light mode: soft blue-indigo visible stars
      const hue = 215 + this.z * 25;
      ctx.fillStyle = `hsla(${hue}, 55%, 50%, ${alpha * 0.45})`;
    }
    ctx.fill();

    // === Sparkle cross on very bright stars (z > 0.85) ===
    if (this.z > 0.85 && alpha > 0.6) {
      const sparkleLen = this.size * (isDark ? 4 : 2.5);
      const sparkleAlpha = alpha * (isDark ? 0.25 : 0.1);
      ctx.strokeStyle = isDark
        ? `hsla(200, 50%, 95%, ${sparkleAlpha})`
        : `hsla(220, 60%, 55%, ${sparkleAlpha})`;
      ctx.lineWidth = 0.5;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(this.x - sparkleLen, this.y);
      ctx.lineTo(this.x + sparkleLen, this.y);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - sparkleLen);
      ctx.lineTo(this.x, this.y + sparkleLen);
      ctx.stroke();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Nebula — soft ambient glow blobs
   ═══════════════════════════════════════════════════════════════════════ */
class Nebula {
  cx: number; cy: number;
  rx: number; ry: number;
  hue: number;
  phase: number; speed: number;

  constructor(w: number, h: number) {
    this.cx = Math.random() * w;
    this.cy = Math.random() * h;
    this.rx = 200 + Math.random() * 350;
    this.ry = 150 + Math.random() * 280;
    this.hue = [210, 240, 265, 190][Math.floor(Math.random() * 4)];
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.04 + Math.random() * 0.08;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, w: number, h: number, isDark: boolean) {
    const x = this.cx + Math.sin(time * this.speed + this.phase) * 35;
    const y = this.cy + Math.cos(time * this.speed * 0.7 + this.phase) * 25;
    const wx = ((x % w) + w) % w;
    const wy = ((y % h) + h) % h;

    const alpha = isDark ? 0.055 : 0.025;
    const r = Math.max(this.rx, this.ry);
    const grad = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
    grad.addColorStop(0,   `hsla(${this.hue}, 55%, 50%, ${alpha})`);
    grad.addColorStop(0.4, `hsla(${this.hue}, 45%, 40%, ${alpha * 0.35})`);
    grad.addColorStop(1,   `hsla(${this.hue}, 35%, 30%, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(wx, wy, this.rx, this.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   ShootingStar — fast meteor with gradient trail
   ═══════════════════════════════════════════════════════════════════════ */
class ShootingStar {
  x = 0; y = 0; vx = 0; vy = 0;
  life = 0; maxLife = 0; length = 0;
  active = false;

  spawn(w: number, h: number) {
    this.x = Math.random() * w * 0.8;
    this.y = Math.random() * h * 0.35;
    const angle = Math.PI / 7 + Math.random() * Math.PI / 5;
    const speed = 5 + Math.random() * 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.maxLife = 35 + Math.random() * 30;
    this.life = this.maxLife;
    this.length = 50 + Math.random() * 70;
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
    const progress = this.life / this.maxLife;
    const alpha = progress * (isDark ? 0.7 : 0.3);
    const mag = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    const tailX = this.x - (this.vx / mag) * this.length * progress;
    const tailY = this.y - (this.vy / mag) * this.length * progress;

    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    if (isDark) {
      grad.addColorStop(0, `hsla(200, 80%, 90%, 0)`);
      grad.addColorStop(0.6, `hsla(200, 70%, 90%, ${alpha * 0.3})`);
      grad.addColorStop(1, `hsla(200, 80%, 97%, ${alpha})`);
    } else {
      grad.addColorStop(0, `hsla(220, 70%, 55%, 0)`);
      grad.addColorStop(0.6, `hsla(220, 60%, 50%, ${alpha * 0.3})`);
      grad.addColorStop(1, `hsla(220, 70%, 45%, ${alpha})`);
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = isDark ? 1.5 : 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Bright head
    ctx.beginPath();
    ctx.arc(this.x, this.y, isDark ? 1.5 : 1, 0, Math.PI * 2);
    ctx.fillStyle = isDark
      ? `hsla(200, 80%, 97%, ${alpha})`
      : `hsla(220, 70%, 50%, ${alpha})`;
    ctx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Background Component
   ═══════════════════════════════════════════════════════════════════════ */
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

    let width = 0;
    let height = 0;

    function setSize() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
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
      // Rich star density — feels like a real sky
      const starCount = Math.max(60, Math.round(area / 2200));
      starsRef.current = Array.from({ length: starCount }, () => new Star(width, height));
      nebulaeRef.current = Array.from({ length: 4 }, () => new Nebula(width, height));
      shootingRef.current = Array.from({ length: 3 }, () => new ShootingStar());
    }

    let lastShoot = 0;

    function animate(time: number) {
      if (!ctx) return;
      const t = time * 0.001;
      const isDark = resolvedTheme === 'dark';

      ctx.clearRect(0, 0, width, height);

      // Mouse parallax
      const mx = (mouseRef.current.x / width - 0.5) * 5;
      const my = (mouseRef.current.y / height - 0.5) * 3.5;

      // ──── Nebulae (deepest) ────
      ctx.save();
      ctx.translate(mx * 0.15, my * 0.15);
      for (const neb of nebulaeRef.current) {
        neb.draw(ctx, t, width, height, isDark);
      }
      ctx.restore();

      // ──── Stars ────
      for (const star of starsRef.current) {
        ctx.save();
        ctx.translate(mx * star.z * 0.6, my * star.z * 0.6);
        star.draw(ctx, t, isDark);
        ctx.restore();
      }

      // ──── Star-to-star constellations ────
      const stars = starsRef.current;
      const constellDist = isDark ? 110 : 90;
      const constellDistSq = constellDist * constellDist;
      ctx.lineCap = 'round';
      for (let i = 0; i < stars.length; i++) {
        if (stars[i].z < 0.45) continue; // Only mid-to-close stars
        for (let j = i + 1; j < stars.length; j++) {
          if (stars[j].z < 0.45) continue;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < constellDistSq) {
            const alpha = (1 - distSq / constellDistSq) * (isDark ? 0.07 : 0.035);
            ctx.lineWidth = isDark ? 0.5 : 0.4;
            ctx.strokeStyle = isDark
              ? `hsla(210, 50%, 85%, ${alpha})`
              : `hsla(220, 50%, 55%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(
              stars[i].x + mx * stars[i].z * 0.6,
              stars[i].y + my * stars[i].z * 0.6
            );
            ctx.lineTo(
              stars[j].x + mx * stars[j].z * 0.6,
              stars[j].y + my * stars[j].z * 0.6
            );
            ctx.stroke();
          }
        }
      }

      // ──── Shooting stars ────
      if (t - lastShoot > (isDark ? 4 : 6) + Math.random() * 5) {
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

      // ──── Mouse interaction — connect nearby stars ────
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const grabDist = 160;
        const connected: Star[] = [];

        // Find stars near cursor
        for (const star of starsRef.current) {
          const sx = star.x + mx * star.z * 0.6;
          const sy = star.y + my * star.z * 0.6;
          const dx = sx - mouseRef.current.x;
          const dy = sy - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < grabDist) {
            connected.push(star);
            // Line from cursor to star
            const alpha = (1 - dist / grabDist) * (isDark ? 0.3 : 0.12);
            ctx.lineWidth = isDark ? 0.8 : 0.6;
            ctx.strokeStyle = isDark
              ? `hsla(200, 60%, 80%, ${alpha})`
              : `hsla(220, 55%, 50%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
        }

        // Connect nearby grabbed stars to each other
        for (let i = 0; i < connected.length; i++) {
          for (let j = i + 1; j < connected.length; j++) {
            const si = connected[i];
            const sj = connected[j];
            const six = si.x + mx * si.z * 0.6;
            const siy = si.y + my * si.z * 0.6;
            const sjx = sj.x + mx * sj.z * 0.6;
            const sjy = sj.y + my * sj.z * 0.6;
            const ddx = six - sjx;
            const ddy = siy - sjy;
            const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (ddist < grabDist * 1.2) {
              const alpha = (1 - ddist / (grabDist * 1.2)) * (isDark ? 0.15 : 0.06);
              ctx.lineWidth = isDark ? 0.5 : 0.3;
              ctx.strokeStyle = isDark
                ? `hsla(200, 50%, 75%, ${alpha})`
                : `hsla(220, 50%, 55%, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(six, siy);
              ctx.lineTo(sjx, sjy);
              ctx.stroke();
            }
          }
        }

        // Cursor glow
        const cursorGrad = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 30
        );
        cursorGrad.addColorStop(0, isDark
          ? 'hsla(200, 60%, 85%, 0.08)'
          : 'hsla(220, 55%, 55%, 0.04)');
        cursorGrad.addColorStop(1, 'hsla(200, 50%, 50%, 0)');
        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 30, 0, Math.PI * 2);
        ctx.fill();
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
