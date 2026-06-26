/**
 * background.worker.ts
 * High-performance animation worker for BDC Background system.
 * Optimized for zero-allocation loops and low GC pressure.
 */

interface WorkerConfig {
  width: number;
  height: number;
  isDark: boolean;
  prefersReducedMotion: boolean;
}

const config: WorkerConfig = {
  width: 0,
  height: 0,
  isDark: true,
  prefersReducedMotion: false
};

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let animationRunning = false; // Guard against duplicate rAF loops

// --- State ---
let starsData: Float32Array; // [x, y, z, size, baseAlpha, twinkleSpeed, twinklePhase, hue, colorType, shimmer, initDelay]
const STAR_STRIDE = 11;
let starCount = 0;

let nebulae: any[] = [];
let shootingStars: any[] = [];

// --- Pulse Pooling ---
interface Pulse {
  x1: number; y1: number; x2: number; y2: number;
  targetIdx: number;
  progress: number;
  speed: number;
  active: boolean;
}
const pulses: Pulse[] = []; 
const pulsePool: Pulse[] = [];

function getPulse(): Pulse {
  const p = pulsePool.pop();
  if (p) {
    p.active = true;
    return p;
  }
  return { x1: 0, y1: 0, x2: 0, y2: 0, targetIdx: 0, progress: 0, speed: 0, active: true };
}

function releasePulse(p: Pulse) {
  p.active = false;
  pulsePool.push(p);
}

// --- Spatial Partitioning (Zero-Allocation Linked List) ---
const CONSTELL_DIST = 110;
let gridHead: Int32Array;
let gridNext: Int32Array;
let gridCols = 0;
let gridRows = 0;

// Constellation pair bitmask (Optimized O(1) lookup with Generation Counter)
let pairMask: Uint16Array; 
let pairGeneration = 0;

// Hover buffer (Zero-Allocation)
let connectedBuf: Int32Array;
let connectedLen = 0;

const mouse = { x: 0, y: 0 };
const mouseFollow = { x: 0, y: 0 };
let lastShootTime = 0;
let initTime = 0;
let totalBloomTime = 0; // Dynamic duration for star materialization

// --- Sprites ---
let starSprites: OffscreenCanvas | null = null;
const SPRITE_SIZE = 32;

let nebulaSprites: OffscreenCanvas | null = null;
const NEBULA_SPRITE_SIZE = 256; // Reduced for performance, blur makes it look fine

function createSprites() {
  // 1. Star Sprites
  starSprites = new OffscreenCanvas(SPRITE_SIZE * 6, SPRITE_SIZE * 3);
  const sCtx = starSprites.getContext('2d');
  if (!sCtx) return;

  const drawSprite = (idx: number, type: 'dark' | 'light', glow: boolean) => {
    const x = idx * SPRITE_SIZE + SPRITE_SIZE / 2;
    const y = (type === 'dark' ? 0 : glow ? 2 : 1) * SPRITE_SIZE + SPRITE_SIZE / 2;
    
    sCtx.save();
    sCtx.translate(x, y);
    
    const size = [1, 1.5, 2, 2.5, 2, 2][idx];
    const isDark = type === 'dark';
    const hue = [200, 210, 220, 230, 45, 10][idx];
    
    if (glow) {
      const gRad = size * (isDark ? 5 : 3.5);
      const gGrad = sCtx.createRadialGradient(0, 0, 0, 0, 0, gRad);
      const gAlpha = isDark ? 0.12 : 0.06;
      gGrad.addColorStop(0, `hsla(${hue}, 60%, 90%, ${gAlpha})`);
      gGrad.addColorStop(1, `hsla(${hue}, 60%, 90%, 0)`);
      sCtx.fillStyle = gGrad;
      sCtx.beginPath();
      sCtx.arc(0, 0, gRad, 0, Math.PI * 2);
      sCtx.fill();
    }

    sCtx.beginPath();
    sCtx.arc(0, 0, size, 0, Math.PI * 2);
    if (isDark) {
      sCtx.fillStyle = `hsla(${hue}, 30%, 95%, 1)`;
    } else {
      sCtx.fillStyle = `hsla(${hue}, 55%, 50%, 0.45)`;
    }
    sCtx.fill();
    sCtx.restore();
  };

  for (let i = 0; i < 6; i++) {
    drawSprite(i, 'dark', false);
    drawSprite(i, 'light', false);
    drawSprite(i, 'dark', true);
  }

  // 2. Nebula Sprites
  nebulaSprites = new OffscreenCanvas(NEBULA_SPRITE_SIZE * 4, NEBULA_SPRITE_SIZE);
  const nCtx = nebulaSprites.getContext('2d');
  if (!nCtx) return;

  const hues = [210, 240, 265, 190];
  hues.forEach((hue, i) => {
    const x = i * NEBULA_SPRITE_SIZE + NEBULA_SPRITE_SIZE / 2;
    const y = NEBULA_SPRITE_SIZE / 2;
    const r = NEBULA_SPRITE_SIZE / 2;
    
    const grad = nCtx.createRadialGradient(x, y, 0, x, y, r);
    // These are fully opaque in the sprite, we control alpha during drawImage
    grad.addColorStop(0,   `hsla(${hue}, 75%, 65%, 1.0)`);
    grad.addColorStop(0.3, `hsla(${hue}, 65%, 50%, 0.4)`);
    grad.addColorStop(1,   `hsla(${hue}, 55%, 40%, 0)`);
    
    nCtx.fillStyle = grad;
    nCtx.beginPath();
    nCtx.arc(x, y, r, 0, Math.PI * 2);
    nCtx.fill();
  });
}

