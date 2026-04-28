export function formatTemp(c: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? Math.round(c) : Math.round(c * 9 / 5 + 32);
}

export function convertTemp(c: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? c : Math.round((c * 9 / 5 + 32) * 100) / 100;
}
