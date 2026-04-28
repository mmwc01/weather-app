import { CARD_BG, CARD_BG_NIGHT } from './sceneConstants';

export { CARD_BG, CARD_BG_NIGHT };

const SCENE_CONDITIONS = new Set([
  'clear', 'clouds', 'rain', 'drizzle', 'snow', 'thunderstorm',
]);

export function resolveCardBg(condition: string | null, night: boolean): string {
  const bg = night ? CARD_BG_NIGHT : CARD_BG;
  if (!condition) return bg.default;
  const c = condition.toLowerCase();
  if (c === 'clear') return bg.sun;
  if (c === 'thunderstorm') return bg.thunder;
  if (c === 'rain') return bg.rain;
  if (c === 'drizzle') return bg.drizzle;
  if (c === 'snow') return bg.snow;
  return bg.cloud;
}

export function hasScene(condition: string | null): boolean {
  return condition !== null && SCENE_CONDITIONS.has(condition.toLowerCase());
}