function initStars(w: number, h: number) {
  const isMobile = w < 768;
  const maxStars = isMobile ? 150 : 500;
  starCount = Math.min(maxStars, Math.max(60, Math.round((w * h) / 2200)));
  
  starsData = new Float32Array(starCount * STAR_STRIDE);
  let maxDelay = 0;
  
  for (let i = 0; i < starCount; i++) {
    const off = i * STAR_STRIDE;
    const z = Math.pow(Math.random(), 3);
    starsData[off + 0] = Math.random() * w;
    starsData[off + 1] = Math.random() * h;
    starsData[off + 2] = z;
    starsData[off + 3] = 0.5 + z * 1.8;
    starsData[off + 4] = 0.3 + z * 0.7;
    starsData[off + 5] = z > 0.85 ? (0.35 + Math.random() * 0.5) : (0.3 + Math.random() * 1.2);
    starsData[off + 6] = Math.random() * Math.PI * 2;
    
    const rand = Math.random();
    if (rand < 0.03) {
      starsData[off + 7] = 45;
      starsData[off + 8] = 4;
    } else if (rand < 0.05) {
      starsData[off + 7] = 10;
      starsData[off + 8] = 5;
    } else {
      starsData[off + 7] = 200 + z * 20;
      starsData[off + 8] = z > 0.8 ? 3 : z > 0.5 ? 2 : z > 0.3 ? 1 : 0;
    }
    starsData[off + 9] = 0;
    
    const dx = starsData[off + 0] - w / 2;
    const dy = starsData[off + 1] - h / 2;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy) / (Math.max(w, h) * 0.5);
    const delay = distFromCenter * 0.8 + (1 - z) * 0.5 + Math.random() * 1.5;
    starsData[off + 10] = delay;
    if (delay > maxDelay) maxDelay = delay;
  }

  // Set totalBloomTime dynamically (max delay + time for the last star to fully bloom)
  totalBloomTime = maxDelay + 0.8;

  // Pre-allocate spatial grid
  gridCols = Math.ceil(w / CONSTELL_DIST) + 1;
  gridRows = Math.ceil(h / CONSTELL_DIST) + 1;
  gridHead = new Int32Array(gridCols * gridRows);
  gridNext = new Int32Array(starCount);
  pairMask = new Uint16Array(starCount * starCount);
  connectedBuf = new Int32Array(starCount);

  const fixedNebulae = [
    { x: 0.5,  y: 0.25, rx: 550, ry: 450, hueIdx: 3, z: 0.1 }, // Behind Hero (Cyan)
    { x: 0.85, y: 0.15, rx: 350, ry: 300, hueIdx: 1, z: 0.4 }, // Top Right (Purple)
    { x: 0.1,  y: 0.6,  rx: 400, ry: 350, hueIdx: 0, z: 0.2 }, // Middle Left (Blue)
    { x: 0.8,  y: 0.8,  rx: 500, ry: 400, hueIdx: 2, z: 0.3 }, // Bottom Right (Deep Blue)
    { x: 0.95, y: 0.5,  rx: 300, ry: 250, hueIdx: 3, z: 0.7 }, // Far Right (Cyan)
    { x: 0.05, y: 0.1,  rx: 250, ry: 200, hueIdx: 1, z: 0.8 }, // Top Left (Purple)
  ];

  nebulae = fixedNebulae.map(neb => ({
    cx: neb.x * w,
    cy: neb.y * h,
    rx: isMobile ? neb.rx * 0.6 : neb.rx,
    ry: isMobile ? neb.ry * 0.6 : neb.ry,
    hueIdx: neb.hueIdx,
    phase: Math.random() * Math.PI * 2,
    speed: 0.01 + Math.random() * 0.02,
    z: neb.z
  }));

  shootingStars = Array.from({ length: isMobile ? 1 : 3 }, () => ({
    x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, active: false
  }));
}

