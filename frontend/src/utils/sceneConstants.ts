import { seededRng } from './seededRng';

export const VW = 400;
export const VH = 500;
export const CLOUD_BELLY = 135;
export const SNOW_SWAY = 40;

export const CLOUD_LERP = 0.04;
export const BODY_LERP = 0.03;
export const STAR_FADE_RATE = 1 / 240;
export const WIND_BASE = 0.38;
export const SPLASH_GRAVITY = 0.38;
export const SPLASH_DECAY = 0.04;
export const RAIN_WIND_SCALE = 0.07;

function makeCloudPath(i: number): string {
  const h = 87 + i * 20, a = h + 52 + i * 8, w = VW;
  return `M${-w},0 ${w},0 Q${w*1.6},${h*0.55} ${w},${h} Q${w*.5},${a} 0,${h} Q${-w*.5},${a} ${-w},${h} Q${-w*1.6},${h*0.55} ${-w},0`;
}
export const CLOUD_PATHS = [0, 1, 2].map(makeCloudPath);

export const CARD_BG: Record<string, string> = {
  sun: '#ccccff', cloud: '#DAE3FD', rain: '#B8BCC4',
  drizzle: '#E4EAF4', snow: '#DAE3FD', thunder: '#6E7380', default: '#DAE3FD',
};

export const CARD_BG_NIGHT: Record<string, string> = {
  sun: '#2d3460', cloud: '#2a3258', rain: '#252f52',
  drizzle: '#2b3360', snow: '#2c3462', thunder: '#1e2448', default: '#2d3460',
};

export const CLOUD_FILLS = ['#efefef', '#E6E6E6', '#D5D5D5'];
export const CLOUD_FILLS_THUNDER = ['#9FA4AD', '#8B8E98', '#7B7988'];
export const CLOUD_FILLS_NIGHT = [
  'rgba(115,135,205,0.72)',
  'rgba(100,118,186,0.76)',
  'rgba(85,102,168,0.80)',
];

export const CARD_STARS = (() => {
  const rng = seededRng(11);
  return Array.from({ length: 38 }, () => {
    const cross = rng() < 0.35;
    return {
      x: rng() * VW,
      y: rng() * VH * 0.94,
      r: cross ? 3.5 + rng() * 3.5 : 1.4 + rng() * 2.2,
      phase: rng() * Math.PI * 2,
      speed: 0.009 + rng() * 0.015,
      cross,
    };
  });
})();

export function draw4PointStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, outerR: number,
): void {
  const innerR = outerR * 0.18;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI / 4) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

export function resolveType(c: string): string {
  const lc = c.toLowerCase();
  if (lc === 'clear') return 'sun';
  if (lc === 'clouds') return 'cloud';
  if (lc === 'rain') return 'rain';
  if (lc === 'drizzle') return 'drizzle';
  if (lc === 'snow') return 'snow';
  if (lc === 'thunderstorm') return 'thunder';
  return 'cloud';
}

export interface SceneAnimState {
  type: string;
  cloudOff: number[];
  cloudSlide: number;
  cloudsHidden: boolean;
  sunY: number;
  sunTargetY: number;
  moonY: number;
  moonTargetY: number;
  isNight: boolean;
  starTime: number;
  starFadeIn: number;
  windSpeed: number;
  cloudBase: number;
  rain: RainDrop[];
  innerSnow: InnerSnow[];
  fadingSnow: FadingSnow[];
  splashes: Splash[];
  windLeavesIn: WindLeaf[];
  windLeavesOut: WindLeaf[];
}

export interface RainDrop {
  x: number; y: number; len: number; speed: number; op: number; w: number; vx: number;
}
export interface WindLeaf {
  x: number; y: number; vx: number; vy: number;
  phase: number; phaseSpeed: number; rot: number; rotSpeed: number;
  size: number; color: string; escapes: boolean;
}
export interface InnerSnow {
  baseX: number; x: number; y: number; r: number; speed: number;
  scale: number; fs: number; phase: number; ps: number;
}
export interface FadingSnow {
  x: number; y: number; baseX: number;
  r: number; speed: number;
  phase: number; phaseSpeed: number;
  swayPx: number; windVxPx: number;
  cardBottom: number;
  cardLeft: number;
  cardRight: number;
  fadeDistance: number;
}
export interface Splash {
  x: number; y: number; vx: number; vy: number; r: number; alpha: number; storm: boolean;
}
