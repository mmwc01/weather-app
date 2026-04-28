import {
  VW, VH, CLOUD_BELLY, SNOW_SWAY, SPLASH_GRAVITY, SPLASH_DECAY, RAIN_WIND_SCALE,
  CARD_STARS, draw4PointStar,
  type SceneAnimState,
} from './sceneConstants';

export const LEAF_COLORS = [
  'rgba(38, 92, 28, 0.92)',
  'rgba(62, 128, 46, 0.88)',
  'rgba(92, 160, 68, 0.84)',
];

export interface FrameMetrics {
  dpr: number;
  cardW: number;
  cardH: number;
  sliceS: number;
  csS: number;
  sOX: number;
  sOY: number;
  FLOOR: number;
  visXMin: number;
  visXMax: number;
  mobileFactor: number;
  cX: (x: number) => number;
  cY: (y: number) => number;
}

export function drawLeaf(c: CanvasRenderingContext2D, ls: number, dpr: number) {
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(ls * 0.35, -ls * 0.55, ls * 0.88, -ls * 0.38, ls, 0);
  c.bezierCurveTo(ls * 0.88, ls * 0.38, ls * 0.35, ls * 0.55, 0, 0);
  c.fill();
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(ls * 0.92, 0);
  c.strokeStyle = 'rgba(20, 60, 12, 0.40)';
  c.lineWidth = 0.65 * dpr;
  c.stroke();
}