function update(t: number) {
  if (config.prefersReducedMotion) return;

  mouseFollow.x = mouse.x;
  mouseFollow.y = mouse.y;

  const mxOffset = (mouseFollow.x / config.width - 0.5) * 18;
  const myOffset = (mouseFollow.y / config.height - 0.5) * 12;

  // Update Shooting Stars
  if (t - lastShootTime > (config.isDark ? 4 : 6) + Math.random() * 5) {
    const idle = shootingStars.find(s => !s.active);
    if (idle) {
      idle.active = true;
      idle.x = Math.random() * config.width * 0.8;
      idle.y = Math.random() * config.height * 0.35;
      const angle = Math.PI / 7 + Math.random() * Math.PI / 5;
      const speed = 5 + Math.random() * 6;
      idle.vx = Math.cos(angle) * speed;
      idle.vy = Math.sin(angle) * speed;
      idle.maxLife = 60 + Math.random() * 30;
      idle.life = idle.maxLife;
      lastShootTime = t;
    }
  }

  for (const s of shootingStars) {
    if (!s.active) continue;
    s.x += s.vx;
    s.y += s.vy;
    s.life--;
    if (s.life <= 0) s.active = false;

    // Pulse nearby stars using Spatial Grid
    const sDistSq = 150 * 150;
    const sgx = Math.floor(s.x / CONSTELL_DIST);
    const sgy = Math.floor(s.y / CONSTELL_DIST);
    
    for (let ny = Math.max(0, sgy - 1); ny <= Math.min(gridRows - 1, sgy + 1); ny++) {
      for (let nx = Math.max(0, sgx - 1); nx <= Math.min(gridCols - 1, sgx + 1); nx++) {
        let i = gridHead[ny * gridCols + nx];
        while (i !== -1) {
          const off = i * STAR_STRIDE;
          const z = starsData[off + 2];
          const sx = starsData[off + 0] + mxOffset * z * 0.6;
          const sy = starsData[off + 1] + myOffset * z * 0.6;
          const dx = sx - s.x;
          const dy = sy - s.y;
          if (dx * dx + dy * dy < sDistSq) {
            starsData[off + 9] = Math.min(1.0, starsData[off + 9] + 0.2);
          }
          i = gridNext[i];
        }
      }
    }
  }

  // Decay shimmer
  for (let i = 0; i < starCount; i++) {
    starsData[i * STAR_STRIDE + 9] *= 0.98;
  }

  // Update Pulses (using Pool & Swap-and-Pop)
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.progress += p.speed;
    if (p.progress >= 1) {
      starsData[p.targetIdx * STAR_STRIDE + 9] = Math.min(1.0, starsData[p.targetIdx * STAR_STRIDE + 9] + 0.4);
      releasePulse(p);
      // Swap with last for O(1) removal
      pulses[i] = pulses[pulses.length - 1];
      pulses.pop();
    }
  }
}

