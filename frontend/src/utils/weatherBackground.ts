export type DayKind = 'cloud' | 'rain' | 'drizzle' | 'snow' | 'thunder';

export interface DayCfg {
  kind: DayKind;
  windFactor: number;
  windSpeed: number;
  flashTrigger?: number;
}

export function resolveKind(t: string): DayKind {
  if (t === 'rain') return 'rain';
  if (t === 'drizzle') return 'drizzle';
  if (t === 'snow') return 'snow';
  if (t === 'thunderstorm') return 'thunder';
  return 'cloud';
}

export function resolveCondition(condition: string): string {
  const c = condition.toLowerCase();
  if (c === 'clear') return 'clear';
  if (c === 'clouds') return 'clouds';
  if (c === 'rain') return 'rain';
  if (c === 'drizzle') return 'drizzle';
  if (c === 'snow') return 'snow';
  if (c === 'thunderstorm') return 'thunderstorm';
  if (['mist', 'smoke', 'haze', 'dust', 'fog', 'sand', 'ash', 'squall', 'tornado'].includes(c)) return 'fog';
  return 'default';
}

export const CLOUD_TYPES = new Set(['clouds', 'rain', 'drizzle', 'snow', 'thunderstorm']);
export const DENSE_NIGHT = new Set(['rain', 'thunderstorm']);
export const NIGHT_STARS_OK = new Set(['clear', 'rain', 'drizzle', 'snow', 'default']);