export function drawStars(
  ctx: CanvasRenderingContext2D,
  s: SceneAnimState,
  fm: FrameMetrics,
) {
  if (!s.isNight || s.type !== 'sun') return;
  const { csS, cX, cY } = fm;
  const moonCX = VW / 2;
  const moonCY = s.moonY;

  s.starTime += 1;
  s.starFadeIn = Math.min(1, s.starFadeIn + (1 / 240));

  ctx.save();
  for (const star of CARD_STARS) {
    const dx = star.x - moonCX, dy = star.y - moonCY;
    if (dx * dx + dy * dy < 78 * 78) continue;
    const tw = 0.5 + 0.5 * Math.sin(star.phase + s.starTime * star.speed);
    const alpha = (0.08 + tw * 0.90) * s.starFadeIn;
    const r = star.r * csS * (0.65 + tw * 0.55);
    ctx.fillStyle = `rgba(255,245,160,${alpha})`;
    const sx = cX(star.x), sy = cY(star.y);
    if (star.cross) draw4PointStar(ctx, sx, sy, r);
    else { ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

export function drawRain(
  ctx: CanvasRenderingContext2D,
  s: SceneAnimState,
  fm: FrameMetrics,
) {
  const { dpr, cardW, sliceS, sOX, sOY, FLOOR, visXMin, visXMax, mobileFactor, cX, cY } = fm;
  const storm = s.type === 'thunder';
  const drizzle = s.type === 'drizzle';
  const maxDrops = Math.round((storm ? 65 : drizzle ? 10 : 22) * mobileFactor);
  const windVx = s.windSpeed > 7 ? (s.windSpeed - 7) * RAIN_WIND_SCALE : 0;

  while (s.rain.length < maxDrops) {
    s.rain.push({
      x: visXMin + Math.random() * (visXMax - visXMin),
      y: s.cloudBase + CLOUD_BELLY + Math.random() * 40,
      len: storm ? 28 : 14, speed: 6 + Math.random() * 5,
      op: 0.35 + Math.random() * 0.45, w: Math.random() * 3,
      vx: windVx * (0.8 + Math.random() * 0.4),
    });
  }

  ctx.save();
  for (let i = s.rain.length - 1; i >= 0; i--) {
    const d = s.rain[i];
    d.y += d.speed; d.x += d.vx;
    if (d.y + d.len >= FLOOR || d.x > visXMax + 10 || d.x < visXMin - 10) {
      if (d.w > 2 && d.y + d.len >= FLOOR) {
        const impX = Math.max(0, Math.min(cardW, d.x * sliceS + sOX));
        const impY = FLOOR * sliceS + sOY - 12;
        const count = 3 + Math.floor(Math.random() * 3);
        for (let k = 0; k < count; k++) {
          const ang = -Math.PI * (0.08 + Math.random() * 0.84);
          const spd = (storm ? 2.8 : 1.8) + Math.random() * 2.5;
          s.splashes.push({
            x: impX, y: impY,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            r: 1.2 + Math.random() * 1.8, alpha: 0.60 + Math.random() * 0.30, storm,
          });
        }
      }
      s.rain.splice(i, 1);
      continue;
    }
    ctx.lineWidth = d.w * dpr;
    ctx.strokeStyle = `rgba(80,130,210,${d.op})`;
    ctx.beginPath();
    ctx.moveTo(cX(d.x - d.vx * 2.5), cY(d.y));
    ctx.lineTo(cX(d.x),               cY(d.y + d.len));
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSplashes(ctx: CanvasRenderingContext2D, s: SceneAnimState, dpr: number) {
  if (s.splashes.length === 0) return;
  ctx.save();
  for (let i = s.splashes.length - 1; i >= 0; i--) {
    const sp = s.splashes[i];
    sp.vy += SPLASH_GRAVITY; sp.x += sp.vx; sp.y += sp.vy; sp.alpha -= SPLASH_DECAY;
    if (sp.alpha <= 0) { s.splashes.splice(i, 1); continue; }
    ctx.beginPath();
    ctx.arc(sp.x * dpr, sp.y * dpr, sp.r * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(70,130,210,${sp.alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

export function drawSnow(
  ctx: CanvasRenderingContext2D,
  octx: CanvasRenderingContext2D,
  s: SceneAnimState,
  fm: FrameMetrics,
  canvas: HTMLCanvasElement,
) {
  const { dpr, sliceS, sOX, sOY, FLOOR, visXMin, visXMax, mobileFactor, cX, cY } = fm;
  const maxSnow = Math.round(28 * mobileFactor);
  const snowWindVx = Math.max(0, s.windSpeed - 7) * 0.06;
  const snowWindVxPx = snowWindVx * sliceS;

  while (s.innerSnow.length < maxSnow) {
    const fs = 0.4 + Math.random() * 0.4;
    const bx = visXMin + 10 + Math.random() * Math.max(0, visXMax - visXMin - 20);
    s.innerSnow.push({
      baseX: bx, x: bx, y: s.cloudBase + CLOUD_BELLY + Math.random() * 50,
      r: 4 + Math.random() * 3, speed: 0.4 + Math.random() * 0.8,
      scale: 0, fs, phase: Math.random() * Math.PI * 2,
      ps: 0.007 + Math.random() * 0.008,
    });
  }

  const canvasRect = canvas.getBoundingClientRect();
  const cardBottom = canvasRect.bottom;
  const cardLeft = canvasRect.left;
  const cardRight = canvasRect.right;

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (let i = s.innerSnow.length - 1; i >= 0; i--) {
    const f = s.innerSnow[i];
    f.y += f.speed; f.phase += f.ps; f.baseX += snowWindVx;
    f.x = f.baseX + SNOW_SWAY * Math.sin(f.phase);
    if (f.scale < f.fs) f.scale = Math.min(f.fs, f.scale + 0.015);
    ctx.beginPath();
    ctx.arc(cX(f.x), cY(f.y), f.r * f.scale * dpr, 0, Math.PI * 2);
    ctx.fill();

    const exitedBottom = f.y > FLOOR;
    const exitedLeft   = f.x < visXMin;
    const exitedRight  = f.x > visXMax;

    if (exitedBottom || exitedLeft || exitedRight) {
      const fadeDist   = Math.random() < 0.30 ? 30 : 20;
      const screenX    = canvasRect.left + f.x    * sliceS + sOX;
      const screenBaseX= canvasRect.left + f.baseX * sliceS + sOX;
      const screenY    = exitedBottom
        ? cardBottom
        : canvasRect.top + f.y * sliceS + sOY;
      s.fadingSnow.push({
        x: screenX, y: screenY, baseX: screenBaseX,
        r: f.r * f.scale,
        speed: f.speed * sliceS,
        phase: f.phase, phaseSpeed: f.ps,
        swayPx: SNOW_SWAY * sliceS,
        windVxPx: snowWindVxPx,
        cardBottom, cardLeft, cardRight,
        fadeDistance: fadeDist,
      });
      s.innerSnow.splice(i, 1);
    }
  }
  ctx.restore();

  octx.save();
  for (let i = s.fadingSnow.length - 1; i >= 0; i--) {
    const f = s.fadingSnow[i];
    f.y += f.speed; f.phase += f.phaseSpeed; f.baseX += f.windVxPx;
    f.x = f.baseX + f.swayPx * Math.sin(f.phase);
    const distPast = Math.max(0, f.y - f.cardBottom, f.cardLeft - f.x, f.x - f.cardRight);
    const alpha = Math.max(0, (1 - distPast / f.fadeDistance) * 0.92);
    if (alpha <= 0) { s.fadingSnow.splice(i, 1); continue; }
    octx.beginPath();
    octx.arc(f.x * dpr, f.y * dpr, f.r * dpr, 0, Math.PI * 2);
    octx.fillStyle = `rgba(255,255,255,${alpha})`;
    octx.fill();
  }
  octx.restore();
}

export function drawWindLeaves(
  ctx: CanvasRenderingContext2D,
  octx: CanvasRenderingContext2D,
  s: SceneAnimState,
  fm: FrameMetrics,
  canvas: HTMLCanvasElement,
) {
  const { dpr, sliceS, sOY, FLOOR, visXMax, mobileFactor, csS, cX, cY } = fm;
  const intensity = Math.min((s.windSpeed - 7) / 19, 1);
  const baseVx = 1.8 + intensity * 3.5;
  const baseVy = 0.9 - intensity * 1.4;
  const maxIn = Math.max(1, Math.round((2 + intensity) * mobileFactor));

  while (s.windLeavesIn.length < maxIn) {
    s.windLeavesIn.push({
      x: -(2 + Math.random() * 12), y: 30 + Math.random() * Math.max(0, Math.min(FLOOR, VH) - 60),
      vx: baseVx * (0.7 + Math.random() * 0.6), vy: baseVy + (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2, phaseSpeed: 0.018 + Math.random() * 0.028,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.028 + Math.random() * 0.048),
      size: 14 + Math.random() * 14, color: LEAF_COLORS[Math.floor(Math.random() * 3)],
      escapes: Math.random() < 0.30,
    });
  }

  const rect = canvas.getBoundingClientRect();
  ctx.save();
  for (let i = s.windLeavesIn.length - 1; i >= 0; i--) {
    const l = s.windLeavesIn[i];
    l.x += l.vx; l.phase += l.phaseSpeed;
    l.y += l.vy + Math.sin(l.phase) * 0.4; l.rot += l.rotSpeed;
    if (l.x >= visXMax) {
      if (l.escapes) {
        s.windLeavesOut.push({
          x: rect.right, y: rect.top + l.y * sliceS + sOY,
          vx: l.vx * sliceS, vy: l.vy * sliceS,
          phase: l.phase, phaseSpeed: l.phaseSpeed,
          rot: l.rot, rotSpeed: l.rotSpeed,
          size: l.size * sliceS, color: l.color, escapes: true,
        });
      }
      s.windLeavesIn.splice(i, 1);
      continue;
    }
    const ls = l.size * csS;
    ctx.save(); ctx.translate(cX(l.x), cY(l.y)); ctx.rotate(l.rot);
    ctx.fillStyle = l.color; drawLeaf(ctx, ls, dpr); ctx.restore();
  }
  ctx.restore();

  octx.save();
  for (let i = s.windLeavesOut.length - 1; i >= 0; i--) {
    const l = s.windLeavesOut[i];
    l.x += l.vx; l.phase += l.phaseSpeed;
    l.y += l.vy + Math.sin(l.phase) * 0.4 * sliceS; l.rot += l.rotSpeed;
    if (l.x > window.innerWidth + 25) { s.windLeavesOut.splice(i, 1); continue; }
    const ls = l.size * dpr;
    octx.save(); octx.translate(l.x * dpr, l.y * dpr); octx.rotate(l.rot);
    octx.fillStyle = l.color; drawLeaf(octx, ls, dpr); octx.restore();
  }
  octx.restore();
}