function draw() {
  if (!ctx) {
    animationRunning = false;
    return;
  }
  
  const now = performance.now();
  const t = (now - initTime) * 0.001; // elapsed time in seconds since init
  
  // Sync state update with draw loop
  update(t);

  ctx.clearRect(0, 0, config.width, config.height);

  const mxOffsetRaw = (mouseFollow.x / config.width - 0.5) * 18;
  const myOffsetRaw = (mouseFollow.y / config.height - 0.5) * 12;
  const parallaxFactor = Math.max(0, Math.min(1, (t - totalBloomTime) * 2.0));
  const mxOffset = mxOffsetRaw * parallaxFactor;
  const myOffset = myOffsetRaw * parallaxFactor;

  // --- Nebulae (Optimized with Sprites) ---
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const neb of nebulae) {
    const pX = mxOffset * (0.05 + neb.z * 0.12);
    const pY = myOffset * (0.05 + neb.z * 0.12);
    
    const x = neb.cx + Math.sin(t * neb.speed + neb.phase) * 35;
    const y = neb.cy + Math.cos(t * neb.speed * 0.7 + neb.phase) * 25;
    
    const wx = ((x + pX % config.width) + config.width) % config.width;
    const wy = ((y + pY % config.height) + config.height) % config.height;
    
    const alphaBase = config.isDark ? 0.12 : 0.05;
    const alpha = neb.z > 0.5 ? alphaBase : alphaBase * 0.6;
    
    if (nebulaSprites) {
      ctx.save();
      ctx.translate(wx, wy);
      ctx.scale(neb.rx, neb.ry);
      ctx.globalAlpha = alpha;
      // Draw the pre-rendered sprite
      ctx.drawImage(
        nebulaSprites, 
        neb.hueIdx * NEBULA_SPRITE_SIZE, 0, NEBULA_SPRITE_SIZE, NEBULA_SPRITE_SIZE, 
        -1, -1, 2, 2 // Draw into unit space (-1 to 1) which is scaled to (rx, ry)
      );
      ctx.restore();
    }
  }
  ctx.restore();

  // --- Spatial Grid Build ---
  gridHead.fill(-1);
  const constellDistSq = CONSTELL_DIST * CONSTELL_DIST;
  
  for (let i = 0; i < starCount; i++) {
    const off = i * STAR_STRIDE;
    const sx = starsData[off + 0] + mxOffset * starsData[off + 2] * 0.6;
    const sy = starsData[off + 1] + myOffset * starsData[off + 2] * 0.6;
    
    const gx = Math.floor(sx / CONSTELL_DIST);
    const gy = Math.floor(sy / CONSTELL_DIST);
    if (gx >= 0 && gx < gridCols && gy >= 0 && gy < gridRows) {
      const cell = gy * gridCols + gx;
      gridNext[i] = gridHead[cell];
      gridHead[cell] = i;
    }
  }

  // --- Constellations (Optimized Batch Drawing) ---
  ctx.lineCap = 'round';
  const breathing = Math.sin(t * 1.2) * 0.3 + 0.7;
  // Generation counter instead of fill(0)
  pairGeneration = (pairGeneration + 1) % 65535;

  ctx.lineWidth = config.isDark ? 0.5 : 0.4;
  ctx.globalAlpha = breathing; 
  ctx.strokeStyle = config.isDark ? `hsla(210, 50%, 85%, 0.05)` : `hsla(220, 50%, 55%, 0.025)`;
  ctx.beginPath();

  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const cellI = gy * gridCols + gx;
      let i = gridHead[cellI];
      
      while (i !== -1) {
        if (starsData[i * STAR_STRIDE + 2] >= 0.45) {
          for (let ny = gy; ny <= Math.min(gy + 1, gridRows - 1); ny++) {
            for (let nx = (ny === gy ? gx : Math.max(0, gx - 1)); nx <= Math.min(gx + 1, gridCols - 1); nx++) {
              const cellJ = ny * gridCols + nx;
              let j = gridHead[cellJ];
              
              while (j !== -1) {
                if (i < j && starsData[j * STAR_STRIDE + 2] >= 0.45) {
                  const maskIdx = i * starCount + j;
                  if (pairMask[maskIdx] !== pairGeneration) {
                    pairMask[maskIdx] = pairGeneration;

                    const offI = i * STAR_STRIDE;
                    const offJ = j * STAR_STRIDE;
                    const six = starsData[offI + 0] + mxOffset * starsData[offI + 2] * 0.6;
                    const siy = starsData[offI + 1] + myOffset * starsData[offI + 2] * 0.6;
                    const sjx = starsData[offJ + 0] + mxOffset * starsData[offJ + 2] * 0.6;
                    const sjy = starsData[offJ + 1] + myOffset * starsData[offJ + 2] * 0.6;

                    const dx = six - sjx;
                    const dy = siy - sjy;
                    const dSq = dx * dx + dy * dy;

                    if (dSq < constellDistSq) {
                      ctx.moveTo(six, siy);
                      ctx.lineTo(sjx, sjy);

                      if (t > totalBloomTime && Math.random() < 0.0006) {
                        const p = getPulse();
                        p.x1 = six; p.y1 = siy; p.x2 = sjx; p.y2 = sjy;
                        p.targetIdx = j; p.progress = 0; p.speed = 0.02 + Math.random() * 0.03;
                        pulses.push(p);
                      }
                    }
                  }
                }
                j = gridNext[j];
              }
            }
          }
        }
        i = gridNext[i];
      }
    }
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // --- Mouse interaction (Grid-Optimized & Sparse Web) ---
  if (mouse.x > 0 && mouse.y > 0) {
    const grabDist = 160; // Aligned with docs
    const grabDistSq = grabDist * grabDist;
    const mgx = Math.floor(mouseFollow.x / CONSTELL_DIST);
    const mgy = Math.floor(mouseFollow.y / CONSTELL_DIST);
    
    connectedLen = 0;

    ctx.beginPath();
    ctx.lineWidth = config.isDark ? 0.8 : 0.6; 

    for (let ny = Math.max(0, mgy - 2); ny <= Math.min(gridRows - 1, mgy + 2); ny++) {
      for (let nx = Math.max(0, mgx - 2); nx <= Math.min(gridCols - 1, mgx + 2); nx++) {
        let i = gridHead[ny * gridCols + nx];
        while (i !== -1) {
          const off = i * STAR_STRIDE;
          const z = starsData[off + 2];
          if (z > 0.15) {
            const sx = starsData[off + 0] + mxOffset * z * 0.6;
            const sy = starsData[off + 1] + myOffset * z * 0.6;
            const dx = sx - mouseFollow.x;
            const dy = sy - mouseFollow.y;
            const dSq = dx * dx + dy * dy;

            const bloomDelay = starsData[off + 10];
            const bloomFactor = Math.max(0, Math.min(1, (t - bloomDelay) * 1.5));
            
            if (bloomFactor >= 0.2 && dSq < grabDistSq) {
              if (connectedLen < connectedBuf.length) {
                connectedBuf[connectedLen++] = i;
              }
              const dist = Math.sqrt(dSq);
              // Intensity falloff power aligned with docs (8)
              const hoverBoost = Math.pow(1 - dist / grabDist, 8) * 0.4;
              starsData[off + 9] = Math.min(1.0, starsData[off + 9] + hoverBoost);
              
              ctx.moveTo(mouseFollow.x, mouseFollow.y);
              ctx.lineTo(sx, sy);
            }
          }
          i = gridNext[i];
        }
      }
    }
    ctx.strokeStyle = config.isDark ? `hsla(200, 60%, 80%, 0.18)` : `hsla(220, 55%, 50%, 0.12)`;
    ctx.stroke();

    // Connect grabbed stars (Sparse Web)
    ctx.beginPath();
    ctx.lineWidth = config.isDark ? 0.4 : 0.3;
    for (let i = 0; i < connectedLen; i++) {
      let connections = 0;
      for (let j = i + 1; j < connectedLen && connections < 2; j++) {
        const offI = connectedBuf[i] * STAR_STRIDE;
        const offJ = connectedBuf[j] * STAR_STRIDE;
        const zI = starsData[offI + 2], zJ = starsData[offJ + 2];
        const six = starsData[offI + 0] + mxOffset * zI * 0.6, siy = starsData[offI + 1] + myOffset * zI * 0.6;
        const sjx = starsData[offJ + 0] + mxOffset * zJ * 0.6, sjy = starsData[offJ + 1] + myOffset * zJ * 0.6;
        const dx = six - sjx, dy = siy - sjy, dSq = dx * dx + dy * dy;
        
        if (dSq < (grabDist * 0.8) ** 2) {
          ctx.moveTo(six, siy);
          ctx.lineTo(sjx, sjy);
          connections++;
        }
      }
    }
    ctx.strokeStyle = config.isDark ? `hsla(200, 50%, 75%, 0.1)` : `hsla(220, 50%, 55%, 0.08)`;
    ctx.stroke();
  }

  // --- Traveling Pulses ---
  for (const p of pulses) {
    const px = p.x1 + (p.x2 - p.x1) * p.progress;
    const py = p.y1 + (p.y2 - p.y1) * p.progress;
    ctx.fillStyle = config.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 100, 255, 0.2)';
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }

  // --- Stars ---
  for (let i = 0; i < starCount; i++) {
    const off = i * STAR_STRIDE;
    const z = starsData[off + 2];
    const delay = starsData[off + 10];
    const bloomFactor = Math.max(0, Math.min(1, (t - delay) * 1.5));
    if (bloomFactor < 0.01) continue;

    const twinkle = Math.sin(t * starsData[off + 5] + starsData[off + 6]);
    let alpha = starsData[off + 4] * (z > 0.85 ? (0.55 + 0.45 * twinkle) : (0.5 + 0.5 * twinkle));
    alpha = (alpha * bloomFactor) + starsData[off + 9] * 0.5;
    if (alpha < 0.03) continue;

    const sx = starsData[off + 0] + mxOffset * z * 0.6;
    const sy = starsData[off + 1] + myOffset * z * 0.6;

    if (starSprites) {
      const type = starsData[off + 8];
      const useGlow = z > 0.5;
      const spriteX = type * SPRITE_SIZE;
      const spriteY = (config.isDark ? 0 : useGlow ? 2 : 1) * SPRITE_SIZE;
      ctx.globalAlpha = alpha;
      ctx.drawImage(starSprites, spriteX, spriteY, SPRITE_SIZE, SPRITE_SIZE, sx - SPRITE_SIZE/2, sy - SPRITE_SIZE/2, SPRITE_SIZE, SPRITE_SIZE);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.beginPath(); ctx.arc(sx, sy, starsData[off + 3], 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${starsData[off + 7]}, 30%, 95%, ${alpha})`; ctx.fill();
    }
  }

  // --- Shooting Stars ---
  for (const s of shootingStars) {
    if (!s.active) continue;
    const p = 1 - (s.life / s.maxLife);
    const fadeIn = Math.min(1, p / 0.15);
    const fadeOut = (1 - p);
    const alpha = fadeIn * fadeOut;
    const length = 60 + Math.random() * 40;
    const tailX = s.x - s.vx * (length / 20) * (1 - p * 0.5);
    const tailY = s.y - s.vy * (length / 20) * (1 - p * 0.5);

    ctx.strokeStyle = config.isDark ? `hsla(200, 80%, 95%, ${alpha * 0.5})` : `hsla(220, 70%, 50%, ${alpha * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = config.isDark ? `hsla(200, 80%, 100%, ${alpha})` : `hsla(220, 70%, 45%, ${alpha})`;
    ctx.fill();
  }

  animationRunning = true;
  requestAnimationFrame(draw);
}

// --- Message Handling ---
self.onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'init':
      canvas = data.canvas;
      config.width = data.width; config.height = data.height;
      config.isDark = data.isDark; config.prefersReducedMotion = data.prefersReducedMotion;
      const dpr = data.dpr || 1;
      canvas!.width = Math.round(config.width * dpr);
      canvas!.height = Math.round(config.height * dpr);
      ctx = canvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createSprites();
      initStars(config.width, config.height);
      initTime = performance.now();
      if (!animationRunning) {
        animationRunning = true;
        requestAnimationFrame(draw);
      }
      break;
    case 'resize':
      config.width = data.width; config.height = data.height;
      const dprR = data.dpr || 1;
      if (canvas) {
        canvas.width = Math.round(config.width * dprR);
        canvas.height = Math.round(config.height * dprR);
        ctx?.setTransform(dprR, 0, 0, dprR, 0, 0);
      }
      initStars(config.width, config.height);
      break;
    case 'mouse':
      mouse.x = data.x; mouse.y = data.y;
      break;
    case 'theme':
      config.isDark = data.isDark;
      createSprites();
      break;
    case 'reducedMotion':
      config.prefersReducedMotion = data.prefersReducedMotion;
      break;
    case 'resume':
      // Tab became visible again - restart the animation loop if it died
      if (!animationRunning && ctx) {
        animationRunning = true;
        requestAnimationFrame(draw);
      }
      break;
  }
};

